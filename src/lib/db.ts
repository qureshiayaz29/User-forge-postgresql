import { Pool, PoolClient, QueryResult } from 'pg';

// Connection pool for PostgreSQL
// Pool manages connections efficiently, reusing them across requests
// This is important for serverless/high-traffic environments like Vercel
// Learn: Connection Pooling prevents creating new connections for each request

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings
  max: 20, // Maximum number of connections in pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Timeout for acquiring new connections
});

// Listen for pool errors
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * Execute a SQL query with parameters
 * Learn: Prepared statements prevent SQL injection attacks
 * Placeholders ($1, $2, etc) are filled with params array
 *
 * @param text SQL query string with $1, $2, ... placeholders
 * @param params Array of parameters to safely bind to query
 * @returns Query result with rows and metadata
 *
 * Example:
 * const result = await query(
 *   'SELECT * FROM users WHERE email = $1',
 *   ['user@example.com']
 * );
 */
export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params?: (string | number | null)[]
): Promise<QueryResult<T>> {
  const start = Date.now();

  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    // Log query for debugging and learning
    // Shows you the exact SQL being executed and how long it takes
    console.log('✓ Query executed', {
      text,
      duration: `${duration}ms`,
      rows: result.rowCount,
    });

    return result;
  } catch (error) {
    console.error('✗ Database query error:', error);
    throw error;
  }
}

/**
 * Get a client from the pool for transaction use
 * Learn: Transactions ensure multiple queries succeed or all fail together
 * BEGIN, COMMIT, ROLLBACK let you group operations
 *
 * Usage example for transactions:
 * const client = await getClient();
 * try {
 *   await client.query('BEGIN');
 *   await client.query('UPDATE users SET ...');
 *   await client.query('UPDATE users SET ...'); // if this fails, all rollback
 *   await client.query('COMMIT');
 * } catch (e) {
 *   await client.query('ROLLBACK');
 *   throw e;
 * } finally {
 *   client.release();
 * }
 */
export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

/**
 * Close all connections in the pool
 * Call this before app shutdown or in testing teardown
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

export default pool;



