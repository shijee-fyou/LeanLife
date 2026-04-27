import pg from "pg";

const { Pool } = pg;

let _pool: pg.Pool | null = null;

export function getPool(connectionString: string): pg.Pool {
  if (!_pool) {
    _pool = new Pool({
      connectionString,
      ssl: process.env["NODE_ENV"] === "production" ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
    _pool.on("error", (err) => {
      console.error("[pg-pool] unexpected error on idle client", err);
    });
  }
  return _pool;
}

export async function closePool(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}
