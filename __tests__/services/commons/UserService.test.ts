import { describe, expect, it } from "vitest";
import { createTestUser } from "../../utils/create-test-user";
import { userService } from "../../../src/services/commons/userService";
import { NotFoundError, ValidationError } from "../../../src/services/errors";
import { createTestTemplate } from "../../utils/create-test-template";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { PlanRole } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";

describe("UserService.findById", () => {
	it("returns a user by id", async () => {
		const user = await createTestUser();
		expect(user.plan).toBe(PlanRole.FREE);
		expect(user.maxCvs).toBe(1);
		expect(user.downloadCredits).toBe(0);
		expect(user.iaRequestsUsed).toBe(0);
		expect(user.isActive).toBe(true);
		const userExisting = await userService.findById(user.id);
		expect(userExisting).toEqual(user);
	});

	it("throws an error if the user is not found", async () => {
		await expect(userService.findById("123")).rejects.toThrow(NotFoundError);
	});
});

describe("UserService.findByEmail", () => {
	it("returns a user by email", async () => {
		const user = await createTestUser();
		const userExisting = await userService.findByEmail(user.email);
		expect(userExisting).toEqual(user);
	});

	it("returns null if the user is not found", async () => {
		const user = await userService.findByEmail("test@test.com");
		expect(user).toBeNull();
	});
});

describe("UserService.updateProfile", () => {
	it("updates only provided fields", async () => {
		const user = await createTestUser();

		const updated = await userService.updateProfile(user.id, {
			name: "John Doe",
		});

		expect(updated.name).toBe("John Doe");
		expect(updated.image).toBe(user.image);
	});

	it("updates multiple fields", async () => {
		const user = await createTestUser();

		const updated = await userService.updateProfile(user.id, {
			name: "John",
			image: "https://example.com/image.png",
		});

		expect(updated.name).toBe("John");
		expect(updated.image).toBe("https://example.com/image.png");
	});
});

describe("UserService.consumeDownloadCredit", () => {
	it("consumes a download credit", async () => {
		const user = await createTestUser();
		const updatedUser = await prisma.user.update({
			where: { id: user.id },
			data: {
				downloadCredits: 2,
			},
		});
		const finallyUpdatedUser = await userService.consumeDownloadCredit(
			updatedUser.id,
		);
		expect(finallyUpdatedUser.downloadCredits).toBe(
			updatedUser.downloadCredits - 1,
		);
	});

	it("consumes the last credit then refuses another download", async () => {
		const user = await createTestUser();
		await prisma.user.update({
			where: { id: user.id },
			data: {
				downloadCredits: 1,
			},
		});
		await userService.consumeDownloadCredit(user.id);
		await expect(userService.consumeDownloadCredit(user.id)).rejects.toThrow(
			ValidationError,
		);
	});

	it("throws an error if the user is not found", async () => {
		await expect(userService.consumeDownloadCredit("123")).rejects.toThrow(
			NotFoundError,
		);
	});

	it("throws an error if the user has no download credits", async () => {
		const user = await createTestUser();
		await expect(userService.consumeDownloadCredit(user.id)).rejects.toThrow(
			ValidationError,
		);
	});
});

describe("UserService.incrementIaRequests", () => {
	it("increments a user's IA requests", async () => {
		const user = await createTestUser();
		const updatedUser = await prisma.user.update({
			where: { id: user.id },
			data: {
				iaRequestsUsed: 1,
			},
		});
		const finallyUpdatedUser = await userService.incrementIaRequests(
			updatedUser.id,
		);
		expect(finallyUpdatedUser.iaRequestsUsed).toBe(
			updatedUser.iaRequestsUsed + 1,
		);
	});

	it("increments from zero", async () => {
		const user = await createTestUser();

		const updated = await userService.incrementIaRequests(user.id);

		expect(updated.iaRequestsUsed).toBe(1);
	});

	it("throws an error if the user is not found", async () => {
		await expect(userService.incrementIaRequests("123")).rejects.toThrow(
			NotFoundError,
		);
	});
});

describe("UserService.resetIaRequests", () => {
	it("resets a user's IA requests", async () => {
		const user = await createTestUser();
		const updatedUser = await prisma.user.update({
			where: { id: user.id },
			data: {
				iaRequestsUsed: 2,
			},
		});
		const finallyUpdatedUser = await userService.resetIaRequests(
			updatedUser.id,
		);
		expect(finallyUpdatedUser.iaRequestsUsed).toBe(0);
	});

	it("update lastIaReset date", async () => {
		const user = await createTestUser();
		const before = user.lastIaReset;

		const updated = await userService.resetIaRequests(user.id);

		expect(updated.lastIaReset.getTime()).toBeGreaterThanOrEqual(
			before.getTime(),
		);
	});

	it("throws an error if the user is not found", async () => {
		await expect(userService.resetIaRequests("123")).rejects.toThrow(
			NotFoundError,
		);
	});
});

describe("UserService.updateMaxCvs", () => {
	it("updates a user's max CVs", async () => {
		const user = await createTestUser();
		const updatedUser = await userService.updateMaxCvs(user.id, 5);
		expect(updatedUser.maxCvs).toBe(5);
	});

	it("throws an error if the user is not found", async () => {
		await expect(userService.updateMaxCvs("123", 2)).rejects.toThrow(
			NotFoundError,
		);
	});
});

describe("UserService.canCreateCv", () => {
	it("returns false if the user can create a CV", async () => {
		const user = await createTestUser();
		const updatedUser = await userService.updateMaxCvs(user.id, 1);
		const template = await createTestTemplate();
		await createCV(updatedUser.id, template.id);
		const canCreateCv = await userService.canCreateCv(updatedUser.id);
		expect(canCreateCv).toBe(false);
	});

	it("returns true if the user can create a CV", async () => {
		const user = await createTestUser();
		const updatedUser = await userService.updateMaxCvs(user.id, 5);
		const template = await createTestTemplate();
		await createCV(updatedUser.id, template.id);
		const canCreateCv = await userService.canCreateCv(updatedUser.id);
		expect(canCreateCv).toBe(true);
	});

	it("returns true when user has no CV", async () => {
		const user = await createTestUser();

		expect(await userService.canCreateCv(user.id)).toBe(true);
	});

	it("throws an error if the user is not found", async () => {
		await expect(userService.canCreateCv("123")).rejects.toThrow(NotFoundError);
	});
});

describe("UserService.countUserCvs", () => {
	it("counts a user's CVs", async () => {
		const user = await createTestUser();
		const updatedUser = await userService.updateMaxCvs(user.id, 5);
		const template = await createTestTemplate();
		await createCV(updatedUser.id, template.id);
		const count = await userService.countUserCvs(updatedUser.id);
		expect(count).toBe(1);
	});

	it("counts multiple CVs", async () => {
		const user = await createTestUser();

		await userService.updateMaxCvs(user.id, 10);

		const template = await createTestTemplate();

		await createCV(user.id, template.id);
		await createCV(user.id, template.id);

		expect(await userService.countUserCvs(user.id)).toBe(2);
	});

	it("throws an error if the user is not found", async () => {
		await expect(userService.countUserCvs("123")).rejects.toThrow(
			NotFoundError,
		);
	});
});

describe("UserService.updatePlan", () => {
	it("updates a user's plan", async () => {
		const user = await createTestUser();
		const updatedUser = await userService.updatePlan(
			user.id,
			PlanRole.PREMIUM,
			new Date(Date.now() + 1000),
		);
		expect(updatedUser.plan).toBe(PlanRole.PREMIUM);
	});

	it("throws an error if the subscription end date is not provided for premium plan", async () => {
		const user = await createTestUser();
		await expect(
			userService.updatePlan(user.id, PlanRole.PREMIUM),
		).rejects.toThrow(ValidationError);
	});

	it("throws an error if the subscription end date is in the past for premium plan", async () => {
		const user = await createTestUser();
		await expect(
			userService.updatePlan(
				user.id,
				PlanRole.PREMIUM,
				new Date(Date.now() - 1000),
			),
		).rejects.toThrow(ValidationError);
	});

	it("updates a user's plan with a subscription end date", async () => {
		const user = await createTestUser();
		const updatedUser = await userService.updatePlan(
			user.id,
			PlanRole.PREMIUM,
			new Date(Date.now() + 1000),
		);
		expect(updatedUser.plan).toBe(PlanRole.PREMIUM);
		expect(updatedUser.subscriptionEnd).toBeDefined();
		expect(updatedUser.subscriptionEnd).toBeInstanceOf(Date);
	});

	it("updates plan to standard", async () => {
		const user = await createTestUser();

		const updated = await userService.updatePlan(
			user.id,
			PlanRole.STANDARD,
			new Date(Date.now() + 1000),
		);

		expect(updated.plan).toBe(PlanRole.STANDARD);
	});

	it("updates plan to premium", async () => {
		const user = await createTestUser();

		const updated = await userService.updatePlan(
			user.id,
			PlanRole.PREMIUM,
			new Date(Date.now() + 1000),
		);

		expect(updated.plan).toBe(PlanRole.PREMIUM);
	});

	it("downgrades back to free", async () => {
		const user = await createTestUser();

		const updated = await userService.updatePlan(user.id, PlanRole.FREE);

		expect(updated.plan).toBe(PlanRole.FREE);
	});
	it("throws an error if the user is not found", async () => {
		await expect(
			userService.updatePlan("123", PlanRole.PREMIUM),
		).rejects.toThrow(NotFoundError);
	});
});
