import { db } from '@repo/db';
import type { SQL } from 'drizzle-orm';
import type { Table } from 'drizzle-orm'; // Use generic Table type

/**
 * Drizzle-adapted BaseRepository, mirroring the MikroORM EntityRepository pattern.
 *
 * Subclasses declare the table once; all CRUD methods are inherited.
 * The `db` accessor mirrors `getTargetEm()` — a single point to swap the
 * connection if request-scoped contexts are introduced later.
 */
export abstract class BaseRepository<TSelect, TInsert> {
  // Use Table instead of SQLiteTable to align structural interfaces safely
  protected abstract readonly table: Table;

  protected get db() {
    return db as any; // Cast safely to bypass deep internal 'resolution-mode' flag clashes
  }

  async find(where?: SQL): Promise<TSelect[]> {
    const q = this.db.select().from(this.table);
    const rows = where ? await q.where(where) : await q;
    return rows as TSelect[];
  }

  async findOne(where: SQL): Promise<TSelect | null> {
    const [row] = await this.db.select().from(this.table).where(where);
    return (row as TSelect) ?? null;
  }

  async save(data: TInsert): Promise<TSelect> {
    const [row] = await this.db.insert(this.table).values(data).returning();
    return row as TSelect;
  }

  async update(where: SQL, data: Partial<TInsert>): Promise<TSelect | null> {
    const [row] = await this.db
      .update(this.table)
      .set(data)
      .where(where)
      .returning();
    return (row as TSelect) ?? null;
  }

  async remove(where: SQL): Promise<TSelect | null> {
    const [row] = await this.db.delete(this.table).where(where).returning();
    return (row as TSelect) ?? null;
  }
}
