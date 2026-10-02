import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import { createTestProfile } from "../../utils/create-test-profile";
import { profileStatService } from "../../../src/services/profile/profileStatService";
import { expectMoveNoOp } from "../../utils/move-noop";

describe("ProfileStatService.create", () => {
	it("creates a stat", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const stat = await profileStatService.create(profile.id, {
			label: "projets",
			value: "+50",
			order: 1,
		});

		expect(stat.profileId).toBe(profile.id);
		expect(stat.label).toBe("projets");
		expect(stat.value).toBe("+50");
		expect(stat.order).toBe(1);
	});

	it("throws if Profile does not exist", async () => {
		await expect(
			profileStatService.create("unknown-profile", {
				label: "projets",
				value: "+50",
				order: 1,
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws if label already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileStatService.create(profile.id, {
			label: "projets",
			value: "+50",
			order: 1,
		});
		await expect(
			profileStatService.create(profile.id, {
				label: "projets",
				value: "10",
				order: 2,
			}),
		).rejects.toThrow(ConflictError);
	});

	it("throws if order already exists for Profile", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileStatService.create(profile.id, {
			label: "projets",
			value: "+50",
			order: 1,
		});
		await expect(
			profileStatService.create(profile.id, {
				label: "clients",
				value: "12",
				order: 1,
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ProfileStatService.findAllByProfileId", () => {
	it("returns stats ordered by order", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await profileStatService.create(profile.id, { label: "b", value: "2", order: 2 });
		await profileStatService.create(profile.id, { label: "a", value: "1", order: 1 });
		const list = await profileStatService.findAllByProfileId(profile.id);
		expect(list.map((s) => s.label)).toEqual(["a", "b"]);
	});
});

describe("ProfileStatService.update", () => {
	it("updates label and value", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const created = await profileStatService.create(profile.id, {
			label: "projets",
			value: "+50",
			order: 1,
		});
		const updated = await profileStatService.update(created.id, {
			label: "clients",
			value: "12",
		});
		expect(updated.label).toBe("clients");
		expect(updated.value).toBe("12");
	});

	it("throws if not found", async () => {
		await expect(profileStatService.update("unknown", { value: "1" })).rejects.toThrow(
			NotFoundError,
		);
	});
});

describe("ProfileStatService.move", () => {
	it("reorders stats", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const a = await profileStatService.create(profile.id, { label: "a", value: "1", order: 1 });
		await profileStatService.create(profile.id, { label: "b", value: "2", order: 2 });
		await profileStatService.move(a.id, 2);
		const list = await profileStatService.findAllByProfileId(profile.id);
		expect(list.map((s) => s.label)).toEqual(["b", "a"]);
	});

	it("no-op when same order", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		await expectMoveNoOp({
			createEntity: async () =>
				profileStatService.create(profile.id, { label: "a", value: "1", order: 1 }),
			moveEntity: (id, newOrder) => profileStatService.move(id, newOrder),
		});
	});
});

describe("ProfileStatService.delete", () => {
	it("deletes and compact orders", async () => {
		const user = await createTestUser();
		const profile = await createTestProfile(user.id, "John", "Doe");
		const a = await profileStatService.create(profile.id, { label: "a", value: "1", order: 1 });
		await profileStatService.create(profile.id, { label: "b", value: "2", order: 2 });
		await profileStatService.delete(a.id);
		const list = await profileStatService.findAllByProfileId(profile.id);
		expect(list).toHaveLength(1);
		expect(list[0]!.label).toBe("b");
		expect(list[0]!.order).toBe(1);
	});
});
