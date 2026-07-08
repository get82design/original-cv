import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import * as utils from "../utils/create-test-cv-full-flow";

describe("CV Fullflow Integration with achievement", () => {
	it("should create a CV with achievement", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const achievement = await utils.createAchievement(
			cv.id,
			"Achievement 1",
			1,
			"Description 1",
			2020,
			"Technology 1",
		);
		expect(achievement.cvId).toBe(cv.id);
		expect(achievement.title).toBe("Achievement 1");
		expect(achievement.description).toBe("Description 1");
		expect(achievement.year).toBe(2020);
		expect(achievement.technology).toBe("Technology 1");
		expect(achievement.order).toBe(1);
	});

	it("should create a CV with achievement without optional fields", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const achievement = await utils.createAchievement(
			cv.id,
			"Achievement 1",
			1,
		);
		expect(achievement.cvId).toBe(cv.id);
		expect(achievement.title).toBe("Achievement 1");
		expect(achievement.description).toBeNull();
		expect(achievement.year).toBeNull();
		expect(achievement.technology).toBeNull();
		expect(achievement.order).toBe(1);
	});

	it("should delete a CV with achievement", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const achievement = await utils.createAchievement(
			cv.id,
			"Achievement 1",
			1,
			"Description 1",
			2020,
			"Technology 1",
		);
		await prismaTest.cV.delete({ where: { id: cv.id } });
		const achievementAfterDelete = await prismaTest.cvAchievement.findUnique({
			where: { id: achievement.id },
		});
		expect(achievementAfterDelete).toBeNull();
	});
});
