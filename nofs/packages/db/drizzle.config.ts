// packages/db/drizzle.config.ts
import 'dotenv/config';
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: './src/migrations',
  // 👇 Option A: Point directly to your schema folder
  schema: './src/schema/', 
  // 👇 Option B: (Alternative if folder path fails) point to your main index file
  // schema: './src/index.ts', 
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
