import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { ConfigureVaultSchema } from '../types';

export const vaultRoutes = new Hono();

// In-memory store - replace with database
const vaultConfigs = new Map<string, any>();
const sweepHistory = new Map<string, any[]>();

/**
 * POST /v1/vault/configure
 * Configure Fireblocks vault integration
 */
vaultRoutes.post('/configure', async (c) => {
  const body = await c.req.json();
  const parsed = ConfigureVaultSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ 
      error: 'Validation failed', 
      details: parsed.error.flatten() 
    }, 400);
  }

  const auth = c.get('auth');
  const config = {
    ...parsed.data,
    agent_id: auth.agentId,
    configured_at: new Date(),
    status: 'active'
  };

  // Encrypt API key before storing
  // TODO: Use proper encryption
  config.fireblocks_api_key = `encrypted:${config.fireblocks_api_key.slice(0, 8)}...`;

  vaultConfigs.set(auth.agentId, config);

  return c.json({
    status: 'configured',
    vault_id: config.fireblocks_vault_id,
    hot_wallet: config.hot_wallet_address,
    sweep_settings: config.sweep_settings,
    message: 'Vault configured successfully. Auto-sweep enabled.'
  }, 201);
});

/**
 * GET /v1/vault/status
 * Get vault and hot wallet status
 */
vaultRoutes.get('/status', async (c) => {
  const auth = c.get('auth');
  const config = vaultConfigs.get(auth.agentId);

  if (!config) {
    return c.json({ 
      error: 'Vault not configured',
      hint: 'Use POST /v1/vault/configure to set up Fireblocks integration'
    }, 404);
  }

  // TODO: Query actual balances from chain / Fireblocks
  const mockHotWalletBalance = (Math.random() * 5000).toFixed(2);
  const mockVaultBalance = (Math.random() * 50000).toFixed(2);

  return c.json({
    hot_wallet: {
      address: config.hot_wallet_address,
      balance_usdc: mockHotWalletBalance,
      chain: 'base'
    },
    vault: {
      id: config.fireblocks_vault_id,
      balance_usdc: mockVaultBalance,
      provider: 'fireblocks'
    },
    sweep_settings: config.sweep_settings,
    next_sweep: calculateNextSweep(config.sweep_settings.frequency),
    status: config.status
  });
});

/**
 * POST /v1/vault/sweep
 * Trigger manual sweep to vault
 */
vaultRoutes.post('/sweep', async (c) => {
  const auth = c.get('auth');
  const config = vaultConfigs.get(auth.agentId);

  if (!config) {
    return c.json({ error: 'Vault not configured' }, 404);
  }

  // TODO: Execute actual sweep transaction
  const sweepId = `sweep_${nanoid(12)}`;
  const mockAmount = (Math.random() * 4000 + 1000).toFixed(2);
  const txHash = `0x${nanoid(64).toLowerCase()}`;

  const sweep = {
    id: sweepId,
    timestamp: new Date().toISOString(),
    hot_wallet_balance_before: (parseFloat(mockAmount) + parseFloat(config.sweep_settings.retain_usdc)).toFixed(2),
    amount_swept: mockAmount,
    hot_wallet_balance_after: config.sweep_settings.retain_usdc,
    fireblocks_vault_id: config.fireblocks_vault_id,
    tx_hash: txHash,
    status: 'completed'
  };

  const history = sweepHistory.get(auth.agentId) || [];
  history.push(sweep);
  sweepHistory.set(auth.agentId, history);

  console.log(`[Vault] Sweep ${sweepId}: ${mockAmount} USDC → Fireblocks (${txHash.slice(0, 10)}...)`);

  return c.json(sweep);
});

/**
 * GET /v1/vault/sweeps
 * Get sweep history
 */
vaultRoutes.get('/sweeps', async (c) => {
  const auth = c.get('auth');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');

  const history = sweepHistory.get(auth.agentId) || [];
  const sorted = history.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return c.json({
    sweeps: sorted.slice(offset, offset + limit),
    total: history.length,
    limit,
    offset
  });
});

// Helper
function calculateNextSweep(frequency: string): string {
  const now = new Date();
  const hours = parseInt(frequency) || 24;
  const next = new Date(now.getTime() + hours * 60 * 60 * 1000);
  return next.toISOString();
}
