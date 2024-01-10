import type { Config } from "drizzle-kit";
 
export default {
  schema: "./schema/*",
  out: "./drizzle",
  driver: 'pg',
  dbCredentials: {
    connectionString: 'postgres://postgres:root@localhost:5432/postgres',
  }
} satisfies Config;