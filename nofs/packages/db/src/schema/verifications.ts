import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const verificationsTable = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export type Verification = typeof verificationsTable.$inferSelect;
export type InsertVerification = typeof verificationsTable.$inferInsert;
