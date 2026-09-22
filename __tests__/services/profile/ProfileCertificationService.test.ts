import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { profileCertificationService } from "../../../src/services/profile/profileCertificationService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileCertificationService.create", () => {
	// TEST 1 : création nominale
	it("creates a certification", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const certification = await profileCertificationService.create(profile.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});

		expect(certification.profileId).toBe(profile.id);
		expect(certification.title).toBe("Certification 1");
		expect(certification.organismeCertification).toBe("Organisme 1");
		expect(certification.order).toBe(1);
	});

	// TEST 2 : Profile inexistant
	it("throws if Profile does not exist", async () => {
		await expect(
			profileCertificationService.create("unknown-profile", {
				title: "Certification 1",
				organismeCertification: "Organisme 1",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : certification déjà existante
	it("throws if certification already exists for profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileCertificationService.create(profile.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
		});
		await expect(
			profileCertificationService.create(profile.id, {
				title: "Certification 1",
				organismeCertification: "Organisme 2",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : order déjà existante
	it("throws if order already exists for profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileCertificationService.create(profile.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});

		await expect(
			profileCertificationService.create(profile.id, {
				title: "Certification 2",
				organismeCertification: "Organisme 2",
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileCertificationService.findAllByProfileId", () => {
	// TEST 1 : recherche par profile
	it("returns certifications of a profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileCertificationService.create(profile.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});

		await profileCertificationService.create(profile.id, {
			title: "Certification 2",
			organismeCertification: "Organisme 2",
			order: 2,
		});

		const result = await profileCertificationService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.title).toBe("Certification 1");
		expect(result[1]!.title).toBe("Certification 2");
	});

	// TEST 2 : pas de certification existant
	it("returns empty array if no certification exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const result = await profileCertificationService.findAllByProfileId(profile.id);

		expect(result).toEqual([]);
	});

	// TEST 3 : pas de certification d'un autre profile
	it("does not return certifications from another Profile", async () => {
		const user = await createTestUser();
		const user2 = await createTestUser();
		const profileA = await createTestProfile(user.id, "John", "Doe");
		const profileB = await createTestProfile(user2.id, "Jane", "Doe");
		await profileCertificationService.create(profileA.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
		});
		await profileCertificationService.create(profileB.id, {
			title: "Certification 2",
			organismeCertification: "Organisme 2",
		});
		const result = await profileCertificationService.findAllByProfileId(profileA.id);

		expect(result).toHaveLength(1);
		expect(result[0]!.title).toBe("Certification 1");
	});
});

describe("ProfileCertificationService.update", () => {
	// TEST 1 : mise à jour nominale
	it("updates a certification", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const certification = await profileCertificationService.create(profile.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});
		const updated = await profileCertificationService.update(certification.id, {
			organismeCertification: "Organisme 2",
		});

		expect(updated.organismeCertification).toBe("Organisme 2");
		expect(updated.order).toBe(1);
	});

	// TEST 2 : certification inexistant
	it("throws if certification does not exist", async () => {
		await expect(
			profileCertificationService.update("unknown-id", {
				organismeCertification: "Organisme 2",
			}),
		).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : certification déjà existante
	it("throws if new certification already exists", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileCertificationService.create(profile.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});
		const certification2 = await profileCertificationService.create(profile.id, {
			title: "Certification 2",
			organismeCertification: "Organisme 2",
			order: 2,
		});
		await expect(
			profileCertificationService.update(certification2.id, {
				title: "Certification 1",
			}),
		).rejects.toThrow(ConflictError);
	});

	// TEST 4 : mise à jour du titre
	it("updates certification title", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const certification = await profileCertificationService.create(profile.id, {
			title: "React Certification",
			organismeCertification: "Meta",
			order: 1,
		});
		const updated = await profileCertificationService.update(certification.id, {
			title: "Angular Certification",
		});

		expect(updated.title).toBe("Angular Certification");
	});
});

describe("ProfileCertificationService.move", () => {
	// TEST 1 : déplacement nominale
	it("moves a certification to another position", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const certification1 = await profileCertificationService.create(profile.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});
		const certification2 = await profileCertificationService.create(profile.id, {
			title: "Certification 2",
			organismeCertification: "Organisme 2",
			order: 2,
		});
		await profileCertificationService.move(certification2.id, 1);
		const result = await profileCertificationService.findAllByProfileId(profile.id);

		expect(result[0]!.id).toBe(certification2.id);
		expect(result[1]!.id).toBe(certification1.id);
	});

	// TEST 2 : certification inexistant
	it("throws if certification does not exist", async () => {
		await expect(profileCertificationService.move("unknown-id", 1)).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : ordre invalide
	it("throws if order is invalid", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const certification1 = await profileCertificationService.create(profile.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});
		await expect(profileCertificationService.move(certification1.id, 0)).rejects.toThrow();
	});

	it("move no-op if order is the same", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		return await expectMoveNoOp({
			createEntity: async () => {
				const certification = await profileCertificationService.create(profile.id, {
					title: "Certification 1",
					organismeCertification: "Organisme 1",
					order: 1,
				});
				return { id: certification.id, order: certification.order };
			},
			moveEntity: (id, order) => profileCertificationService.move(id, order),
		});
	});
});

describe("ProfileCertificationService.delete", () => {
	// TEST 1 : suppression nominale
	it("deletes a certification", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const certification1 = await profileCertificationService.create(profile.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});
		await profileCertificationService.delete(certification1.id);
		const result = await profileCertificationService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(0);
	});

	// TEST 2 : certification inexistant
	it("throws if certification does not exist", async () => {
		await expect(profileCertificationService.delete("unknown-id")).rejects.toThrow(NotFoundError);
	});

	// TEST 3 : réorganisation des certifications après suppression
	it("reorders remaining certifications after deletion", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileCertificationService.create(profile.id, {
			title: "Certification 1",
			organismeCertification: "Organisme 1",
			order: 1,
		});
		const certification2 = await profileCertificationService.create(profile.id, {
			title: "Certification 2",
			organismeCertification: "Organisme 2",
			order: 2,
		});
		await profileCertificationService.create(profile.id, {
			title: "Certification 3",
			organismeCertification: "Organisme 3",
			order: 3,
		});
		await profileCertificationService.delete(certification2.id);
		const result = await profileCertificationService.findAllByProfileId(profile.id);

		expect(result).toHaveLength(2);
		expect(result[0]!.order).toBe(1);
		expect(result[1]!.order).toBe(2);
		expect(result[1]!.organismeCertification).toBe("Organisme 3");
		expect(result[0]!.title).toBe("Certification 1");
		expect(result[1]!.title).toBe("Certification 3");
	});
});
