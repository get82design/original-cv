import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import * as utils from "../utils/create-test-cv-full-flow";

describe("CV Fullflow Integration with philosophy", () => {
	it("should create a CV with philosophy", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const philosophy = await utils.createPhilosophy(cv.id, "Philosophy 1", "Author 1");
		expect(philosophy.cvId).toBe(cv.id);
		expect(philosophy.citation).toBe("Philosophy 1");
		expect(philosophy.author).toBe("Author 1");
	});

	it("should create a CV with philosophy without optional fields", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const philosophy = await utils.createPhilosophy(cv.id, "Philosophy 1");
		expect(philosophy.cvId).toBe(cv.id);
		expect(philosophy.citation).toBe("Philosophy 1");
		expect(philosophy.author).toBeNull();
	});

	it("should delete a CV with philosophy", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const philosophy = await utils.createPhilosophy(cv.id, "Philosophy 1", "Author 1");
		await prismaTest.cV.delete({ where: { id: cv.id } });
		const philosophyAfterDelete = await prismaTest.cvPhilosophy.findUnique({
			where: { id: philosophy.id },
		});
		expect(philosophyAfterDelete).toBeNull();
	});
});
