import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";
import { CvTimelineStatus } from "../../generated/prisma/enums";

describe("cvEducationRouter", () => {
	async function setup() {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		return { user, caller, cv };
	}

	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();
		const user = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);

		await expect(
			caller.cvEducation.create({
				cvId: cv.id,
				data: {
					title: "Education 1",
					school: "School 1",
					degree: "Degree 1",
					start: new Date(),
					end: new Date(),
					city: "City 1",
					obtained: CvTimelineStatus.COMPLETED,
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("create creates a education via tRPC", async () => {
		const { caller, cv } = await setup();

		const education = await caller.cvEducation.create({
			cvId: cv.id,
			data: {
				title: "Education 1",
				school: "School 1",
				degree: "Degree 1",
				start: new Date("2020-01-01"),
				end: new Date("2024-01-01"),
				city: "City 1",
				obtained: CvTimelineStatus.COMPLETED,
				order: 1,
			},
		});

		expect(education.cvId).toBe(cv.id);
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
		const { caller, cv } = await setup();

		await expect(
			caller.cvEducation.create({
				cvId: cv.id,
				// @ts-expect-error — test de validation runtime
				data: { title: "Education 1" },
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns FORBIDDEN for wrong user", async () => {
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const caller = await createTestCaller(createTestSession(otherUser));

		await expect(
			caller.cvEducation.create({
				cvId: cv.id,
				data: {
					title: "Hack",
					school: "School 1",
					degree: "Degree 1",
					start: new Date(),
					end: new Date(),
					city: "City 1",
					obtained: CvTimelineStatus.COMPLETED,
					order: 1,
				},
			}),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("create returns CONFLICT when title already exists", async () => {
		const { caller, cv } = await setup();

		await caller.cvEducation.create({
			cvId: cv.id,
			data: {
				title: "Same education",
				school: "School 1",
				degree: "Degree 1",
				start: new Date(),
				end: new Date(),
				city: "City 1",
				obtained: CvTimelineStatus.COMPLETED,
				order: 1,
			},
		});

		await expect(
			caller.cvEducation.create({
				cvId: cv.id,
				data: {
					title: "Same education",
					school: "School 1",
					degree: "Degree 1",
					start: new Date(),
					end: new Date(),
					city: "City 1",
					obtained: CvTimelineStatus.COMPLETED,
					order: 2,
				},
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("findAllByCvId returns education ordered", async () => {
		const { caller, cv } = await setup();

		await caller.cvEducation.create({
			cvId: cv.id,
			data: {
				title: "First",
				school: "School 1",
				degree: "Degree 1",
				start: new Date(),
				end: new Date(),
				city: "City 1",
				obtained: CvTimelineStatus.COMPLETED,
				order: 1,
			},
		});

		await caller.cvEducation.create({
			cvId: cv.id,
			data: {
				title: "Second",
				school: "School 1",
				degree: "Degree 1",
				start: new Date(),
				end: new Date(),
				city: "City 1",
				obtained: CvTimelineStatus.COMPLETED,
				order: 2,
			},
		});

		const list = await caller.cvEducation.findAllByCvId({ cvId: cv.id });

		expect(list).toHaveLength(2);
		expect(list[0]?.title).toBe("First");
		expect(list[1]?.title).toBe("Second");
	});

	it("update updates a education", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvEducation.create({
			cvId: cv.id,
			data: {
				title: "Old strength",
				school: "School 1",
				degree: "Degree 1",
				start: new Date(),
				end: new Date(),
				city: "City 1",
				obtained: CvTimelineStatus.COMPLETED,
				order: 1,
			},
		});

		const updated = await caller.cvEducation.update({
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
		const owner = await createTestUser();
		const otherUser = await createTestUser();
		const template = await createTestTemplate();
		const cv = await createCV(owner.id, template.id);
		const ownerCaller = await createTestCaller(createTestSession(owner));

		const created = await ownerCaller.cvEducation.create({
			cvId: cv.id,
			data: {
				title: "Education 1",
				school: "School 1",
				degree: "Degree 1",
				start: new Date(),
				end: new Date(),
				city: "City 1",
				obtained: CvTimelineStatus.COMPLETED,
				order: 1,
			},
		});

		const otherCaller = await createTestCaller(createTestSession(otherUser));

		await expect(
			otherCaller.cvEducation.update({
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
		const { caller, cv } = await setup();

		const first = await caller.cvEducation.create({
			cvId: cv.id,
			data: {
				title: "First",
				school: "School 1",
				degree: "Degree 1",
				start: new Date(),
				end: new Date(),
				city: "City 1",
				obtained: CvTimelineStatus.COMPLETED,
				order: 1,
			},
		});
		await caller.cvEducation.create({
			cvId: cv.id,
			data: {
				title: "Second",
				school: "School 1",
				degree: "Degree 1",
				start: new Date(),
				end: new Date(),
				city: "City 1",
				obtained: CvTimelineStatus.COMPLETED,
				order: 2,
			},
		});

		const moved = await caller.cvEducation.move({
			id: first.id,
			newOrder: 2,
		});

		expect(moved?.order).toBe(2);
	});

	it("delete removes a education", async () => {
		const { caller, cv } = await setup();

		const created = await caller.cvEducation.create({
			cvId: cv.id,
			data: {
				title: "To delete",
				school: "School 1",
				degree: "Degree 1",
				start: new Date(),
				end: new Date(),
				city: "City 1",
				obtained: CvTimelineStatus.COMPLETED,
				order: 1,
			},
		});

		await caller.cvEducation.delete({ id: created.id });

		const list = await caller.cvEducation.findAllByCvId({ cvId: cv.id });
		expect(list).toHaveLength(0);
	});

	it("delete returns NOT_FOUND for unknown education", async () => {
		const { caller } = await setup();

		await expect(caller.cvEducation.delete({ id: "unknown" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});
