import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import * as utils from "../utils/create-test-cv-full-flow";

describe("CV Fullflow Integration with publication", () => {
	it("should create a CV with publication with all fields", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const start = new Date();
		const end = new Date();
		const publication = await utils.createPublication(
			cv.id,
			"Publication 1",
			start,
			1,
			"Description 1",
			"Journal 1",
			end,
			"https://example.com",
		);
		expect(publication.cvId).toBe(cv.id);
		expect(publication.title).toBe("Publication 1");
		expect(publication.description).toBe("Description 1");
		expect(publication.journalName).toBe("Journal 1");
		expect(publication.start).toEqual(start);
		expect(publication.end).toEqual(end);
		expect(publication.url).toBe("https://example.com");
		expect(publication.order).toBe(1);
	});

	it("should create a CV with publication without optional fields", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const start = new Date();
		const publication = await utils.createPublication(cv.id, "Publication 1", start, 1);
		expect(publication.cvId).toBe(cv.id);
		expect(publication.title).toBe("Publication 1");
		expect(publication.description).toBeNull();
		expect(publication.journalName).toBeNull();
		expect(publication.end).toBeNull();
		expect(publication.url).toBeNull();
		expect(publication.order).toBe(1);
	});

	it("should delete a CV with publication", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const publication = await utils.createPublication(
			cv.id,
			"Publication 1",
			new Date(),
			1,
			"Description 1",
			"Journal 1",
			new Date(),
			"https://example.com",
		);
		await prismaTest.cvPublication.delete({ where: { id: publication.id } });
		const deletedPublication = await prismaTest.cvPublication.findUnique({
			where: { id: publication.id },
		});
		expect(deletedPublication).toBeNull();
	});
});
