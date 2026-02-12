import { z } from 'zod';

// ============ Stream Types ============

export const QualityThresholdSchema = z.object({
  min_viewability: z.number().min(0).max(1).default(0.7),
  max_ivt: z.number().min(0).max(1).default(0.05),
  brand_safety: z.boolean().default(true),
  min_attention_seconds: z.number().optional()
});

export const PricingSchema = z.object({
  model: z.enum(['cpm', 'cpc', 'cpa']).default('cpm'),
  rate_usdc: z.string() // Use string for decimal precision
});

export const TargetingSchema = z.object({
  geo: z.array(z.string()).optional(),
  context: z.array(z.string()).optional(),
  device: z.array(z.string()).optional()
});

export const CreateStreamSchema = z.object({
  buyer_agent: z.string(),
  publisher_agent: z.string(),
  adcp_contract: z.string().optional(),
  targeting: TargetingSchema.optional(),
  pricing: PricingSchema,
  quality_threshold: QualityThresholdSchema.optional(),
  batch_size: z.number().int().min(100).max(100000).default(1000),
  max_budget_usdc: z.string()
});

export const BatchMetricsSchema = z.object({
  viewability_rate: z.number().min(0).max(1),
  ivt_rate: z.number().min(0).max(1),
  brand_safety_score: z.number().min(0).max(1),
  avg_attention_seconds: z.number().optional(),
  geo_compliance: z.number().min(0).max(1).optional()
});

export const ReportBatchSchema = z.object({
  batch_number: z.number().int().positive(),
  impressions: z.number().int().positive(),
  metrics: BatchMetricsSchema,
  impression_ids: z.array(z.string()).optional()
});

// ============ Vault Types ============

export const SweepSettingsSchema = z.object({
  frequency: z.enum(['1h', '6h', '12h', '24h']).default('24h'),
  threshold_usdc: z.string(),
  retain_usdc: z.string()
});

export const ConfigureVaultSchema = z.object({
  fireblocks_vault_id: z.string(),
  fireblocks_api_key: z.string(),
  hot_wallet_address: z.string(),
  sweep_settings: SweepSettingsSchema
});

// ============ Webhook Types ============

export const RegisterWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum([
    'stream.started',
    'stream.batch_approved',
    'stream.batch_rejected',
    'stream.paused',
    'stream.terminated',
    'payment.sent',
    'payment.confirmed',
    'vault.sweep_started',
    'vault.sweep_completed'
  ])),
  secret: z.string().optional()
});

// ============ Derived Types ============

export type CreateStreamInput = z.infer<typeof CreateStreamSchema>;
export type ReportBatchInput = z.infer<typeof ReportBatchSchema>;
export type ConfigureVaultInput = z.infer<typeof ConfigureVaultSchema>;
export type RegisterWebhookInput = z.infer<typeof RegisterWebhookSchema>;
export type QualityThreshold = z.infer<typeof QualityThresholdSchema>;
export type BatchMetrics = z.infer<typeof BatchMetricsSchema>;

// ============ Stream Status ============

export type StreamStatus = 'active' | 'paused' | 'completed' | 'terminated';

export interface Stream {
  id: string;
  buyer_agent: string;
  publisher_agent: string;
  status: StreamStatus;
  pricing: z.infer<typeof PricingSchema>;
  quality_threshold: QualityThreshold;
  batch_size: number;
  max_budget_usdc: string;
  spent_usdc: string;
  impressions_delivered: number;
  batches_completed: number;
  created_at: Date;
  updated_at: Date;
}

export interface Payment {
  id: string;
  stream_id: string;
  batch_number: number;
  amount_usdc: string;
  recipient_wallet: string;
  chain: string;
  tx_hash: string | null;
  status: 'pending' | 'confirmed' | 'failed';
  created_at: Date;
}
