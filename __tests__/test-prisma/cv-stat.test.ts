import { describe, expect, it } from "vitest";
import { createTestUser } from "../utils/create-test-user";
import { createTestTemplate } from "../utils/create-test-template";
import { createCV, createStat } from "../utils/create-test-cv-full-flow";
import { prismaTest } from "../../lib/prismaTest";

describe("CvStat model", () => {
	it("should create a cv stat", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const stat = await createStat(cv.id, "projets", "+50", 1);
		expect(stat.cvId).toBe(cv.id);
		expect(stat.label).toBe("projets");
		expect(stat.value).toBe("+50");
	});

	it("should not create duplicate label for same cv", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await createStat(cv.id, "projets", "+50", 1);
		await expect(createStat(cv.id, "projets", "10", 2)).rejects.toThrow();
	});

	it("should delete stats when cv is deleted", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const stat = await createStat(cv.id, "projets", "+50", 1);
		await prismaTest.cV.delete({ where: { id: cv.id } });
		const found = await prismaTest.cvStat.findUnique({ where: { id: stat.id } });
		expect(found).toBeNull();
	});
});
