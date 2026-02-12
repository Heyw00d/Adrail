import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { streamRoutes } from './routes/stream';
import { vaultRoutes } from './routes/vault';
import { webhookRoutes } from './routes/webhooks';
import { authMiddleware } from './middleware/auth';

export const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', cors());

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'AdRail API',
    version: '0.1.0',
    status: 'ok',
    docs: 'https://docs.adrail.ai'
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API routes (protected)
const api = new Hono();
api.use('*', authMiddleware);

api.route('/stream', streamRoutes);
api.route('/vault', vaultRoutes);
api.route('/webhooks', webhookRoutes);

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
