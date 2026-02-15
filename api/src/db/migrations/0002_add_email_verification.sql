-- Add email verification fields to publishers and advertisers
-- Run this migration after deploying the new code

-- Publishers: add email (required), email_verified, email_verify_token
ALTER TABLE publishers 
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS email_verify_token TEXT;

-- Advertisers: add email_verified, email_verify_token, company fields
-- Note: email already exists but make it required for new accounts
ALTER TABLE advertisers 
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS email_verify_token TEXT,
  ADD COLUMN IF NOT EXISTS company TEXT;

-- Create index on verify tokens for fast lookups
CREATE INDEX IF NOT EXISTS idx_publishers_email_verify_token ON publishers(email_verify_token) WHERE email_verify_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_advertisers_email_verify_token ON advertisers(email_verify_token) WHERE email_verify_token IS NOT NULL;
