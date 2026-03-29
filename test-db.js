import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://postgres.uqepwcyseokcuhshfolw:AzanMunir123@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";

const client = new Client({
  connectionString: connectionString,
});

async function testConnection() {
  console.log("Testing connection...");
  try {
    await client.connect();
    console.log("Connected successfully!");
    const res = await client.query('SELECT NOW()');
    console.log("Query result:", res.rows[0]);
    await client.end();
  } catch (err) {
    console.error("Connection error:", err.message);
    process.exit(1);
  }
}

testConnection();
