import sql from 'mssql';
import type { DbConfig, SPResponse } from '../types';

/**
 * Database connection pool (singleton pattern)
 */
let pool: sql.ConnectionPool | null = null;

/**
 * Get database connection pool
 */
export async function getDbPool(env: any): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) {
    return pool;
  }

  const config: DbConfig = {
    server: env.DB_SERVER,
    port: parseInt(env.DB_PORT || '1433'),
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    options: {
      encrypt: env.DB_ENCRYPT === 'true',
      trustServerCertificate: env.DB_TRUST_CERT === 'true',
    },
  };

  pool = await sql.connect(config);
  return pool;
}

/**
 * Execute stored procedure
 * @param spName - Stored procedure name
 * @param params - Parameters object
 * @param env - Environment variables
 */
export async function executeSP<T = any>(
  spName: string,
  params: Record<string, any> = {},
  env: any
): Promise<SPResponse<T>> {
  try {
    const dbPool = await getDbPool(env);
    const request = dbPool.request();

    // Add parameters to request
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });

    // Execute stored procedure
    const result = await request.execute(spName);

    return {
      success: true,
      data: result.recordset as T,
      recordset: result.recordset,
      returnValue: result.returnValue,
    };
  } catch (error) {
    console.error(`Error executing SP ${spName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Execute query directly
 */
export async function executeQuery<T = any>(
  query: string,
  env: any
): Promise<SPResponse<T>> {
  try {
    const dbPool = await getDbPool(env);
    const result = await dbPool.request().query(query);

    return {
      success: true,
      data: result.recordset as T,
      recordset: result.recordset,
    };
  } catch (error) {
    console.error('Error executing query:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Close database connection
 */
export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
}
