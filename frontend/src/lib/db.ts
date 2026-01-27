import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Parse DATABASE_URL for PostgreSQL pool config
const databaseUrl = process.env.DATABASE_URL!;

// Create a connection pool for PostgreSQL
const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 30000,
});

// Create PostgreSQL adapter with the pool
const adapter = new PrismaPg(pool);

// Ensure we reuse PrismaClient in development to avoid multiple instances
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });
};

export const prisma = globalThis.prisma ?? prismaClientSingleton();

// Save in global to prevent multiple instances in dev (Next.js hot reload)
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
