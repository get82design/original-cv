import 'dotenv/config';
import { PrismaClient } from '../generated/prisma-test/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const prismaTest = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: 'file:./prisma/test.db',
  }),
});

export { prismaTest };
