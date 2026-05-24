import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { usersTable } from "./users.js";

export const businessesTable = sqliteTable("businesses", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone"),
  rating: real("rating"),
  imageUrl: text("image_url"),
  price: text("price"),
  reviews: integer("reviews"),
  address: text("address"),
  city: text("city"),
  transactions: text("transactions", { mode: "json" }).$type<string[]>().notNull().default([]),
  categories: text("categories", { mode: "json" }).$type<string[]>().notNull().default([]),
  liked: integer("liked", { mode: "boolean" }).notNull().default(false),
  visited: integer("visited", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Business = typeof businessesTable.$inferSelect;
export type InsertBusiness = typeof businessesTable.$inferInsert;
