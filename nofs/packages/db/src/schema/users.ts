import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default(""),
  username: text("username").unique(),
  email: text("email").notNull().unique(),
  // SQLite uses integer (0 or 1) for booleans
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  loginAttempts: integer("login_attempts").notNull().default(0),
  lockedUntil: text("locked_until"), 
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});


export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
