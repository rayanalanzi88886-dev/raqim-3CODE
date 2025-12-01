import type { Config } from "drizzle-kit";

export default {
  schema: "./server/db/schema/*",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/raqim",
  },
} satisfies Config;
