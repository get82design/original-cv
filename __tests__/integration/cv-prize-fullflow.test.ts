import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import * as utils from "../utils/create-test-cv-full-flow";

describe("CV Fullflow Integration with prize", () => {
	it("should create a CV with prize", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const prize = await utils.createPrize(cv.id, "Prize 1", "Domaine 1", 1, "💰");
		expect(prize.cvId).toBe(cv.id);
		expect(prize.title).toBe("Prize 1");
		expect(prize.domaine).toBe("Domaine 1");
		expect(prize.icon).toBe("💰");
		expect(prize.order).toBe(1);
	});

	it("should create a CV with prize without optional fields", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const prize = await utils.createPrize(cv.id, "Prize 1", "Domaine 1", 1);
		expect(prize.cvId).toBe(cv.id);
		expect(prize.title).toBe("Prize 1");
		expect(prize.domaine).toBe("Domaine 1");
		expect(prize.icon).toBeNull();
	});

	it("should delete a CV with prize", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const prize = await utils.createPrize(cv.id, "Prize 1", "Domaine 1", 1, "💰");
		await prismaTest.cV.delete({ where: { id: cv.id } });
		const prizeAfterDelete = await prismaTest.cvPrize.findUnique({
			where: { id: prize.id },
		});
		expect(prizeAfterDelete).toBeNull();
	});
});
