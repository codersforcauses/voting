import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/models/schema.ts',
  dialect: 'postgresql',
  driver: 'bun-sql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://localhost:5432/openvote'
  }
})
