// packages/db/src/test-db.ts
import 'dotenv/config';
import { db } from './index.js';
import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// 1. Define a temporary runtime inline table schema specifically for this mock test
const mockUsersTable = sqliteTable("mock_users", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default(""),
  username: text("username").unique(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

async function test() {
  try {
    console.log('🔨 Creating isolated "mock_users" table...');
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS "mock_users" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL DEFAULT '',
        "username" text UNIQUE,
        "email" text NOT NULL UNIQUE,
        "email_verified" integer NOT NULL DEFAULT 0,
        "created_at" integer NOT NULL DEFAULT (strftime('%s', 'now')),
        "updated_at" integer NOT NULL DEFAULT (strftime('%s', 'now'))
      );
    `);
    console.log('✅ Mock table initialized.');

    console.log('🔄 Writing a dummy row into "mock_users"...');
    const newUser = await db.insert(mockUsersTable).values({
      id: crypto.randomUUID(),
      name: "Temporary NOLA Foodie",
      username: `mock_fan_${Date.now()}`,
      email: `mock-${Date.now()}@example.com`,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    console.log('🎉 Success! Inserted mock user:', newUser);

    console.log('🔄 Verification: Querying all rows inside "mock_users"...');
    const allUsers = await db.select().from(mockUsersTable);
    console.log(`📋 Rows detected: ${allUsers.length}`);
    console.log(allUsers);

  } finally {
    // 2. The 'finally' block guarantees this drops the table even if the insert/select code above crashes
    console.log('🧹 Cleaning up database: Dropping "mock_users" table...');
    await db.run(sql`DROP TABLE IF EXISTS "mock_users";`);
    console.log('✨ Cleanup complete! Database state restored.');
  }
}

test()
  .then(() => {
    console.log('🏁 Test routine finished.');
  })
  .catch((err) => {
    console.error('❌ Database test execution failed:', err);
    process.exit(1);
  });
