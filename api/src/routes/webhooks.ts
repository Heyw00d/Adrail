import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { RegisterWebhookSchema } from '../types';

export const webhookRoutes = new Hono();

// In-memory store - replace with database
const webhooks = new Map<string, any[]>();

/**
 * POST /v1/webhooks
 * Register a webhook endpoint
 */
webhookRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = RegisterWebhookSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ 
      error: 'Validation failed', 
      details: parsed.error.flatten() 
    }, 400);
  }

  const auth = c.get('auth');
  const webhookId = `wh_${nanoid(12)}`;
  
  const webhook = {
    id: webhookId,
    ...parsed.data,
    agent_id: auth.agentId,
    created_at: new Date(),
    status: 'active'
  };

  const agentWebhooks = webhooks.get(auth.agentId) || [];
  agentWebhooks.push(webhook);
  webhooks.set(auth.agentId, agentWebhooks);

  console.log(`[Webhook] Registered ${webhookId} for ${auth.agentId}: ${parsed.data.events.join(', ')}`);

  return c.json({
    id: webhookId,
    url: parsed.data.url,
    events: parsed.data.events,
    status: 'active',
    created_at: webhook.created_at.toISOString()
  }, 201);
});

/**
 * GET /v1/webhooks
 * List registered webhooks
 */
webhookRoutes.get('/', async (c) => {
  const auth = c.get('auth');
  const agentWebhooks = webhooks.get(auth.agentId) || [];

  return c.json({
    webhooks: agentWebhooks.map(wh => ({
      id: wh.id,
      url: wh.url,
      events: wh.events,
      status: wh.status,
      created_at: wh.created_at.toISOString()
    })),
    total: agentWebhooks.length
  });
});

/**
 * DELETE /v1/webhooks/:id
 * Remove a webhook
 */
webhookRoutes.delete('/:id', async (c) => {
  const webhookId = c.req.param('id');
  const auth = c.get('auth');
  
  const agentWebhooks = webhooks.get(auth.agentId) || [];
  const index = agentWebhooks.findIndex(wh => wh.id === webhookId);

  if (index === -1) {
    return c.json({ error: 'Webhook not found' }, 404);
  }

  agentWebhooks.splice(index, 1);
  webhooks.set(auth.agentId, agentWebhooks);

  console.log(`[Webhook] Deleted ${webhookId}`);

  return c.json({ deleted: true, id: webhookId });
});

/**
 * POST /v1/webhooks/:id/test
 * Send a test event to a webhook
 */
webhookRoutes.post('/:id/test', async (c) => {
  const webhookId = c.req.param('id');
  const auth = c.get('auth');
  
  const agentWebhooks = webhooks.get(auth.agentId) || [];
  const webhook = agentWebhooks.find(wh => wh.id === webhookId);

  if (!webhook) {
    return c.json({ error: 'Webhook not found' }, 404);
  }

  // Send test event
  const testEvent = {
    id: `evt_${nanoid(12)}`,
    type: 'test',
    timestamp: new Date().toISOString(),
    data: {
      message: 'This is a test event from AdRail',
      webhook_id: webhookId
    }
  };

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AdRail-Event': 'test',
        'X-AdRail-Webhook-Id': webhookId,
        ...(webhook.secret && { 'X-AdRail-Signature': signPayload(testEvent, webhook.secret) })
      },
      body: JSON.stringify(testEvent)
    });

    return c.json({
      success: response.ok,
      status_code: response.status,
      event_id: testEvent.id
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message,
      event_id: testEvent.id
    }, 500);
  }
});

// Helper for signing payloads (HMAC-SHA256)
function signPayload(payload: any, secret: string): string {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return `sha256=${hmac.digest('hex')}`;
}
