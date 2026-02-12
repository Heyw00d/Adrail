import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { 
  CreateStreamSchema, 
  ReportBatchSchema,
  type Stream,
  type StreamStatus 
} from '../types';
import { StreamService } from '../services/stream';

export const streamRoutes = new Hono();
const streamService = new StreamService();

/**
 * POST /v1/stream/start
 * Start a new payment stream
 */
streamRoutes.post('/start', async (c) => {
  const body = await c.req.json();
  const parsed = CreateStreamSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ 
      error: 'Validation failed', 
      details: parsed.error.flatten() 
    }, 400);
  }

  const auth = c.get('auth');
  const stream = await streamService.createStream(parsed.data, auth.agentId);

  return c.json({
    stream_id: stream.id,
    status: stream.status,
    buyer_agent: stream.buyer_agent,
    publisher_agent: stream.publisher_agent,
    batch_size: stream.batch_size,
    cpm_usdc: stream.pricing.rate_usdc,
    cost_per_batch_usdc: calculateBatchCost(stream.batch_size, stream.pricing.rate_usdc),
    quality_threshold: stream.quality_threshold,
    budget_remaining_usdc: stream.max_budget_usdc,
    created_at: stream.created_at.toISOString()
  }, 201);
});

/**
 * GET /v1/stream/:id
 * Get stream status
 */
streamRoutes.get('/:id', async (c) => {
  const streamId = c.req.param('id');
  const stream = await streamService.getStream(streamId);

  if (!stream) {
    return c.json({ error: 'Stream not found' }, 404);
  }

  const budgetRemaining = (
    parseFloat(stream.max_budget_usdc) - parseFloat(stream.spent_usdc)
  ).toFixed(6);

  return c.json({
    stream_id: stream.id,
    status: stream.status,
    buyer_agent: stream.buyer_agent,
    publisher_agent: stream.publisher_agent,
    pricing: stream.pricing,
    quality_threshold: stream.quality_threshold,
    batch_size: stream.batch_size,
    stats: {
      impressions_delivered: stream.impressions_delivered,
      batches_completed: stream.batches_completed,
      total_spent_usdc: stream.spent_usdc,
      budget_remaining_usdc: budgetRemaining
    },
    created_at: stream.created_at.toISOString(),
    updated_at: stream.updated_at.toISOString()
  });
});

/**
 * POST /v1/stream/:id/batch
 * Report batch delivery and receive payment
 */
streamRoutes.post('/:id/batch', async (c) => {
  const streamId = c.req.param('id');
  const body = await c.req.json();
  const parsed = ReportBatchSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ 
      error: 'Validation failed', 
      details: parsed.error.flatten() 
    }, 400);
  }

  const auth = c.get('auth');
  const result = await streamService.processBatch(streamId, parsed.data, auth.agentId);

  if ('error' in result) {
    return c.json({ error: result.error }, result.status || 400);
  }

  return c.json(result);
});

/**
 * POST /v1/stream/:id/pause
 * Pause a stream
 */
streamRoutes.post('/:id/pause', async (c) => {
  const streamId = c.req.param('id');
  const auth = c.get('auth');
  
  const result = await streamService.updateStreamStatus(streamId, 'paused', auth.agentId);
  
  if ('error' in result) {
    return c.json({ error: result.error }, result.status || 400);
  }

  return c.json({
    stream_id: streamId,
    status: 'paused',
    message: 'Stream paused. Use /resume to continue.'
  });
});

/**
 * POST /v1/stream/:id/resume
 * Resume a paused stream
 */
streamRoutes.post('/:id/resume', async (c) => {
  const streamId = c.req.param('id');
  const auth = c.get('auth');
  
  const result = await streamService.updateStreamStatus(streamId, 'active', auth.agentId);
  
  if ('error' in result) {
    return c.json({ error: result.error }, result.status || 400);
  }

  return c.json({
    stream_id: streamId,
    status: 'active',
    message: 'Stream resumed.'
  });
});

/**
 * POST /v1/stream/:id/terminate
 * Terminate a stream
 */
streamRoutes.post('/:id/terminate', async (c) => {
  const streamId = c.req.param('id');
  const auth = c.get('auth');
  
  const result = await streamService.updateStreamStatus(streamId, 'terminated', auth.agentId);
  
  if ('error' in result) {
    return c.json({ error: result.error }, result.status || 400);
  }

  return c.json({
    stream_id: streamId,
    status: 'terminated',
    message: 'Stream terminated. No further batches will be processed.',
    final_stats: result.stats
  });
});

// Helper functions
function calculateBatchCost(batchSize: number, cpmUsdc: string): string {
  const cpm = parseFloat(cpmUsdc);
  return ((batchSize / 1000) * cpm).toFixed(6);
}
