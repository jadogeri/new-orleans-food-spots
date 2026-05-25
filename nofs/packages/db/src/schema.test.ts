/**
 * DB package schema tests.
 *
 * We mock the heavy ESM-only runtime deps (drizzle-orm, @libsql/client, dotenv)
 * so these tests run fast in Jest (CJS mode) without a real database.
 */

jest.mock('drizzle-orm/libsql', () => ({ drizzle: jest.fn(() => ({})) }));
jest.mock('@libsql/client', () => ({ createClient: jest.fn(() => ({})) }));
jest.mock('dotenv', () => ({ config: jest.fn() }));

// drizzle-orm/sqlite-core column builders return plain objects we can inspect
jest.mock('drizzle-orm/sqlite-core', () => {
  const makeCol = (dataType: string, name: string) => {
    const self: Record<string, unknown> = {
      _name: name,
      _dataType: dataType,
    };
    const chain = (methods: string[]) => {
      methods.forEach((m) => {
        self[m] = () => self;
      });
    };
    chain(['notNull', 'default', 'unique', 'primaryKey', '$defaultFn', '$type', 'references', 'onDelete', 'mode']);
    return self;
  };

  const col = (dataType: string) => (name: string, _opts?: object) => makeCol(dataType, name);

  return {
    sqliteTable: (tableName: string, columns: Record<string, unknown>) => ({
      _tableName: tableName,
      _columns: columns,
    }),
    text: col('text'),
    integer: col('integer'),
    real: col('real'),
    blob: col('blob'),
  };
});

// Keep import.meta.dirname working under Jest/CJS
Object.defineProperty(globalThis, 'import', {
  value: { meta: { dirname: __dirname } },
  writable: true,
  configurable: true,
});

// ---------------------------------------------------------------------------

describe('DB schema — users table', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { usersTable } = require('./schema/users');

  it('is defined', () => {
    expect(usersTable).toBeDefined();
  });

  it('targets the "users" table', () => {
    expect(usersTable._tableName).toBe('users');
  });

  it('has required columns', () => {
    const cols = Object.keys(usersTable._columns);
    expect(cols).toContain('id');
    expect(cols).toContain('email');
    expect(cols).toContain('name');
    expect(cols).toContain('username');
  });
});

describe('DB schema — businesses table', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { businessesTable } = require('./schema/businesses');

  it('is defined', () => {
    expect(businessesTable).toBeDefined();
  });

  it('targets the "businesses" table', () => {
    expect(businessesTable._tableName).toBe('businesses');
  });

  it('has required columns', () => {
    const cols = Object.keys(businessesTable._columns);
    expect(cols).toContain('id');
    expect(cols).toContain('userId');
    expect(cols).toContain('businessId');
    expect(cols).toContain('name');
    expect(cols).toContain('liked');
    expect(cols).toContain('visited');
  });
});

describe('DB schema — sessions table', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { sessionsTable } = require('./schema/sessions');

  it('is defined', () => {
    expect(sessionsTable).toBeDefined();
  });

  it('has the expected table name', () => {
    expect(typeof sessionsTable._tableName).toBe('string');
    expect(sessionsTable._tableName.length).toBeGreaterThan(0);
  });
});

describe('DB schema — verifications table', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { verificationsTable } = require('./schema/verifications');

  it('is defined', () => {
    expect(verificationsTable).toBeDefined();
  });

  it('has the expected table name', () => {
    expect(typeof verificationsTable._tableName).toBe('string');
    expect(verificationsTable._tableName.length).toBeGreaterThan(0);
  });
});
