import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql as any, { schema });

export * from './schema.js';
export { eq, and, or, desc, asc, sql as sqlExpr, isNull } from 'drizzle-orm';
