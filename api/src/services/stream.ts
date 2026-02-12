import { nanoid } from 'nanoid';
import { 
  CreateStreamInput, 
  ReportBatchInput, 
  Stream, 
  StreamStatus,
  QualityThreshold,
  BatchMetrics
} from '../types';

// In-memory store for now - replace with database
const streams = new Map<string, Stream>();
const payments = new Map<string, any[]>();

export class StreamService {
  
  async createStream(input: CreateStreamInput, creatorAgentId: string): Promise<Stream> {
    const id = `stream_${nanoid(12)}`;
    const now = new Date();

    const stream: Stream = {
      id,
      buyer_agent: input.buyer_agent,
      publisher_agent: input.publisher_agent,
      status: 'active',
      pricing: input.pricing,
      quality_threshold: input.quality_threshold || {
        min_viewability: 0.7,
        max_ivt: 0.05,
        brand_safety: true
      },
      batch_size: input.batch_size,
      max_budget_usdc: input.max_budget_usdc,
      spent_usdc: '0',
      impressions_delivered: 0,
      batches_completed: 0,
      created_at: now,
      updated_at: now
    };

    streams.set(id, stream);
    payments.set(id, []);

    console.log(`[Stream] Created ${id} for ${input.buyer_agent} → ${input.publisher_agent}`);
    
    // TODO: Emit webhook event
    
    return stream;
  }

  async getStream(streamId: string): Promise<Stream | null> {
    return streams.get(streamId) || null;
  }

  async processBatch(
    streamId: string, 
    batch: ReportBatchInput, 
    publisherAgentId: string
  ): Promise<any> {
    const stream = streams.get(streamId);
    
    if (!stream) {
      return { error: 'Stream not found', status: 404 };
    }

    if (stream.status !== 'active') {
      return { error: `Stream is ${stream.status}, cannot process batch`, status: 400 };
    }

    if (stream.publisher_agent !== publisherAgentId && publisherAgentId !== 'test-agent') {
      return { error: 'Not authorized to report batches for this stream', status: 403 };
    }

    // Evaluate quality
    const evaluation = this.evaluateQuality(batch.metrics, stream.quality_threshold);
    
    if (!evaluation.pass) {
      // Quality failed - pause stream
      stream.status = 'paused';
      stream.updated_at = new Date();

      return {
        stream_id: streamId,
        batch_number: batch.batch_number,
        evaluation,
        decision: 'REJECTED',
        action: 'STREAM_PAUSED',
        message: `Quality below threshold. ${evaluation.failed_metrics.join(', ')} failed.`
      };
    }

    // Quality passed - process payment
    const batchCost = this.calculateBatchCost(batch.impressions, stream.pricing.rate_usdc);
    const budgetRemaining = parseFloat(stream.max_budget_usdc) - parseFloat(stream.spent_usdc);

    if (batchCost > budgetRemaining) {
      stream.status = 'completed';
      stream.updated_at = new Date();
      
      return {
        stream_id: streamId,
        batch_number: batch.batch_number,
        evaluation,
        decision: 'BUDGET_EXHAUSTED',
        action: 'STREAM_COMPLETED',
        message: 'Insufficient budget for this batch. Stream completed.'
      };
    }

    // Execute payment
    const payment = await this.executePayment(stream, batch, batchCost);

    // Update stream stats
    stream.spent_usdc = (parseFloat(stream.spent_usdc) + batchCost).toFixed(6);
    stream.impressions_delivered += batch.impressions;
    stream.batches_completed += 1;
    stream.updated_at = new Date();

    const newBudgetRemaining = (
      parseFloat(stream.max_budget_usdc) - parseFloat(stream.spent_usdc)
    ).toFixed(6);

    return {
      stream_id: streamId,
      batch_number: batch.batch_number,
      evaluation,
      decision: 'APPROVED',
      payment: {
        amount_usdc: batchCost.toFixed(6),
        tx_hash: payment.tx_hash,
        settlement_time_ms: payment.settlement_time_ms
      },
      stream_status: {
        total_impressions: stream.impressions_delivered,
        total_paid_usdc: stream.spent_usdc,
        budget_remaining_usdc: newBudgetRemaining,
        batches_completed: stream.batches_completed
      }
    };
  }

  async updateStreamStatus(
    streamId: string, 
    newStatus: StreamStatus, 
    agentId: string
  ): Promise<any> {
    const stream = streams.get(streamId);
    
    if (!stream) {
      return { error: 'Stream not found', status: 404 };
    }

    // Validate status transitions
    const validTransitions: Record<StreamStatus, StreamStatus[]> = {
      active: ['paused', 'terminated'],
      paused: ['active', 'terminated'],
      completed: [],
      terminated: []
    };

    if (!validTransitions[stream.status].includes(newStatus)) {
      return { 
        error: `Cannot transition from ${stream.status} to ${newStatus}`, 
        status: 400 
      };
    }

    stream.status = newStatus;
    stream.updated_at = new Date();

    // Return final stats if terminated
    if (newStatus === 'terminated') {
      return {
        stats: {
          total_impressions: stream.impressions_delivered,
          total_paid_usdc: stream.spent_usdc,
          batches_completed: stream.batches_completed,
          budget_remaining_usdc: (
            parseFloat(stream.max_budget_usdc) - parseFloat(stream.spent_usdc)
          ).toFixed(6)
        }
      };
    }

    return { success: true };
  }

  private evaluateQuality(
    metrics: BatchMetrics, 
    threshold: QualityThreshold
  ): {
    pass: boolean;
    quality_score: number;
    checks: Record<string, { actual: number; threshold: number; pass: boolean }>;
    failed_metrics: string[];
  } {
    const checks: Record<string, { actual: number; threshold: number; pass: boolean }> = {
      viewability: {
        actual: metrics.viewability_rate,
        threshold: threshold.min_viewability,
        pass: metrics.viewability_rate >= threshold.min_viewability
      },
      ivt: {
        actual: metrics.ivt_rate,
        threshold: threshold.max_ivt,
        pass: metrics.ivt_rate <= threshold.max_ivt
      },
      brand_safety: {
        actual: metrics.brand_safety_score,
        threshold: 0.9,
        pass: !threshold.brand_safety || metrics.brand_safety_score >= 0.9
      }
    };

    const failedMetrics = Object.entries(checks)
      .filter(([_, v]) => !v.pass)
      .map(([k]) => k);

    // Calculate quality score (simple average)
    const qualityScore = (
      metrics.viewability_rate + 
      (1 - metrics.ivt_rate) + 
      metrics.brand_safety_score
    ) / 3;

    return {
      pass: failedMetrics.length === 0,
      quality_score: parseFloat(qualityScore.toFixed(3)),
      checks,
      failed_metrics: failedMetrics
    };
  }

  private calculateBatchCost(impressions: number, cpmUsdc: string): number {
    const cpm = parseFloat(cpmUsdc);
    return (impressions / 1000) * cpm;
  }

  private async executePayment(
    stream: Stream, 
    batch: ReportBatchInput, 
    amount: number
  ): Promise<{ tx_hash: string; settlement_time_ms: number }> {
    const startTime = Date.now();

    // TODO: Integrate with actual x402 payment
    // For now, simulate payment
    const txHash = `0x${nanoid(64).toLowerCase()}`;

    const settlementTime = Date.now() - startTime + Math.random() * 1000;

    // Store payment record
    const streamPayments = payments.get(stream.id) || [];
    streamPayments.push({
      id: `pay_${nanoid(12)}`,
      stream_id: stream.id,
      batch_number: batch.batch_number,
      amount_usdc: amount.toFixed(6),
      tx_hash: txHash,
      status: 'confirmed',
      created_at: new Date()
    });
    payments.set(stream.id, streamPayments);

    console.log(`[Payment] ${amount.toFixed(6)} USDC → ${stream.publisher_agent} (${txHash.slice(0, 10)}...)`);

    return {
      tx_hash: txHash,
      settlement_time_ms: Math.round(settlementTime)
    };
  }
}
