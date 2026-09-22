import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";

function isTestEnv(): boolean {
	return process.env.VITEST === "true" || process.env.NODE_ENV === "test";
}

/** Limite le pool en test — 2 clients × pool large = FATAL trop de connexions. */
function withTestPoolLimit(url: string): string {
	if (!isTestEnv()) return url;
	const parsed = new URL(url);
	if (!parsed.searchParams.has("connection_limit")) {
		parsed.searchParams.set("connection_limit", "5");
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
		return withTestPoolLimit(process.env.DATABASE_TEST_URL);
	}
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL is not defined");
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
