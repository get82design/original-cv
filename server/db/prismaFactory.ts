import { PrismaClient as PrismaProd } from './../../generated/prisma';
import { PrismaClient as PrismaTest } from './../../generated/prisma-test';

export const prisma = process.env.NODE_ENV === 'test' ? new PrismaTest() : new PrismaProd();
