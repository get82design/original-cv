import "dotenv/config";
// import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// const connectionString = `${process.env.DATABASE_URL}`;

// const adapter = new PrismaPg({ connectionString });
// const prisma = new PrismaClient({ adapter });

// export { prisma };

// export const prisma = new PrismaClient();

function resolveDatabaseUrl(): string {
	const isTest =
		process.env.VITEST === "true" || process.env.NODE_ENV === "test";
	if (isTest) {
		if (!process.env.DATABASE_TEST_URL) {
			throw new Error("DATABASE_TEST_URL is not defined");
		}
		return process.env.DATABASE_TEST_URL;
	}
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL is not defined");
	}
	return process.env.DATABASE_URL;
}
export const prisma = new PrismaClient({
	datasources: { db: { url: resolveDatabaseUrl() } },
});
