import { Hono } from 'hono';
import { z } from 'zod';
import { db, advertisers, escrows } from '../db/index.js';
import { eq, desc, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const advertiserRoutes = new Hono();

const CreateAdvertiserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM address'),
  metadata: z.record(z.any()).optional()
});

/**
 * POST /v1/advertisers
 * Register a new advertiser (public endpoint)
 */
advertiserRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = CreateAdvertiserSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const id = `adv_${nanoid(12)}`;
  const apiKey = `ak_${nanoid(24)}`;

  const [advertiser] = await db.insert(advertisers).values({
    id,
    name: parsed.data.name,
    email: parsed.data.email,
    walletAddress: parsed.data.wallet_address,
    apiKey,
    metadata: parsed.data.metadata
  }).returning();

  console.log(`[Advertiser] Created ${id}: ${parsed.data.name}`);

  return c.json({
    id: advertiser.id,
    name: advertiser.name,
    email: advertiser.email,
    wallet_address: advertiser.walletAddress,
    api_key: advertiser.apiKey, // Only returned once at creation
    created_at: advertiser.createdAt
  }, 201);
});

/**
 * GET /v1/advertisers/me
 * Get current advertiser info
 */
advertiserRoutes.get('/me', async (c) => {
  const auth = c.get('auth');
  
  if (auth.type !== 'advertiser') {
    return c.json({ error: 'This endpoint is for advertisers only' }, 403);
  }

  const [advertiser] = await db.select().from(advertisers).where(eq(advertisers.id, auth.id)).limit(1);
  
  if (!advertiser) {
    return c.json({ error: 'Advertiser not found' }, 404);
  }

  return c.json({
    id: advertiser.id,
    name: advertiser.name,
    email: advertiser.email,
    wallet_address: advertiser.walletAddress,
    metadata: advertiser.metadata,
    created_at: advertiser.createdAt
  });
});

/**
 * GET /v1/advertisers/me/escrows
 * Get all escrows for this advertiser
 */
advertiserRoutes.get('/me/escrows', async (c) => {
  const auth = c.get('auth');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');
  
  if (auth.type !== 'advertiser') {
    return c.json({ error: 'This endpoint is for advertisers only' }, 403);
  }

  const escrowList = await db.select()
    .from(escrows)
    .where(eq(escrows.advertiserId, auth.id))
    .orderBy(desc(escrows.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    escrows: escrowList.map(e => ({
      id: e.id,
      amount_usdc: e.amountUsdc / 100,
      balance_usdc: e.balanceUsdc / 100,
      status: e.status,
      tx_hash: e.txHash,
      expires_at: e.expiresAt,
      created_at: e.createdAt
    })),
    limit,
    offset
  });
});

/**
 * GET /v1/advertisers/me/stats
 * Get advertiser spending stats
 */
advertiserRoutes.get('/me/stats', async (c) => {
  const auth = c.get('auth');
  
  if (auth.type !== 'advertiser') {
    return c.json({ error: 'This endpoint is for advertisers only' }, 403);
  }

  const [stats] = await db.select({
    total_funded: sql<number>`COALESCE(SUM(amount_usdc), 0)`,
    total_remaining: sql<number>`COALESCE(SUM(balance_usdc), 0)`,
    escrow_count: sql<number>`COUNT(*)`,
    active_escrows: sql<number>`COUNT(*) FILTER (WHERE status = 'active')`
  }).from(escrows).where(eq(escrows.advertiserId, auth.id));

  return c.json({
    advertiser_id: auth.id,
    spending: {
      total_funded_usdc: (stats?.total_funded || 0) / 100,
      total_spent_usdc: ((stats?.total_funded || 0) - (stats?.total_remaining || 0)) / 100,
      total_remaining_usdc: (stats?.total_remaining || 0) / 100
    },
    escrows: {
      total: stats?.escrow_count || 0,
      active: stats?.active_escrows || 0
    }
  });
});
