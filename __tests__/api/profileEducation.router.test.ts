import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";
import { CvTimelineStatus } from "../../generated/prisma/enums";

describe("profileEducationRouter", () => {
	async function createUserWithProfile() {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.profile.create({
			firstName: "John",
			lastName: "Doe",
		});

		return { user, caller };
	}

	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();

		await expect(
			caller.profileEducation.create({
				title: "Education 1",
				school: "School 1",
				degree: "Degree 1",
				start: new Date(),
				end: new Date(),
				city: "City 1",
				obtained: CvTimelineStatus.COMPLETED,
				order: 1,
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create returns NOT_FOUND when profile does not exist", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.profileEducation.create({
				title: "Education 1",
				school: "School 1",
				degree: "Degree 1",
				start: new Date(),
				end: new Date(),
				city: "City 1",
				obtained: CvTimelineStatus.COMPLETED,
				order: 1,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("create creates a education via tRPC", async () => {
		const { caller } = await createUserWithProfile();

		const education = await caller.profileEducation.create({
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date("2020-01-01"),
			end: new Date("2024-01-01"),
			city: "City 1",
			obtained: CvTimelineStatus.COMPLETED,
			order: 1,
		});

		expect(education.title).toBe("Education 1");
		expect(education.school).toBe("School 1");
		expect(education.degree).toBe("Degree 1");
		expect(education.city).toBe("City 1");
		expect(education.start).toStrictEqual(new Date("2020-01-01"));
		expect(education.end).toStrictEqual(new Date("2024-01-01"));
		expect(education.obtained).toBe(CvTimelineStatus.COMPLETED);
		expect(education.order).toBe(1);
	});

	it("create rejects missing required fields (Zod)", async () => {
		const { caller } = await createUserWithProfile();

		await expect(
			// @ts-expect-error — test de validation runtime
			caller.profileEducation.create({
				title: "Education 1",
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONFLICT when education already exists", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileEducation.create({
			title: "Same education",
			school: "School 1",
			degree: "Degree 1",
			start: new Date(),
			end: new Date(),
			city: "City 1",
			obtained: CvTimelineStatus.COMPLETED,
			order: 1,
		});

		await expect(
			caller.profileEducation.create({
				title: "Same education",
				school: "School 1",
				degree: "Degree 1",
				start: new Date(),
				end: new Date(),
				city: "City 1",
				obtained: CvTimelineStatus.COMPLETED,
				order: 2,
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAll returns education ordered", async () => {
		const { caller } = await createUserWithProfile();

		await caller.profileEducation.create({
			title: "Education 2",
			school: "School 1",
			degree: "Degree 1",
			start: new Date(),
			end: new Date(),
			city: "City 1",
			obtained: CvTimelineStatus.COMPLETED,
			order: 2,
		});
		await caller.profileEducation.create({
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date(),
			end: new Date(),
			city: "City 1",
			obtained: CvTimelineStatus.COMPLETED,
			order: 1,
		});

		const list = await caller.profileEducation.findAll();

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("Education 1");
		expect(list[1]?.title).toBe("Education 2");
	});

	it("update updates a education", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileEducation.create({
			title: "Old education",
			school: "School 1",
			degree: "Degree 1",
			start: new Date(),
			end: new Date(),
			city: "City 1",
			obtained: CvTimelineStatus.COMPLETED,
			order: 1,
		});

		const updated = await caller.profileEducation.update({
			id: created.id,
			data: {
				title: "New education",
				school: "School 1",
				degree: "Degree 1",
				start: new Date(),
				end: new Date(),
				city: "City 1",
				obtained: CvTimelineStatus.COMPLETED,
			},
		});

		expect(updated.title).toBe("New education");
	});

	it("update returns FORBIDDEN for wrong user", async () => {
		const { caller: ownerCaller } = await createUserWithProfile();
		const otherUser = await createTestUser();
		const otherCaller = await createTestCaller(createTestSession(otherUser));

		const created = await ownerCaller.profileEducation.create({
			title: "Education 1",
			school: "School 1",
			degree: "Degree 1",
			start: new Date(),
			end: new Date(),
			city: "City 1",
			obtained: CvTimelineStatus.COMPLETED,
			order: 1,
		});

		await expect(
			otherCaller.profileEducation.update({
				id: created.id,
				data: {
					title: "Hack",
					school: "School 1",
					degree: "Degree 1",
					start: new Date(),
					end: new Date(),
					city: "City 1",
					obtained: CvTimelineStatus.COMPLETED,
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("move reorders a education", async () => {
		const { caller } = await createUserWithProfile();

		const first = await caller.profileEducation.create({
			title: "First",
			school: "School 1",
			degree: "Degree 1",
			start: new Date(),
			end: new Date(),
			city: "City 1",
			obtained: CvTimelineStatus.COMPLETED,
			order: 1,
		});
		await caller.profileEducation.create({
			title: "Education 2",
			school: "School 1",
			degree: "Degree 1",
			start: new Date(),
			end: new Date(),
			city: "City 1",
			obtained: CvTimelineStatus.COMPLETED,
			order: 2,
		});

		const moved = await caller.profileEducation.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a education", async () => {
		const { caller } = await createUserWithProfile();

		const created = await caller.profileEducation.create({
			title: "To delete",
			school: "School 1",
			degree: "Degree 1",
			start: new Date(),
			end: new Date(),
			city: "City 1",
			obtained: CvTimelineStatus.COMPLETED,
			order: 1,
		});

		await caller.profileEducation.delete({ id: created.id });

		const list = await caller.profileEducation.findAll();
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown education", async () => {
		const { caller } = await createUserWithProfile();

		await expect(caller.profileEducation.delete({ id: "unknown" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
