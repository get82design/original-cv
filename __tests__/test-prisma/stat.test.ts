import { describe, expect, it } from "vitest";
import { createTestUserWithProfile } from "../utils/create-test-user-with-profile";
import { prismaTest } from "../../lib/prismaTest";

describe("Stat model", () => {
	describe("CREATE", () => {
		it("should create a profile with stats", async () => {
			const user = await createTestUserWithProfile({
				stats: [{ label: "projets", value: "+50", order: 1 }],
			});
			const stat = user.profile!.stats![0]!;
			expect(stat.label).toBe("projets");
			expect(stat.value).toBe("+50");
			expect(stat.order).toBe(1);
		});
	});

	describe("CREATE ERRORS", () => {
		it("should not create a stat without a profile", async () => {
			await expect(
				prismaTest.stat.create({
					data: {
						label: "projets",
						value: "+50",
						order: 1,
						profile: { connect: { id: "non-existing-id" } },
					},
				}),
			).rejects.toThrow();
		});

		it("should not create duplicate label for same profile", async () => {
			const user = await createTestUserWithProfile({
				stats: [{ label: "projets", value: "+50", order: 1 }],
			});
			await expect(
				prismaTest.stat.create({
					data: {
						label: "projets",
						value: "10",
						order: 2,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});

		it("should not create duplicate order for same profile", async () => {
			const user = await createTestUserWithProfile({
				stats: [{ label: "projets", value: "+50", order: 1 }],
			});
			await expect(
				prismaTest.stat.create({
					data: {
						label: "clients",
						value: "12",
						order: 1,
						profile: { connect: { id: user.profile.id } },
					},
				}),
			).rejects.toThrow();
		});
	});

	describe("DELETE CASCADE", () => {
		it("should delete stats when profile is deleted", async () => {
			const user = await createTestUserWithProfile({
				stats: [{ label: "projets", value: "+50", order: 1 }],
			});
			const statId = user.profile!.stats![0]!.id;
			await prismaTest.profile.delete({ where: { id: user.profile.id } });
			const found = await prismaTest.stat.findUnique({ where: { id: statId } });
			expect(found).toBeNull();
		});
	});
});
