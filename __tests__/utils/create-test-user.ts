import { prismaTest } from "../../lib/prismaTest";

export async function createTestUser() {
	return prismaTest.user.create({
		data: {
			name: "Test",
			email: `test-${Date.now()}@test.com`,
			password: "123",
		},
	});
}
