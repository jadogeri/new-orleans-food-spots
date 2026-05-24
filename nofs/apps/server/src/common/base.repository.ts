import { db } from '@workspace/db';
import type { SQL } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';

/**
 * Drizzle-adapted BaseRepository, mirroring the MikroORM EntityRepository pattern.
 *
 * Subclasses declare the table once; all CRUD methods are inherited.
 * The `db` accessor mirrors `getTargetEm()` — a single point to swap the
 * connection if request-scoped contexts are introduced later.
 */
export abstract class BaseRepository<TSelect, TInsert> {
  protected abstract readonly table: PgTable;

  protected get db() {
    return db;
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
    const [row] = await this.db
      .insert(this.table)
      .values(data as never)
      .returning();
    return row as TSelect;
  }

  async update(where: SQL, data: Partial<TInsert>): Promise<TSelect | null> {
    const [row] = await this.db
      .update(this.table)
      .set(data as never)
      .where(where)
      .returning();
    return (row as TSelect) ?? null;
  }

  async remove(where: SQL): Promise<TSelect | null> {
    const [row] = await this.db
      .delete(this.table)
      .where(where)
      .returning();
    return (row as TSelect) ?? null;
  }
}
