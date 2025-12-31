import 'dotenv/config';
import { defineConfig } from '@prisma/config';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set for Prisma.');
}

export default defineConfig({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});
