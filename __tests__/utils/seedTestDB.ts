import { createTestUser } from "./create-test-user";
import { createTestTemplate } from "./create-test-template";

export async function seedTestDB() {
	const user = await createTestUser();
	const template = await createTestTemplate();

	return { user, template };
}
