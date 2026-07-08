import { prismaTest } from "../../lib/prismaTest";
import { createTestUser } from "./create-test-user";
import { createTestTemplate } from "./create-test-template";

export async function createTestCV() {
	const user = await createTestUser();
	const template = await createTestTemplate();

	const cv = await prismaTest.cV.create({
		data: {
			title: "Test CV",
			userId: user.id,
			templateId: template.id,
		},
	});

	return { user, template, cv };
}
