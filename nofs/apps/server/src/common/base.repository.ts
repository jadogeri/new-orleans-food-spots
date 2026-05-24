import { db } from '@repo/db';
import type { SQL, Table } from 'drizzle-orm';

/**
 * Drizzle-adapted BaseRepository, mirroring the MikroORM EntityRepository pattern.
 *
 * Subclasses declare the table once; all CRUD methods are inherited.
 * The `db` accessor mirrors `getTargetEm()` — a single point to swap the
 * connection if request-scoped contexts are introduced later.
 */
export abstract class BaseRepository<TSelect, TInsert> {
  protected abstract readonly table: Table;

  protected get db() {
    return db;
  }

  async find(where?: SQL): Promise<TSelect[]> {
    const q = this.db.select().from(this.table as any);
    // 💡 FIXED: Cast 'where' to any to bypass 'shouldInlineParams' resolution conflicts
    const rows = where ? await q.where(where as any) : await q;
    return rows as TSelect[];
  }

  async findOne(where: SQL): Promise<TSelect | null> {
    // 💡 FIXED: Cast 'where' to any
    const [row] = await this.db.select().from(this.table as any).where(where as any);
    return (row as TSelect) ?? null;
  }

  async save(data: TInsert): Promise<TSelect> {
    const [row] = await this.db
      .insert(this.table as any)
      .values(data as never)
      // 💡 FIXED: Cast the returning call to 'any' to bypass internal array signature mismatch errors
      .returning() as any;
    return row as TSelect;
  }


  async update(where: SQL, data: Partial<TInsert>): Promise<TSelect | null> {
    const [row] = await this.db
      .update(this.table as any)
      .set(data as never)
      .where(where as any) // 💡 FIXED: Cast 'where' to any
      .returning() as any;
    return (row as TSelect) ?? null;
  }

  async remove(where: SQL): Promise<TSelect | null> {
    const [row] = await this.db
      .delete(this.table as any)
      .where(where as any) // 💡 FIXED: Cast 'where' to any
      .returning() as any;
    return (row as TSelect) ?? null;
  }
}
