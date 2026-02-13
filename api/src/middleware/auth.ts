import { Context, Next } from 'hono';
import { db, publishers, advertisers } from '../db/index.js';
import { eq } from 'drizzle-orm';

export interface AuthContext {
  apiKey: string;
  type: 'publisher' | 'advertiser';
  id: string;
  name: string;
  walletAddress: string;
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

  // Check publishers first (pk_ prefix)
  if (apiKey.startsWith('pk_')) {
    const [publisher] = await db.select().from(publishers).where(eq(publishers.apiKey, apiKey)).limit(1);
    if (publisher) {
      c.set('auth', {
        apiKey,
        type: 'publisher',
        id: publisher.id,
        name: publisher.name,
        walletAddress: publisher.walletAddress
      });
      return next();
    }
  }

  // Check advertisers (ak_ prefix)
  if (apiKey.startsWith('ak_')) {
    const [advertiser] = await db.select().from(advertisers).where(eq(advertisers.apiKey, apiKey)).limit(1);
    if (advertiser) {
      c.set('auth', {
        apiKey,
        type: 'advertiser',
        id: advertiser.id,
        name: advertiser.name,
        walletAddress: advertiser.walletAddress
      });
      return next();
    }
  }

  // Test mode for development
  if (apiKey.startsWith('test_')) {
    c.set('auth', {
      apiKey,
      type: 'publisher',
      id: 'test_pub_123',
      name: 'Test Publisher',
      walletAddress: '0x0000000000000000000000000000000000000000'
    });
    return next();
  }

  return c.json({ error: 'Invalid API key' }, 401);
}
