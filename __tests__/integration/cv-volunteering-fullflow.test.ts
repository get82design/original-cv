import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import * as utils from "../utils/create-test-cv-full-flow";

describe("CV Fullflow Integration with strength", () => {
	it("should create a CV with volunteering with all fields", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const start = new Date();
		const end = new Date();
		const volunteering = await utils.createVolunteering(
			cv.id,
			"Volunteering 1",
			"Organization 1",
			1,
			start,
			"Description 1",
			end,
			"Location 1",
		);
		expect(volunteering.cvId).toBe(cv.id);
		expect(volunteering.title).toBe("Volunteering 1");
		expect(volunteering.organisation).toBe("Organization 1");
		expect(volunteering.description).toBe("Description 1");
		expect(volunteering.start).toEqual(start);
		expect(volunteering.end).toEqual(end);
		expect(volunteering.location).toBe("Location 1");
		expect(volunteering.order).toBe(1);
	});

	it("should create a CV with volunteering without optional fields", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const volunteering = await utils.createVolunteering(
			cv.id,
			"Volunteering 1",
			"Organization 1",
			1,
			new Date(),
		);
		expect(volunteering.cvId).toBe(cv.id);
		expect(volunteering.title).toBe("Volunteering 1");
		expect(volunteering.organisation).toBe("Organization 1");
		expect(volunteering.description).toBeNull();
	});

	it("should delete a CV with volunteering", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const volunteering = await utils.createVolunteering(
			cv.id,
			"Volunteering 1",
			"Organization 1",
			1,
			new Date(),
			"Description 1",
			new Date(),
			"Location 1",
		);
		await prismaTest.cvVolunteering.delete({ where: { id: volunteering.id } });
		const deletedVolunteering = await prismaTest.cvVolunteering.findUnique({
			where: { id: volunteering.id },
		});
		expect(deletedVolunteering).toBeNull();
	});
});
