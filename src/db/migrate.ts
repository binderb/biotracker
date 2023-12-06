import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config({path:'.env.local'});

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
});

const db = drizzle(pool);

async function main () {
  console.log('Migration started...');
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log("Migration finished!");
  process.exit(0);
}

main().catch((err) => {
  console.log(err);
  process.exit(0);
});