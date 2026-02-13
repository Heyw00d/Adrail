import { Hono } from 'hono';
import { z } from 'zod';
import { db, escrows, impressions, payments } from '../db/index.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const escrowRoutes = new Hono();

const CreateEscrowSchema = z.object({
  amount_usdc: z.number().positive().min(1), // minimum $1
  expires_at: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional()
});

const FundEscrowSchema = z.object({
  tx_hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash')
});

/**
 * POST /v1/escrows
 * Create a new escrow (advertisers only)
 */
escrowRoutes.post('/', async (c) => {
  const auth = c.get('auth');
  
  if (auth.type !== 'advertiser') {
    return c.json({ error: 'Only advertisers can create escrows' }, 403);
  }

  const body = await c.req.json();
  const parsed = CreateEscrowSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const id = `esc_${nanoid(12)}`;
  const amountCents = Math.round(parsed.data.amount_usdc * 100);

  const [escrow] = await db.insert(escrows).values({
    id,
    advertiserId: auth.id,
    amountUsdc: amountCents,
    balanceUsdc: 0, // Not funded yet
    status: 'pending',
    expiresAt: parsed.data.expires_at ? new Date(parsed.data.expires_at) : null,
    metadata: parsed.data.metadata
  }).returning();

  console.log(`[Escrow] Created ${id}: $${parsed.data.amount_usdc} for ${auth.id}`);

  return c.json({
    id: escrow.id,
    amount_usdc: escrow.amountUsdc / 100,
    status: escrow.status,
    payment_address: process.env.ESCROW_WALLET || '0x180560b13249d326e6dC6aa3b2D5900994e2aaBe',
    chain: 'base',
    token: 'USDC',
    instructions: 'Send USDC to payment_address, then call POST /v1/escrows/:id/fund with tx_hash',
    created_at: escrow.createdAt
  }, 201);
});

/**
 * POST /v1/escrows/:id/fund
 * Confirm escrow funding with transaction hash
 */
escrowRoutes.post('/:id/fund', async (c) => {
  const auth = c.get('auth');
  const escrowId = c.req.param('id');
  
  if (auth.type !== 'advertiser') {
    return c.json({ error: 'Only advertisers can fund escrows' }, 403);
  }

  const body = await c.req.json();
  const parsed = FundEscrowSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  // Get escrow
  const [escrow] = await db.select().from(escrows)
    .where(and(eq(escrows.id, escrowId), eq(escrows.advertiserId, auth.id)))
    .limit(1);

  if (!escrow) {
    return c.json({ error: 'Escrow not found' }, 404);
  }

  if (escrow.status !== 'pending') {
    return c.json({ error: `Escrow is already ${escrow.status}` }, 400);
  }

  // TODO: Verify transaction on-chain
  // For now, trust the tx_hash and mark as funded

  const [updated] = await db.update(escrows)
    .set({
      status: 'funded',
      balanceUsdc: escrow.amountUsdc,
      txHash: parsed.data.tx_hash,
      updatedAt: new Date()
    })
    .where(eq(escrows.id, escrowId))
    .returning();

  console.log(`[Escrow] Funded ${escrowId}: $${escrow.amountUsdc / 100} (${parsed.data.tx_hash.slice(0, 10)}...)`);

  return c.json({
    id: updated.id,
    amount_usdc: updated.amountUsdc / 100,
    balance_usdc: updated.balanceUsdc / 100,
    status: updated.status,
    tx_hash: updated.txHash,
    message: 'Escrow funded successfully. Ready to activate.'
  });
});

/**
 * POST /v1/escrows/:id/activate
 * Activate escrow for spending
 */
escrowRoutes.post('/:id/activate', async (c) => {
  const auth = c.get('auth');
  const escrowId = c.req.param('id');
  
  if (auth.type !== 'advertiser') {
    return c.json({ error: 'Only advertisers can activate escrows' }, 403);
  }

  const [escrow] = await db.select().from(escrows)
    .where(and(eq(escrows.id, escrowId), eq(escrows.advertiserId, auth.id)))
    .limit(1);

  if (!escrow) {
    return c.json({ error: 'Escrow not found' }, 404);
  }

  if (escrow.status !== 'funded') {
    return c.json({ error: `Escrow must be funded first (current: ${escrow.status})` }, 400);
  }

  const [updated] = await db.update(escrows)
    .set({ status: 'active', updatedAt: new Date() })
    .where(eq(escrows.id, escrowId))
    .returning();

  console.log(`[Escrow] Activated ${escrowId}`);

  return c.json({
    id: updated.id,
    status: updated.status,
    balance_usdc: updated.balanceUsdc / 100,
    message: 'Escrow activated. Publishers can now earn against this budget.'
  });
});

/**
 * GET /v1/escrows/:id
 * Get escrow details
 */
escrowRoutes.get('/:id', async (c) => {
  const auth = c.get('auth');
  const escrowId = c.req.param('id');

  const [escrow] = await db.select().from(escrows).where(eq(escrows.id, escrowId)).limit(1);

  if (!escrow) {
    return c.json({ error: 'Escrow not found' }, 404);
  }

  // Only owner or publishers can view
  if (auth.type === 'advertiser' && escrow.advertiserId !== auth.id) {
    return c.json({ error: 'Not authorized' }, 403);
  }

  // Get spending breakdown
  const [spending] = await db.select({
    total_impressions: sql<number>`COALESCE(SUM(count), 0)`,
    total_spent: sql<number>`COALESCE(SUM(total_usdc), 0)`
  }).from(impressions).where(eq(impressions.escrowId, escrowId));

  return c.json({
    id: escrow.id,
    advertiser_id: escrow.advertiserId,
    amount_usdc: escrow.amountUsdc / 100,
    balance_usdc: escrow.balanceUsdc / 100,
    spent_usdc: (spending?.total_spent || 0) / 100,
    status: escrow.status,
    tx_hash: escrow.txHash,
    expires_at: escrow.expiresAt,
    impressions: spending?.total_impressions || 0,
    created_at: escrow.createdAt
  });
});

/**
 * POST /v1/escrows/:id/refund
 * Request refund of remaining balance
 */
escrowRoutes.post('/:id/refund', async (c) => {
  const auth = c.get('auth');
  const escrowId = c.req.param('id');
  
  if (auth.type !== 'advertiser') {
    return c.json({ error: 'Only advertisers can request refunds' }, 403);
  }

  const [escrow] = await db.select().from(escrows)
    .where(and(eq(escrows.id, escrowId), eq(escrows.advertiserId, auth.id)))
    .limit(1);

  if (!escrow) {
    return c.json({ error: 'Escrow not found' }, 404);
  }

  if (!['funded', 'active'].includes(escrow.status)) {
    return c.json({ error: `Cannot refund escrow with status: ${escrow.status}` }, 400);
  }

  if (escrow.balanceUsdc === 0) {
    return c.json({ error: 'No balance to refund' }, 400);
  }

  // TODO: Execute refund on-chain
  const refundTxHash = `0x${nanoid(64).toLowerCase()}`;

  const [updated] = await db.update(escrows)
    .set({ 
      status: 'refunded', 
      balanceUsdc: 0,
      updatedAt: new Date() 
    })
    .where(eq(escrows.id, escrowId))
    .returning();

  console.log(`[Escrow] Refunded ${escrowId}: $${escrow.balanceUsdc / 100}`);

  return c.json({
    id: updated.id,
    refund_amount_usdc: escrow.balanceUsdc / 100,
    refund_tx_hash: refundTxHash,
    status: updated.status,
    message: 'Refund initiated'
  });
});
