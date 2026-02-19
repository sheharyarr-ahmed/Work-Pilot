import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  let PrismaBetterSqlite3: new (
    options: { url: string },
  ) => Prisma.PrismaClientOptions["adapter"];
  try {
    ({ PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3"));
  } catch {
    throw new Error(
      'Missing Prisma SQLite adapter. Run: npm i @prisma/adapter-better-sqlite3',
    );
  }

  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
