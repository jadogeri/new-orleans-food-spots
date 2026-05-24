// packages/db/drizzle.config.ts
import dotenv from "dotenv";
dotenv.config();
import { defineConfig } from "drizzle-kit";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
console.log("TURSO_DATABASE_URL:", url);
console.log("TURSO_AUTH_TOKEN:", authToken);

export default defineConfig({
  out: './src/migrations',
  // 👇 Option A: Point directly to your schema folder
  schema: './src/schema/', 
  // 👇 Option B: (Alternative if folder path fails) point to your main index file
  // schema: './src/index.ts', 
  dialect: 'turso',
  dbCredentials: {
    url: url!,
    authToken: authToken,
  },
});

