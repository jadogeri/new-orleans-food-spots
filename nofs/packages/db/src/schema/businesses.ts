// packages/db/src/schema/businesses.ts
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users.js";

export const businessesTable = sqliteTable("businesses", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone"),
  rating: real("rating"),
  imageUrl: text("image_url"),
  price: text("price"),
  reviews: integer("reviews"),
  address: text("address"),
  city: text("city"),
  
  // SQLite handles arrays by serializing them to JSON text strings
  transactions: text("transactions", { mode: "json" })
    .$type<string[]>()
    .default(sql`'[]'`),
  categories: text("categories", { mode: "json" })
    .$type<string[]>()
    .default(sql`'[]'`),
    
  // SQLite handles booleans as integers (0 or 1)
  liked: integer("liked", { mode: "boolean" }).notNull().default(false),
  visited: integer("visited", { mode: "boolean" }).notNull().default(false),
  
  // Handled as Unix integer timestamp matching JavaScript Date format
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
});

export type Business = typeof businessesTable.$inferSelect;
export type InsertBusiness = typeof businessesTable.$inferInsert;


