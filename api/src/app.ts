import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { z } from 'zod';
import { db, publishers, advertisers } from './db/index.js';
import { nanoid } from 'nanoid';
import { publisherRoutes } from './routes/publishers.js';
import { advertiserRoutes } from './routes/advertisers.js';
import { escrowRoutes } from './routes/escrows.js';
import { impressionRoutes } from './routes/impressions.js';
import { paymentRoutes } from './routes/payments.js';
import { authMiddleware } from './middleware/auth.js';

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

// ========== PUBLIC REGISTRATION ENDPOINTS ==========

const CreatePublisherSchema = z.object({
  name: z.string().min(1),
  domain: z.string().optional(),
  wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM address'),
  metadata: z.record(z.any()).optional()
});

const CreateAdvertiserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM address'),
  metadata: z.record(z.any()).optional()
});

// Public: Register publisher
app.post('/v1/publishers/register', async (c) => {
  const body = await c.req.json();
  const parsed = CreatePublisherSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const id = `pub_${nanoid(12)}`;
  const apiKey = `pk_${nanoid(24)}`;

  const [publisher] = await db.insert(publishers).values({
    id,
    name: parsed.data.name,
    domain: parsed.data.domain,
    walletAddress: parsed.data.wallet_address,
    apiKey,
    metadata: parsed.data.metadata
  }).returning();

  console.log(`[Publisher] Created ${id}: ${parsed.data.name}`);

  return c.json({
    id: publisher.id,
    name: publisher.name,
    domain: publisher.domain,
    wallet_address: publisher.walletAddress,
    api_key: publisher.apiKey,
    created_at: publisher.createdAt
  }, 201);
});

// Public: Register advertiser
app.post('/v1/advertisers/register', async (c) => {
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
    api_key: advertiser.apiKey,
    created_at: advertiser.createdAt
  }, 201);
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
