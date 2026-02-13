import { Hono } from 'hono';
import { z } from 'zod';
import { db, impressions, escrows, verifications, payments, publishers } from '../db/index.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const impressionRoutes = new Hono();

const ReportImpressionSchema = z.object({
  escrow_id: z.string(),
  count: z.number().int().positive().default(1),
  cpm_usdc: z.number().positive(), // CPM rate
  adcp_request_id: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

const BatchImpressionSchema = z.object({
  escrow_id: z.string(),
  impressions: z.array(z.object({
    count: z.number().int().positive().default(1),
    adcp_request_id: z.string().optional(),
    metadata: z.record(z.any()).optional()
  })),
  cpm_usdc: z.number().positive()
});

/**
 * POST /v1/impressions
 * Report a single impression (publishers only)
 */
impressionRoutes.post('/', async (c) => {
  const auth = c.get('auth');
  
  if (auth.type !== 'publisher') {
    return c.json({ error: 'Only publishers can report impressions' }, 403);
  }

  const body = await c.req.json();
  const parsed = ReportImpressionSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  // Verify escrow exists and is active
  const [escrow] = await db.select().from(escrows)
    .where(eq(escrows.id, parsed.data.escrow_id))
    .limit(1);

  if (!escrow) {
    return c.json({ error: 'Escrow not found' }, 404);
  }

  if (escrow.status !== 'active') {
    return c.json({ error: `Escrow is ${escrow.status}, not active` }, 400);
  }

  // Calculate cost
  const cpmCents = Math.round(parsed.data.cpm_usdc * 100);
  const totalCents = Math.round((parsed.data.count / 1000) * cpmCents);

  if (totalCents > escrow.balanceUsdc) {
    return c.json({ error: 'Insufficient escrow balance' }, 400);
  }

  const id = `imp_${nanoid(12)}`;

  // Insert impression and deduct from escrow in transaction
  const [impression] = await db.insert(impressions).values({
    id,
    escrowId: parsed.data.escrow_id,
    publisherId: auth.id,
    count: parsed.data.count,
    cpmUsdc: cpmCents,
    totalUsdc: totalCents,
    adcpRequestId: parsed.data.adcp_request_id,
    metadata: parsed.data.metadata
  }).returning();

  // Deduct from escrow
  await db.update(escrows)
    .set({ 
      balanceUsdc: sql`balance_usdc - ${totalCents}`,
      updatedAt: new Date()
    })
    .where(eq(escrows.id, parsed.data.escrow_id));

  console.log(`[Impression] ${id}: ${parsed.data.count} impressions, $${totalCents / 100} earned`);

  return c.json({
    id: impression.id,
    count: impression.count,
    earned_usdc: totalCents / 100,
    escrow_balance_usdc: (escrow.balanceUsdc - totalCents) / 100,
    created_at: impression.createdAt
  }, 201);
});

/**
 * POST /v1/impressions/batch
 * Report multiple impressions at once
 */
impressionRoutes.post('/batch', async (c) => {
  const auth = c.get('auth');
  
  if (auth.type !== 'publisher') {
    return c.json({ error: 'Only publishers can report impressions' }, 403);
  }

  const body = await c.req.json();
  const parsed = BatchImpressionSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  // Verify escrow
  const [escrow] = await db.select().from(escrows)
    .where(eq(escrows.id, parsed.data.escrow_id))
    .limit(1);

  if (!escrow || escrow.status !== 'active') {
    return c.json({ error: 'Escrow not found or not active' }, 400);
  }

  const cpmCents = Math.round(parsed.data.cpm_usdc * 100);
  let totalImpressions = 0;
  let totalCents = 0;
  const results: any[] = [];

  for (const imp of parsed.data.impressions) {
    const count = imp.count || 1;
    const cost = Math.round((count / 1000) * cpmCents);
    totalImpressions += count;
    totalCents += cost;

    const id = `imp_${nanoid(12)}`;
    results.push({
      id,
      escrowId: parsed.data.escrow_id,
      publisherId: auth.id,
      count,
      cpmUsdc: cpmCents,
      totalUsdc: cost,
      adcpRequestId: imp.adcp_request_id,
      metadata: imp.metadata
    });
  }

  if (totalCents > escrow.balanceUsdc) {
    return c.json({ error: 'Insufficient escrow balance for batch' }, 400);
  }

  // Insert all impressions
  await db.insert(impressions).values(results);

  // Deduct from escrow
  await db.update(escrows)
    .set({ 
      balanceUsdc: sql`balance_usdc - ${totalCents}`,
      updatedAt: new Date()
    })
    .where(eq(escrows.id, parsed.data.escrow_id));

  console.log(`[Impression] Batch: ${results.length} records, ${totalImpressions} impressions, $${totalCents / 100}`);

  return c.json({
    batch_size: results.length,
    total_impressions: totalImpressions,
    total_earned_usdc: totalCents / 100,
    escrow_balance_usdc: (escrow.balanceUsdc - totalCents) / 100,
    impression_ids: results.map(r => r.id)
  }, 201);
});

/**
 * GET /v1/impressions
 * Get impression history (for authenticated user)
 */
impressionRoutes.get('/', async (c) => {
  const auth = c.get('auth');
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');
  const escrowId = c.req.query('escrow_id');

  let query = db.select().from(impressions);
  
  if (auth.type === 'publisher') {
    query = query.where(eq(impressions.publisherId, auth.id)) as any;
  }

  if (escrowId) {
    query = query.where(eq(impressions.escrowId, escrowId)) as any;
  }

  const results = await query
    .orderBy(desc(impressions.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    impressions: results.map(i => ({
      id: i.id,
      escrow_id: i.escrowId,
      publisher_id: i.publisherId,
      count: i.count,
      cpm_usdc: i.cpmUsdc / 100,
      total_usdc: i.totalUsdc / 100,
      adcp_request_id: i.adcpRequestId,
      created_at: i.createdAt
    })),
    limit,
    offset
  });
});

/**
 * POST /v1/impressions/:id/verify
 * Submit oracle verification for an impression
 */
impressionRoutes.post('/:id/verify', async (c) => {
  const impressionId = c.req.param('id');
  
  const body = await c.req.json();
  const { oracle_id, score, reason, metadata } = body;

  if (!oracle_id || score === undefined) {
    return c.json({ error: 'oracle_id and score required' }, 400);
  }

  const [impression] = await db.select().from(impressions)
    .where(eq(impressions.id, impressionId))
    .limit(1);

  if (!impression) {
    return c.json({ error: 'Impression not found' }, 404);
  }

  const id = `ver_${nanoid(12)}`;
  const status = score >= 70 ? 'passed' : 'failed';

  const [verification] = await db.insert(verifications).values({
    id,
    impressionId,
    oracleId: oracle_id,
    status,
    score,
    reason,
    metadata
  }).returning();

  console.log(`[Verification] ${id}: impression ${impressionId} ${status} (score: ${score})`);

  return c.json({
    id: verification.id,
    impression_id: impressionId,
    status: verification.status,
    score: verification.score,
    reason: verification.reason
  }, 201);
});
