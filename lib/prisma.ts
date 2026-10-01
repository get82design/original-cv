import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";

function isTestEnv(): boolean {
	return process.env.VITEST === "true" || process.env.NODE_ENV === "test";
}

/** Seed CLI (`tsx prisma/seed.ts`) — cohabite avec `next dev`. */
function isSeedProcess(): boolean {
	return process.argv.some(
		(arg) => /(^|[\\/])seed\.(ts|js)$/.test(arg) || arg.endsWith("seed"),
	);
}

/** Limite le pool — sinon FATAL trop de clients (surtout seed // + Next). */
function withPoolLimit(url: string, limit: number): string {
	const parsed = new URL(url);
	if (!parsed.searchParams.has("connection_limit")) {
		parsed.searchParams.set("connection_limit", String(limit));
	}
	if (!parsed.searchParams.has("pool_timeout")) {
		parsed.searchParams.set("pool_timeout", "20");
	}
	return parsed.toString();
}

function resolveDatabaseUrl(): string {
	if (isTestEnv()) {
		if (!process.env.DATABASE_TEST_URL) {
			throw new Error("DATABASE_TEST_URL is not defined");
		}
		return withPoolLimit(process.env.DATABASE_TEST_URL, 5);
	}
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL is not defined");
	}
	if (isSeedProcess()) {
		return withPoolLimit(process.env.DATABASE_URL, 5);
	}
	return process.env.DATABASE_URL;
}

const globalForPrisma = globalThis as unknown as {
	__prisma?: PrismaClient;
};

export const prisma =
	globalForPrisma.__prisma ??
	new PrismaClient({
		datasources: { db: { url: resolveDatabaseUrl() } },
	});

if (isTestEnv()) {
	globalForPrisma.__prisma = prisma;
}
