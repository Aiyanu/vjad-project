import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import mariadb from "mariadb";

// Parse DATABASE_URL for MariaDB pool config
const databaseUrl = new URL(process.env.DATABASE_URL!);

// Create a connection pool for MariaDB
const pool = mariadb.createPool({
  host: databaseUrl.hostname,
  port: parseInt(databaseUrl.port) || 3306,
  user: databaseUrl.username,
  password: databaseUrl.password,
  database: databaseUrl.pathname.slice(1), // Remove leading slash
  connectionLimit: 10,
  acquireTimeout: 30000,
  idleTimeout: 60000,
  minimumIdle: 2,
});

// Create MariaDB adapter with the connection string
const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);

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
