import { Hono } from 'hono';
import { z } from 'zod';
import { db, publishers, payments, impressions } from '../db/index.js';
import { eq, desc, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { verifyWalletSignature } from '../services/signature.js';
import { generateVerifyToken, sendVerificationEmail } from '../services/email.js';

export const publisherRoutes = new Hono();

const CreatePublisherSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  domain: z.string().optional(),
  wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM address'),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid signature format'),
  metadata: z.record(z.any()).optional()
});

/**
 * POST /v1/publishers
 * Register a new publisher (public endpoint)
 */
publisherRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = CreatePublisherSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  // Verify wallet signature
  const sigResult = await verifyWalletSignature(
    parsed.data.wallet_address,
    parsed.data.name,
    parsed.data.signature
  );
  
  if (!sigResult.valid) {
    return c.json({ error: sigResult.error || 'Invalid signature' }, 401);
  }

  const id = `pub_${nanoid(12)}`;
  const apiKey = `pk_${nanoid(24)}`;
  const emailVerifyToken = generateVerifyToken();

  const [publisher] = await db.insert(publishers).values({
    id,
    name: parsed.data.name,
    email: parsed.data.email,
    emailVerifyToken,
    domain: parsed.data.domain,
    walletAddress: parsed.data.wallet_address,
    apiKey,
    metadata: parsed.data.metadata
  }).returning();

  // Send verification email
  await sendVerificationEmail(parsed.data.email, parsed.data.name, emailVerifyToken, 'publisher');

  console.log(`[Publisher] Created ${id}: ${parsed.data.name} (${parsed.data.email})`);

  return c.json({
    id: publisher.id,
    name: publisher.name,
    email: publisher.email,
    email_verified: publisher.emailVerified,
    domain: publisher.domain,
    wallet_address: publisher.walletAddress,
    api_key: publisher.apiKey, // Only returned once at creation
    created_at: publisher.createdAt,
    message: 'Check your email to verify your account'
  }, 201);
});

/**
 * GET /v1/publishers/me
 * Get current publisher info
 */
publisherRoutes.get('/me', async (c) => {
  const auth = c.get('auth');
  
  if (auth.type !== 'publisher') {
    return c.json({ error: 'This endpoint is for publishers only' }, 403);
  }

  const [publisher] = await db.select().from(publishers).where(eq(publishers.id, auth.id)).limit(1);
  
  if (!publisher) {
    return c.json({ error: 'Publisher not found' }, 404);
  }

  return c.json({
    id: publisher.id,
    name: publisher.name,
    email: publisher.email,
    email_verified: publisher.emailVerified,
    domain: publisher.domain,
    wallet_address: publisher.walletAddress,
    metadata: publisher.metadata,
    created_at: publisher.createdAt
  });
});

/**
 * GET /v1/publishers/me/stats
 * Get publisher earnings and stats
 */
publisherRoutes.get('/me/stats', async (c) => {
  const auth = c.get('auth');
  
  if (auth.type !== 'publisher') {
    return c.json({ error: 'This endpoint is for publishers only' }, 403);
  }

  // Get total earnings
  const [earningsResult] = await db.select({
    total_paid: sql<number>`COALESCE(SUM(amount_usdc), 0)`,
    payment_count: sql<number>`COUNT(*)`
  }).from(payments).where(eq(payments.publisherId, auth.id));

  // Get impression stats
  const [impressionResult] = await db.select({
    total_impressions: sql<number>`COALESCE(SUM(count), 0)`,
    total_earned: sql<number>`COALESCE(SUM(total_usdc), 0)`
  }).from(impressions).where(eq(impressions.publisherId, auth.id));

  return c.json({
    publisher_id: auth.id,
    earnings: {
      total_paid_usdc: (earningsResult?.total_paid || 0) / 100, // cents to dollars
      pending_usdc: ((impressionResult?.total_earned || 0) - (earningsResult?.total_paid || 0)) / 100,
      payment_count: earningsResult?.payment_count || 0
    },
    impressions: {
      total: impressionResult?.total_impressions || 0,
      total_earned_usdc: (impressionResult?.total_earned || 0) / 100
    }
  });
});

/**
 * GET /v1/publishers/me/payments
 * Get payment history
 */
publisherRoutes.get('/me/payments', async (c) => {
  const auth = c.get('auth');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');
  
  if (auth.type !== 'publisher') {
    return c.json({ error: 'This endpoint is for publishers only' }, 403);
  }

  const paymentList = await db.select()
    .from(payments)
    .where(eq(payments.publisherId, auth.id))
    .orderBy(desc(payments.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    payments: paymentList.map(p => ({
      id: p.id,
      amount_usdc: p.amountUsdc / 100,
      status: p.status,
      tx_hash: p.txHash,
      created_at: p.createdAt,
      paid_at: p.paidAt
    })),
    limit,
    offset
  });
});
