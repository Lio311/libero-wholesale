import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgres://dummy:dummy@localhost/dummy';
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
