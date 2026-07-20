import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { createTestTemplate } from "../../utils/create-test-template";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { cvSocialMediaService } from "../../../src/services/cv/cvSocialMediaService";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("CvSocialMediaService.create", () => {
	// TEST 1 : création nominale
	it("creates a social media", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const socialMedia = await cvSocialMediaService.create(cv.id, {
			socialNetwork: "LinkedIn",
			username: "john",
			order: 1,
		});

		expect(socialMedia.cvId).toBe(cv.id);
		expect(socialMedia.socialNetwork).toBe("LinkedIn");
		expect(socialMedia.username).toBe("john");
		expect(socialMedia.order).toBe(1);
	});

	// TEST 2 : CV inexistant
	it("throws if CV does not exist", async () => {
		await expect(
			cvSocialMediaService.create("unknown-cv", {
				socialNetwork: "LinkedIn",
				username: "john",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : social network déjà existante
	it("throws if social network already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvSocialMediaService.create(cv.id, {
			socialNetwork: "LinkedIn",
			username: "john",
		});
		await expect(
			cvSocialMediaService.create(cv.id, {
				socialNetwork: "LinkedIn",
				username: "another-user",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : order déjà existante
	it("throws if order already exists for CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvSocialMediaService.create(cv.id, {
			socialNetwork: "LinkedIn",
			username: "john",
			order: 1,
		});

		await expect(
			cvSocialMediaService.create(cv.id, {
				socialNetwork: "Github",
				username: "john-dev",
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvSocialMediaService.findAllByCvId", () => {
	// TEST 1 : recherche par CV
	it("returns social medias of a CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvSocialMediaService.create(cv.id, {
			socialNetwork: "LinkedIn",
			username: "john",
			order: 1,
		});

		await cvSocialMediaService.create(cv.id, {
			socialNetwork: "Github",
			username: "john-dev",
			order: 2,
		});

		const result = await cvSocialMediaService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.socialNetwork).toBe("LinkedIn");
		expect(result[1]!.socialNetwork).toBe("Github");
	});

	// TEST 2 : pas de social media existant
	it("returns empty array if no social media exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();

		const cv = await createCV(user.id, template.id);

		const result = await cvSocialMediaService.findAllByCvId(cv.id);

		expect(result).toEqual([]);
	});

	// TEST 3 : pas de social media d'un autre CV
	it("does not return social medias from another CV", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cvA = await createCV(user.id, template.id);
		const cvB = await createCV(user.id, template.id);
		await cvSocialMediaService.create(cvA.id, {
			socialNetwork: "LinkedIn",
			username: "user-a",
		});
		await cvSocialMediaService.create(cvB.id, {
			socialNetwork: "Github",
			username: "user-b",
		});
		const result = await cvSocialMediaService.findAllByCvId(cvA.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.username).toBe("user-a");
	});
});

describe("CvSocialMediaService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a social media", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const socialMedia = await cvSocialMediaService.create(cv.id, {
			socialNetwork: "LinkedIn",
			username: "old-user",
			order: 1,
		});
		const updated = await cvSocialMediaService.update(socialMedia.id, {
			username: "new-user",
		});

		expect(updated.username).toBe("new-user");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : social media inexistant
	it("throws if social media does not exist", async () => {
		await expect(
			cvSocialMediaService.update("unknown-id", {
				username: "test",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : social network déjà existante
	it("throws if new social network already exists", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvSocialMediaService.create(cv.id, {
			socialNetwork: "LinkedIn",
			username: "john",
			order: 1,
		});
		const github = await cvSocialMediaService.create(cv.id, {
			socialNetwork: "Github",
			username: "john-dev",
			order: 2,
		});
		await expect(
			cvSocialMediaService.update(github.id, {
				socialNetwork: "LinkedIn",
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvSocialMediaService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a social media to another position", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const linkedin = await cvSocialMediaService.create(cv.id, {
			socialNetwork: "LinkedIn",
			username: "john",
			order: 1,
		});
		const github = await cvSocialMediaService.create(cv.id, {
			socialNetwork: "Github",
			username: "dev",
			order: 2,
		});
		await cvSocialMediaService.move(github.id, 1);
		const result = await cvSocialMediaService.findAllByCvId(cv.id);

		expect(result[0]!.id).toBe(github.id);
		expect(result[1]!.id).toBe(linkedin.id);
	});

	// TEST 2 : social media inexistant
	it("throws if social media does not exist", async () => {
		await expect(cvSocialMediaService.move("unknown-id", 1)).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const social = await cvSocialMediaService.create(cv.id, {
			socialNetwork: "LinkedIn",
			username: "john",
		});
		await expect(cvSocialMediaService.move(social.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await expectMoveNoOp({
			createEntity: async () => {
				const social = await cvSocialMediaService.create(cv.id, {
					socialNetwork: "LinkedIn",
					username: "john",
					order: 1,
				});
				return { id: social.id, order: social.order };
			},
			moveEntity: (id, order) => cvSocialMediaService.move(id, order),
		});
	});
});

describe("CvSocialMediaService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a social media", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		const socialMedia = await cvSocialMediaService.create(cv.id, {
			socialNetwork: "LinkedIn",
			username: "john",
			order: 1,
		});
		await cvSocialMediaService.delete(socialMedia.id);
		const result = await cvSocialMediaService.findAllByCvId(cv.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : social media inexistant
	it("throws if social media does not exist", async () => {
		await expect(cvSocialMediaService.delete("unknown-id")).rejects.toThrow(
			NotFoundError,
		);
	});

	// TEST 3 : réorganisation des social medias après suppression
	it("reorders remaining social medias after deletion", async () => {
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await cvSocialMediaService.create(cv.id, {
			socialNetwork: "LinkedIn",
			username: "john",
			order: 1,
		});
		const github = await cvSocialMediaService.create(cv.id, {
			socialNetwork: "Github",
			username: "dev",
			order: 2,
		});
		await cvSocialMediaService.create(cv.id, {
			socialNetwork: "Twitter",
			username: "twitter",
			order: 3,
		});
		await cvSocialMediaService.delete(github.id);
		const result = await cvSocialMediaService.findAllByCvId(cv.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.socialNetwork).toBe("Twitter");
	});
});
