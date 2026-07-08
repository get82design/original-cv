import { prismaTest } from "../../lib/prismaTest";
import { createTestModule } from "./create-test-module";

export async function createModuleWithItem() {
	const { module } = await createTestModule();

	const item = await prismaTest.cVModuleItem.create({
		data: {
			moduleId: module.id,
			itemType: "cvSkillGroup",
			itemId: "cvSkillGroup-test-id",
		},
	});

	return { module, item };
}
