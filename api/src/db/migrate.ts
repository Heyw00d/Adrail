import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log('Running AdRail migrations...');

  // Create enums
  await sql`
    DO $$ BEGIN
      CREATE TYPE escrow_status AS ENUM ('pending', 'funded', 'active', 'completed', 'refunded', 'disputed');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'paid', 'failed');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      CREATE TYPE verification_status AS ENUM ('pending', 'passed', 'failed');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  // Publishers
  await sql`
    CREATE TABLE IF NOT EXISTS publishers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      domain TEXT,
      wallet_address TEXT NOT NULL,
      api_key TEXT NOT NULL,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;

  // Advertisers
  await sql`
    CREATE TABLE IF NOT EXISTS advertisers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      wallet_address TEXT NOT NULL,
      api_key TEXT NOT NULL,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;

  // Escrows
  await sql`
    CREATE TABLE IF NOT EXISTS escrows (
      id TEXT PRIMARY KEY,
      advertiser_id TEXT NOT NULL REFERENCES advertisers(id),
      amount_usdc INTEGER NOT NULL,
      balance_usdc INTEGER NOT NULL,
      status escrow_status DEFAULT 'pending' NOT NULL,
      tx_hash TEXT,
      expires_at TIMESTAMP,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;

  // Impressions
  await sql`
    CREATE TABLE IF NOT EXISTS impressions (
      id TEXT PRIMARY KEY,
      escrow_id TEXT NOT NULL REFERENCES escrows(id),
      publisher_id TEXT NOT NULL REFERENCES publishers(id),
      count INTEGER NOT NULL DEFAULT 1,
      cpm_usdc INTEGER NOT NULL,
      total_usdc INTEGER NOT NULL,
      adcp_request_id TEXT,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;

  // Verifications
  await sql`
    CREATE TABLE IF NOT EXISTS verifications (
      id TEXT PRIMARY KEY,
      impression_id TEXT NOT NULL REFERENCES impressions(id),
      oracle_id TEXT NOT NULL,
      status verification_status DEFAULT 'pending' NOT NULL,
      score INTEGER,
      reason TEXT,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;

  // Payments
  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      publisher_id TEXT NOT NULL REFERENCES publishers(id),
      escrow_id TEXT NOT NULL REFERENCES escrows(id),
      amount_usdc INTEGER NOT NULL,
      status payment_status DEFAULT 'pending' NOT NULL,
      tx_hash TEXT,
      x402_receipt TEXT,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      paid_at TIMESTAMP
    );
  `;

  // API Logs
  await sql`
    CREATE TABLE IF NOT EXISTS api_logs (
      id TEXT PRIMARY KEY,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      publisher_id TEXT,
      advertiser_id TEXT,
      status_code INTEGER,
      duration_ms INTEGER,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;

  // Indexes for performance
  await sql`CREATE INDEX IF NOT EXISTS idx_escrows_advertiser ON escrows(advertiser_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_escrows_status ON escrows(status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_impressions_escrow ON impressions(escrow_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_impressions_publisher ON impressions(publisher_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_payments_publisher ON payments(publisher_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_verifications_impression ON verifications(impression_id);`;

  console.log('✓ Migrations complete!');
}

migrate().catch(console.error);
