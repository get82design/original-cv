import { prismaTest } from "../../lib/prismaTest";

export async function resetTestDB() {
	const tables = await prismaTest.$queryRaw<Array<{ tablename: string }>>`
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT LIKE 'pg_%'
AND tablename <> '_prisma_migrations';
`;

	if (tables.length === 0) {
		return;
	}

	const tableNames = tables.map((t) => `"${t.tablename}"`).join(", ");

	await prismaTest.$executeRawUnsafe(`
TRUNCATE TABLE ${tableNames}
RESTART IDENTITY CASCADE;
`);
}

export async function disconnectTestDB() {
	await prismaTest.$disconnect();
}
