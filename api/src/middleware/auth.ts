import { Context, Next } from 'hono';

export interface AuthContext {
  apiKey: string;
  agentId: string;
  tier: 'starter' | 'growth' | 'scale' | 'enterprise';
}

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const apiKey = c.req.header('Authorization')?.replace('Bearer ', '') 
    || c.req.header('X-API-Key');

  if (!apiKey) {
    return c.json({ 
      error: 'Missing API key',
      hint: 'Include Authorization: Bearer <api_key> or X-API-Key header'
    }, 401);
  }

  // TODO: Validate API key against database
  // For now, accept any key that starts with 'adrail_'
  if (!apiKey.startsWith('adrail_') && !apiKey.startsWith('test_')) {
    return c.json({ error: 'Invalid API key' }, 401);
  }

  // TODO: Look up agent info from database
  const auth: AuthContext = {
    apiKey,
    agentId: apiKey.startsWith('test_') ? 'test-agent' : extractAgentId(apiKey),
    tier: 'starter' // TODO: Look up from database
  };

  c.set('auth', auth);
  await next();
}

function extractAgentId(apiKey: string): string {
  // adrail_<agent_id>_<random>
  const parts = apiKey.split('_');
  return parts.length >= 2 ? parts[1] : 'unknown';
}
