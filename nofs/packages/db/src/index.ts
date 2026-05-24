import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema/index.js"; // 👈 NO EXTENSION
import * as dotenv from "dotenv";

dotenv.config(); 


export const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle({ client, schema });

export * from "./schema/index.js"; // 👈 NO EXTENSION
