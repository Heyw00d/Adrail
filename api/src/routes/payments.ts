import { Hono } from 'hono';
import { z } from 'zod';
import { db, payments, publishers, impressions, escrows } from '../db/index.js';
import { eq, and, desc, sql, isNull } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const paymentRoutes = new Hono();

/**
 * GET /v1/payments
 * Get payment history
 */
paymentRoutes.get('/', async (c) => {
  const auth = c.get('auth');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');
  const status = c.req.query('status');

  let whereClause;
  if (auth.type === 'publisher') {
    whereClause = eq(payments.publisherId, auth.id);
  }

  const results = await db.select()
    .from(payments)
    .where(whereClause)
    .orderBy(desc(payments.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    payments: results.map(p => ({
      id: p.id,
      publisher_id: p.publisherId,
      escrow_id: p.escrowId,
      amount_usdc: p.amountUsdc / 100,
      status: p.status,
      tx_hash: p.txHash,
      x402_receipt: p.x402Receipt,
      created_at: p.createdAt,
      paid_at: p.paidAt
    })),
    limit,
    offset
  });
});

/**
 * POST /v1/payments/settle
 * Trigger settlement for a publisher's pending earnings
 */
paymentRoutes.post('/settle', async (c) => {
  const auth = c.get('auth');
  
  if (auth.type !== 'publisher') {
    return c.json({ error: 'Only publishers can request settlement' }, 403);
  }

  // Get all unsettled impressions for this publisher
  const unsettled = await db.select({
    escrowId: impressions.escrowId,
    total: sql<number>`SUM(total_usdc)`,
    count: sql<number>`COUNT(*)`
  })
    .from(impressions)
    .where(eq(impressions.publisherId, auth.id))
    .groupBy(impressions.escrowId);

  if (unsettled.length === 0) {
    return c.json({ error: 'No pending earnings to settle' }, 400);
  }

  const paymentResults: any[] = [];
  let totalPaid = 0;

  for (const batch of unsettled) {
    if (!batch.total || batch.total === 0) continue;

    const id = `pay_${nanoid(12)}`;
    const txHash = `0x${nanoid(64).toLowerCase()}`; // TODO: Real x402 payment

    const [payment] = await db.insert(payments).values({
      id,
      publisherId: auth.id,
      escrowId: batch.escrowId,
      amountUsdc: batch.total,
      status: 'paid',
      txHash,
      paidAt: new Date()
    }).returning();

    paymentResults.push({
      id: payment.id,
      escrow_id: batch.escrowId,
      amount_usdc: batch.total / 100,
      tx_hash: txHash
    });

    totalPaid += batch.total;

    console.log(`[Payment] ${id}: $${batch.total / 100} to ${auth.id} (${txHash.slice(0, 10)}...)`);
  }

  return c.json({
    payments: paymentResults,
    total_paid_usdc: totalPaid / 100,
    recipient_wallet: auth.walletAddress
  });
});

/**
 * GET /v1/payments/:id
 * Get payment details
 */
paymentRoutes.get('/:id', async (c) => {
  const auth = c.get('auth');
  const paymentId = c.req.param('id');

  const [payment] = await db.select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!payment) {
    return c.json({ error: 'Payment not found' }, 404);
  }

  // Verify access
  if (auth.type === 'publisher' && payment.publisherId !== auth.id) {
    return c.json({ error: 'Not authorized' }, 403);
  }

  return c.json({
    id: payment.id,
    publisher_id: payment.publisherId,
    escrow_id: payment.escrowId,
    amount_usdc: payment.amountUsdc / 100,
    status: payment.status,
    tx_hash: payment.txHash,
    x402_receipt: payment.x402Receipt,
    metadata: payment.metadata,
    created_at: payment.createdAt,
    paid_at: payment.paidAt
  });
});

/**
 * GET /v1/payments/pending
 * Get pending earnings summary
 */
paymentRoutes.get('/pending/summary', async (c) => {
  const auth = c.get('auth');
  
  if (auth.type !== 'publisher') {
    return c.json({ error: 'Only publishers can view pending earnings' }, 403);
  }

  // Sum all impressions minus paid amounts
  const [impressionTotal] = await db.select({
    total: sql<number>`COALESCE(SUM(total_usdc), 0)`
  }).from(impressions).where(eq(impressions.publisherId, auth.id));

  const [paidTotal] = await db.select({
    total: sql<number>`COALESCE(SUM(amount_usdc), 0)`
  }).from(payments).where(
    and(eq(payments.publisherId, auth.id), eq(payments.status, 'paid'))
  );

  const pending = (impressionTotal?.total || 0) - (paidTotal?.total || 0);

  return c.json({
    pending_usdc: Math.max(0, pending) / 100,
    total_earned_usdc: (impressionTotal?.total || 0) / 100,
    total_paid_usdc: (paidTotal?.total || 0) / 100,
    wallet_address: auth.walletAddress
  });
});
