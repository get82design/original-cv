import "dotenv/config";
import { prisma } from "./prisma";

/**
 * Alias du client app en environnement de test.
 * Un seul PrismaClient → évite d’épuiser max_connections Postgres
 * sur la suite longue (services + helpers utilisent `prisma` et `prismaTest`).
 */
export const prismaTest = prisma;
