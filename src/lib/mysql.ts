import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "chennai_guardian",
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
};

// Global pool variable to ensure hot reloading in Next.js development does not exhaust connections
let pool: mysql.Pool;

const globalWithPool = globalThis as typeof globalThis & {
  _mysqlPool?: mysql.Pool;
};

if (globalWithPool._mysqlPool) {
  pool = globalWithPool._mysqlPool;
} else {
  pool = mysql.createPool(dbConfig);
  globalWithPool._mysqlPool = pool;
}

export { pool };

let mutationCallbacks: Array<() => void> = [];

export function registerMutationCallback(cb: () => void) {
  mutationCallbacks.push(cb);
}

function notifyMutation(sql: string) {
  const sqlUpper = sql.toUpperCase();
  if (
    sqlUpper.includes("INSERT") ||
    sqlUpper.includes("UPDATE") ||
    sqlUpper.includes("DELETE") ||
    sqlUpper.includes("ALTER") ||
    sqlUpper.includes("DROP") ||
    sqlUpper.includes("REPLACE")
  ) {
    for (const cb of mutationCallbacks) {
      try { cb(); } catch (e) { console.error("Error in mutation callback:", e); }
    }
  }
}

export async function query(sql: string, params?: any[]) {
  try {
    const [results] = await pool.execute(sql, params);
    notifyMutation(sql);
    return results;
  } catch (err: any) {
    console.error("Database query error:", err, "SQL:", sql, "Params:", params);
    throw err;
  }
}

export async function transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    notifyMutation("UPDATE"); // Invalidate cache after successful transaction commit
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
