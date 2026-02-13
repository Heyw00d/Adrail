import { pgTable, text, timestamp, integer, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

// Enums
export const escrowStatusEnum = pgEnum('escrow_status', ['pending', 'funded', 'active', 'completed', 'refunded', 'disputed']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'verified', 'paid', 'failed']);
export const verificationStatusEnum = pgEnum('verification_status', ['pending', 'passed', 'failed']);

// Publishers - sites/agents that display ads
export const publishers = pgTable('publishers', {
  id: text('id').primaryKey().$defaultFn(() => `pub_${nanoid(12)}`),
  name: text('name').notNull(),
  domain: text('domain'),
  walletAddress: text('wallet_address').notNull(),
  apiKey: text('api_key').notNull().$defaultFn(() => `pk_${nanoid(24)}`),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Advertisers - companies buying ad space
export const advertisers = pgTable('advertisers', {
  id: text('id').primaryKey().$defaultFn(() => `adv_${nanoid(12)}`),
  name: text('name').notNull(),
  email: text('email'),
  walletAddress: text('wallet_address').notNull(),
  apiKey: text('api_key').notNull().$defaultFn(() => `ak_${nanoid(24)}`),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Escrows - locked funds for campaigns
export const escrows = pgTable('escrows', {
  id: text('id').primaryKey().$defaultFn(() => `esc_${nanoid(12)}`),
  advertiserId: text('advertiser_id').notNull().references(() => advertisers.id),
  amountUsdc: integer('amount_usdc').notNull(), // in cents (1 USDC = 100)
  balanceUsdc: integer('balance_usdc').notNull(), // remaining balance
  status: escrowStatusEnum('status').default('pending').notNull(),
  txHash: text('tx_hash'), // funding transaction
  expiresAt: timestamp('expires_at'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Impressions - ad display events (batched for efficiency)
export const impressions = pgTable('impressions', {
  id: text('id').primaryKey().$defaultFn(() => `imp_${nanoid(12)}`),
  escrowId: text('escrow_id').notNull().references(() => escrows.id),
  publisherId: text('publisher_id').notNull().references(() => publishers.id),
  count: integer('count').notNull().default(1),
  cpmUsdc: integer('cpm_usdc').notNull(), // CPM in cents
  totalUsdc: integer('total_usdc').notNull(), // total earned (count * cpm / 1000)
  adcpRequestId: text('adcp_request_id'), // AdCP media buy reference
  metadata: jsonb('metadata'), // user agent, geo, etc
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Verifications - oracle verification of impressions
export const verifications = pgTable('verifications', {
  id: text('id').primaryKey().$defaultFn(() => `ver_${nanoid(12)}`),
  impressionId: text('impression_id').notNull().references(() => impressions.id),
  oracleId: text('oracle_id').notNull(),
  status: verificationStatusEnum('status').default('pending').notNull(),
  score: integer('score'), // 0-100 confidence
  reason: text('reason'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Payments - USDC settlements to publishers
export const payments = pgTable('payments', {
  id: text('id').primaryKey().$defaultFn(() => `pay_${nanoid(12)}`),
  publisherId: text('publisher_id').notNull().references(() => publishers.id),
  escrowId: text('escrow_id').notNull().references(() => escrows.id),
  amountUsdc: integer('amount_usdc').notNull(), // in cents
  status: paymentStatusEnum('status').default('pending').notNull(),
  txHash: text('tx_hash'), // USDC transfer tx
  x402Receipt: text('x402_receipt'), // x402 payment proof
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  paidAt: timestamp('paid_at'),
});

// API request log for debugging/analytics
export const apiLogs = pgTable('api_logs', {
  id: text('id').primaryKey().$defaultFn(() => `log_${nanoid(12)}`),
  method: text('method').notNull(),
  path: text('path').notNull(),
  publisherId: text('publisher_id'),
  advertiserId: text('advertiser_id'),
  statusCode: integer('status_code'),
  durationMs: integer('duration_ms'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
