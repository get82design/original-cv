import { prismaTest } from "../../lib/prismaTest";

export async function createTestProfile(
	userId: string,
	firstName: string,
	lastName: string,
	phone?: string,
	location?: string,
) {
	return prismaTest.profile.create({
		data: {
			userId,
			firstName,
			lastName,
			phone: phone ?? null,
			location: location ?? null,
		},
	});
}
