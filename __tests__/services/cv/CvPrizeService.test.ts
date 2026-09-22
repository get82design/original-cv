import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { cvPrizeService } from "../../../src/services/cv/cvPrizeService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvPrizeService.create", () => {
	// TEST 1 : création nominale
	it("creates a prize", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const prize = await cvPrizeService.create(cv.id, {
			title: "Prize 1",
			domaine: "Domain 1",
			order: 1,
		});

		expect(prize.cvId).toBe(cv.id);
		expect(prize.title).toBe("Prize 1");
		expect(prize.domaine).toBe("Domain 1");
		expect(prize.order).toBe(1);
	});

	// TEST 2 : CV inexistant
	it("throws if CV does not exist", async () => {
		await expect(
			cvPrizeService.create("unknown-cv", {
				title: "Prize 1",
				domaine: "Domain 1",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : prize déjà existante
	it("throws if prize already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvPrizeService.create(cv.id, {
			title: "Prize 1",
			domaine: "Domain 1",
		});
		await expect(
			cvPrizeService.create(cv.id, {
				title: "Prize 1",
				domaine: "Domain 2",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : order déjà existante
	it("throws if order already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvPrizeService.create(cv.id, {
			title: "Prize 1",
			domaine: "Domain 1",
			order: 1,
		});

		await expect(
			cvPrizeService.create(cv.id, {
				title: "Prize 2",
				domaine: "Domain 2",
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvPrizeService.findAllByCvId", () => {
	// TEST 1 : recherche par CV
	it("returns prizes of a CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvPrizeService.create(cv.id, {
			title: "Prize 1",
			domaine: "Domain 1",
			order: 1,
		});

		await cvPrizeService.create(cv.id, {
			title: "Prize 2",
			domaine: "Domain 2",
			order: 2,
		});

		const result = await cvPrizeService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Prize 1");
		expect(result[1]!.title).toBe("Prize 2");
	});

	// TEST 2 : pas de prize existant
	it("returns empty array if no prize exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const result = await cvPrizeService.findAllByCvId(cv.id);

		expect(result).toEqual([]);
	});

	// TEST 3 : pas de prize d'un autre CV
	it("does not return prizes from another CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cvA = await createCV(user.id, template.id);
		const cvB = await createCV(user.id, template.id);
		await cvPrizeService.create(cvA.id, {
			title: "Prize 1",
			domaine: "Domain 1",
		});
		await cvPrizeService.create(cvB.id, {
			title: "Prize 2",
			domaine: "Domain 2",
		});
		const result = await cvPrizeService.findAllByCvId(cvA.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Prize 1");
	});
});

describe("CvPrizeService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a prize", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const prize = await cvPrizeService.create(cv.id, {
			title: "Prize 1",
			domaine: "Domain 1",
			order: 1,
		});
		const updated = await cvPrizeService.update(prize.id, {
			domaine: "Domain 2",
		});

		expect(updated.domaine).toBe("Domain 2");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : prize inexistant
	it("throws if prize does not exist", async () => {
		await expect(
			cvPrizeService.update("unknown-id", {
				domaine: "Domain 2",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : prize déjà existante
	it("throws if new prize already exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvPrizeService.create(cv.id, {
			title: "Prize 1",
			domaine: "Domain 1",
			order: 1,
		});
		const prize2 = await cvPrizeService.create(cv.id, {
			title: "Prize 2",
			domaine: "Domain 2",
			order: 2,
		});
		await expect(
			cvPrizeService.update(prize2.id, {
				title: "Prize 1",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour du titre
	it("updates prize title", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const certification = await cvPrizeService.create(cv.id, {
			title: "React Prize",
			domaine: "Meta",
			order: 1,
		});
		const updated = await cvPrizeService.update(certification.id, {
			title: "Angular Prize",
		});

		expect(updated.title).toBe("Angular Prize");
	});
});

describe("CvPrizeService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a prize to another position", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const prize1 = await cvPrizeService.create(cv.id, {
			title: "Prize 1",
			domaine: "Domain 1",
			order: 1,
		});
		const prize2 = await cvPrizeService.create(cv.id, {
			title: "Prize 2",
			domaine: "Domain 2",
			order: 2,
		});
		await cvPrizeService.move(prize2.id, 1);
		const result = await cvPrizeService.findAllByCvId(cv.id);

		expect(result[0]!.id).toBe(prize2.id);
		expect(result[1]!.id).toBe(prize1.id);
	});

	// TEST 2 : prize inexistant
	it("throws if prize does not exist", async () => {
		await expect(cvPrizeService.move("unknown-id", 1)).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const prize1 = await cvPrizeService.create(cv.id, {
			title: "Prize 1",
			domaine: "Domain 1",
			order: 1,
		});
		await expect(cvPrizeService.move(prize1.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expectMoveNoOp({
			createEntity: async () => {
				const prize = await cvPrizeService.create(cv.id, {
					title: "Prize 1",
					domaine: "Domain 1",
					order: 1,
				});
				return { id: prize.id, order: prize.order };
			},
			moveEntity: (id, order) => cvPrizeService.move(id, order),
		});
	});
});

describe("CvPrizeService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a prize", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const prize1 = await cvPrizeService.create(cv.id, {
			title: "Prize 1",
			domaine: "Domain 1",
			order: 1,
		});
		await cvPrizeService.delete(prize1.id);
		const result = await cvPrizeService.findAllByCvId(cv.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : prize inexistant
	it("throws if prize does not exist", async () => {
		await expect(cvPrizeService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : réorganisation des prizes après suppression
	it("reorders remaining prizes after deletion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvPrizeService.create(cv.id, {
			title: "Prize 1",
			domaine: "Domain 1",
			order: 1,
		});
		const prize2 = await cvPrizeService.create(cv.id, {
			title: "Prize 2",
			domaine: "Domain 2",
			order: 2,
		});
		await cvPrizeService.create(cv.id, {
			title: "Prize 3",
			domaine: "Domain 3",
			order: 3,
		});
		await cvPrizeService.delete(prize2.id);
		const result = await cvPrizeService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.domaine).toBe("Domain 3");
		expect(result[0]!.title).toBe("Prize 1");
		expect(result[1]!.title).toBe("Prize 3");
	});
});
