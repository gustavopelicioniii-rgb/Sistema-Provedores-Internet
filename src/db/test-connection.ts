import pool, { query } from './pool.js';

async function testConnection() {
  try {
    console.log('Testing database connection...');

    const result = await query('SELECT 1 as connected, NOW() as server_time');
    console.log('Database connected:', result.rows[0]);

    const rlsCheck = await query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public' AND rowsecurity = true
    `);
    console.log(`RLS enabled on ${rlsCheck.rowCount} tables:`, rlsCheck.rows.map(r => r.tablename));

    const tableCheck = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log(`Total tables: ${tableCheck.rowCount}`);
    tableCheck.rows.forEach(r => console.log(`  - ${r.table_name}`));

    console.log('\nDatabase connection test PASSED');
  } catch (error: any) {
    console.error('Database connection FAILED:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
