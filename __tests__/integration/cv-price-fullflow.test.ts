import { describe, it, expect } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import * as utils from "../utils/create-test-cv-full-flow";

describe("CV Fullflow Integration with price", () => {
	it("should create a CV with price", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const price = await utils.createPrice(
			cv.id,
			"Price 1",
			"Domaine 1",
			1,
			"💰",
		);
		expect(price.cvId).toBe(cv.id);
		expect(price.title).toBe("Price 1");
		expect(price.domaine).toBe("Domaine 1");
		expect(price.icon).toBe("💰");
		expect(price.order).toBe(1);
	});

	it("should create a CV with price without optional fields", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const price = await utils.createPrice(cv.id, "Price 1", "Domaine 1", 1);
		expect(price.cvId).toBe(cv.id);
		expect(price.title).toBe("Price 1");
		expect(price.domaine).toBe("Domaine 1");
		expect(price.icon).toBeNull();
	});

	it("should delete a CV with price", async () => {
		const { user, template } = await utils.createUserAndTemplate();
		const cv = await utils.createCV(user.id, template.id);
		const price = await utils.createPrice(
			cv.id,
			"Price 1",
			"Domaine 1",
			1,
			"💰",
		);
		await prismaTest.cV.delete({ where: { id: cv.id } });
		const priceAfterDelete = await prismaTest.cvPrice.findUnique({
			where: { id: price.id },
		});
		expect(priceAfterDelete).toBeNull();
	});
});
