import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// DIRECT_URL = connexion directe Neon (migrations). Sinon DATABASE_URL (local, CI).
const url =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  'postgresql://placeholder:placeholder@localhost:5432/placeholder';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: { url },
});