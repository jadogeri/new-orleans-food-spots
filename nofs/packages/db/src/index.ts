import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema/index.js";
import * as dotenv from "dotenv";
import path from "path";

// 💡 FIXED: Tell the DB package exactly how to look up out of its own folder and find the root .env
dotenv.config({ path: path.resolve(import.meta.dirname, "../../../.env") }); 

export const client = createClient({
  url: process.env.TURSO_DATABASE_URL!, // 👈 This will now grab the variable successfully!
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle({ client, schema });

export * from "./schema/index.js";
