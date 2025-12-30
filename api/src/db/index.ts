import { drizzle } from 'drizzle-orm/bun-sql';
import { relations } from './relations';

if (!process.env.DATABASE_URL) throw Error('Database URL not provided');

export const db = drizzle(process.env.DATABASE_URL, { relations });
