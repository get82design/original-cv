import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import * as utils from "../utils/create-test-cv-full-flow";

describe("CV Fullflow Integration with experience", () => {
	it("should create a CV with experience", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const start = new Date();
		const end = new Date();
		const experience = await utils.createExperience(
			cv.id,
			"Experience 1",
			"Company 1",
			start,
			1,
			end,
			"Description 1",
			"Location 1",
		);
		expect(experience.cvId).toBe(cv.id);
		expect(experience.title).toBe("Experience 1");
		expect(experience.company).toBe("Company 1");
		expect(experience.start).toEqual(start);
		expect(experience.end).toEqual(end);
		expect(experience.location).toBe("Location 1");
		expect(experience.description).toBe("Description 1");
		expect(experience.order).toBe(1);
	});

	it("should create a CV with experience without optional fields", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const start = new Date();
		const experience = await utils.createExperience(
			cv.id,
			"Experience 1",
			"Company 1",
			start,
			1,
		);
		expect(experience.cvId).toBe(cv.id);
		expect(experience.title).toBe("Experience 1");
		expect(experience.company).toBe("Company 1");
		expect(experience.start).toEqual(start);
		expect(experience.end).toBeNull();
		expect(experience.location).toBeNull();
		expect(experience.description).toBeNull();
		expect(experience.order).toBe(1);
	});

	it("should delete a CV with experience", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const experience = await utils.createExperience(
			cv.id,
			"Experience 1",
			"Company 1",
			new Date(),
			1,
			new Date(),
			"Description 1",
			"Location 1",
		);
		await prismaTest.cV.delete({ where: { id: cv.id } });
		const experienceAfterDelete = await prismaTest.cvExperience.findUnique({
			where: { id: experience.id },
		});
		expect(experienceAfterDelete).toBeNull();
	});
});
