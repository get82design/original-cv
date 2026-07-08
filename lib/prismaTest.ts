import "dotenv/config";
// import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// const connectionString = `${process.env.DATABASE_TEST_URL}`;

// const adapter = new PrismaPg({ connectionString });
// const prisma = new PrismaClient({ adapter });

// export { prisma };

const databaseUrl = process.env.DATABASE_TEST_URL;

if (!databaseUrl) {
	throw new Error("DATABASE_TEST_URL is not defined");
}

export const prismaTest = new PrismaClient({
	datasources: {
		db: {
			url: databaseUrl,
		},
	},
});
