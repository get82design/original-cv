import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import * as utils from "../utils/create-test-cv-full-flow";
import { Level } from "../../generated/prisma/enums";

describe("CV Fullflow Integration with language", () => {
	it("should create a CV with language", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const language = await utils.createLanguage(cv.id, "English", Level.Intermédiaire, 1);
		expect(language.cvId).toBe(cv.id);
		expect(language.name).toBe("English");
		expect(language.level).toBe(Level.Intermédiaire);
		expect(language.order).toBe(1);
	});

	it("should delete a CV with language", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const language = await utils.createLanguage(cv.id, "English", Level.Intermédiaire, 1);
		await prismaTest.cV.delete({ where: { id: cv.id } });
		const languageAfterDelete = await prismaTest.cvLanguage.findUnique({
			where: { id: language.id },
		});
		expect(languageAfterDelete).toBeNull();
	});
});
