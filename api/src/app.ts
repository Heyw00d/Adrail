import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { z } from 'zod';
import { db, publishers, advertisers } from './db/index.js';
import { eq, or } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { publisherRoutes } from './routes/publishers.js';
import { advertiserRoutes } from './routes/advertisers.js';
import { escrowRoutes } from './routes/escrows.js';
import { impressionRoutes } from './routes/impressions.js';
import { paymentRoutes } from './routes/payments.js';
import { authMiddleware } from './middleware/auth.js';
import { getEscrowWalletInfo, x402Config } from './services/x402.js';
import { verifyWalletSignature, getSignatureMessage } from './services/signature.js';
import { generateVerifyToken, sendVerificationEmail } from './services/email.js';

export const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', cors());

// Health check (public)
app.get('/', (c) => {
  return c.json({
    name: 'AdRail API',
    version: '0.1.0',
    status: 'ok',
    description: 'Payment rails for agent advertising',
    docs: 'https://docs.adrail.ai',
    endpoints: {
      publishers: '/v1/publishers',
      advertisers: '/v1/advertisers', 
      escrows: '/v1/escrows',
      impressions: '/v1/impressions',
      payments: '/v1/payments'
    }
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// x402 payment info (public)
app.get('/v1/x402/info', async (c) => {
  const wallet = await getEscrowWalletInfo();
  return c.json({
    protocol: 'x402',
    version: '1.0',
    testnet: x402Config.isTestnet,
    facilitator: x402Config.facilitator,
    network: x402Config.chain,
    networkName: x402Config.chainName,
    asset: 'USDC',
    usdcAddress: x402Config.usdcAddress,
    payTo: x402Config.escrowWallet,
    escrowBalance: wallet.balance_usdc,
    docs: 'https://docs.adrail.ai'
  });
});

// ========== PUBLIC REGISTRATION ENDPOINTS ==========

const CreatePublisherSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  domain: z.string().optional(),
  wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM address'),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid signature format'),
  metadata: z.record(z.any()).optional()
});

const CreateAdvertiserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM address'),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid signature format'),
  metadata: z.record(z.any()).optional()
});

// Get signature message (for frontend to know what to sign)
app.get('/v1/signature-message', (c) => {
  const name = c.req.query('name');
  if (!name) {
    return c.json({ error: 'name query parameter required' }, 400);
  }
  return c.json({ message: getSignatureMessage(name) });
});

// Public: Register publisher
app.post('/v1/publishers/register', async (c) => {
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
    api_key: publisher.apiKey,
    created_at: publisher.createdAt,
    message: 'Check your email to verify your account'
  }, 201);
});

// Public: Register advertiser
app.post('/v1/advertisers/register', async (c) => {
  const body = await c.req.json();
  const parsed = CreateAdvertiserSchema.safeParse(body);
  
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

  const id = `adv_${nanoid(12)}`;
  const apiKey = `ak_${nanoid(24)}`;
  const emailVerifyToken = generateVerifyToken();

  const [advertiser] = await db.insert(advertisers).values({
    id,
    name: parsed.data.name,
    email: parsed.data.email,
    emailVerifyToken,
    company: parsed.data.company,
    walletAddress: parsed.data.wallet_address,
    apiKey,
    metadata: parsed.data.metadata
  }).returning();

  // Send verification email
  await sendVerificationEmail(parsed.data.email, parsed.data.name, emailVerifyToken, 'advertiser');

  console.log(`[Advertiser] Created ${id}: ${parsed.data.name} (${parsed.data.email})`);

  return c.json({
    id: advertiser.id,
    name: advertiser.name,
    email: advertiser.email,
    email_verified: advertiser.emailVerified,
    company: advertiser.company,
    wallet_address: advertiser.walletAddress,
    api_key: advertiser.apiKey,
    created_at: advertiser.createdAt,
    message: 'Check your email to verify your account'
  }, 201);
});

// Public: Verify email
app.post('/v1/verify-email', async (c) => {
  const body = await c.req.json();
  const { token, type } = body;

  if (!token || !type) {
    return c.json({ error: 'token and type required' }, 400);
  }

  if (type === 'publisher') {
    const [publisher] = await db.select()
      .from(publishers)
      .where(eq(publishers.emailVerifyToken, token))
      .limit(1);

    if (!publisher) {
      return c.json({ error: 'Invalid or expired verification token' }, 404);
    }

    if (publisher.emailVerified) {
      return c.json({ message: 'Email already verified', verified: true });
    }

    await db.update(publishers)
      .set({ emailVerified: true, emailVerifyToken: null })
      .where(eq(publishers.id, publisher.id));

    console.log(`[Publisher] Email verified: ${publisher.id} (${publisher.email})`);
    return c.json({ message: 'Email verified successfully', verified: true });
  }

  if (type === 'advertiser') {
    const [advertiser] = await db.select()
      .from(advertisers)
      .where(eq(advertisers.emailVerifyToken, token))
      .limit(1);

    if (!advertiser) {
      return c.json({ error: 'Invalid or expired verification token' }, 404);
    }

    if (advertiser.emailVerified) {
      return c.json({ message: 'Email already verified', verified: true });
    }

    await db.update(advertisers)
      .set({ emailVerified: true, emailVerifyToken: null })
      .where(eq(advertisers.id, advertiser.id));

    console.log(`[Advertiser] Email verified: ${advertiser.id} (${advertiser.email})`);
    return c.json({ message: 'Email verified successfully', verified: true });
  }

  return c.json({ error: 'Invalid type - must be publisher or advertiser' }, 400);
});

// Also support GET for email links
app.get('/v1/verify-email', async (c) => {
  const token = c.req.query('token');
  const type = c.req.query('type');

  if (!token || !type) {
    return c.json({ error: 'token and type query parameters required' }, 400);
  }

  // Redirect to a nice verification page (or handle inline)
  if (type === 'publisher') {
    const [publisher] = await db.select()
      .from(publishers)
      .where(eq(publishers.emailVerifyToken, token))
      .limit(1);

    if (!publisher) {
      return c.redirect('https://adrail.ai/signup?error=invalid_token');
    }

    await db.update(publishers)
      .set({ emailVerified: true, emailVerifyToken: null })
      .where(eq(publishers.id, publisher.id));

    return c.redirect('https://adrail.ai/signup?verified=true&type=publisher');
  }

  if (type === 'advertiser') {
    const [advertiser] = await db.select()
      .from(advertisers)
      .where(eq(advertisers.emailVerifyToken, token))
      .limit(1);

    if (!advertiser) {
      return c.redirect('https://adrail.ai/signup?error=invalid_token');
    }

    await db.update(advertisers)
      .set({ emailVerified: true, emailVerifyToken: null })
      .where(eq(advertisers.id, advertiser.id));

    return c.redirect('https://adrail.ai/signup?verified=true&type=advertiser');
  }

  return c.redirect('https://adrail.ai/signup?error=invalid_type');
});

// ========== PROTECTED API ROUTES ==========

const api = new Hono();
api.use('*', authMiddleware);

api.route('/publishers', publisherRoutes);
api.route('/advertisers', advertiserRoutes);
api.route('/escrows', escrowRoutes);
api.route('/impressions', impressionRoutes);
api.route('/payments', paymentRoutes);

app.route('/v1', api);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found', status: 404 }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({ error: err.message, status: 500 }, 500);
});
