import { describe, expect, it } from "vitest";
import { createHash, randomBytes } from "crypto";
import { compare } from "bcrypt";
import { PlanRole } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import {
	ConflictError,
	ForbiddenError,
	NotFoundError,
	ValidationError,
} from "../../../src/services/errors";
import { userService } from "../../../src/services/user/userService";
import { createCV } from "../../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../../utils/create-test-template";
import { createTestUser } from "../../utils/create-test-user";

describe("UserService.findAll", () => {
	it("returns all users", async () => {
		await createTestUser();

		await createTestUser();

		const users = await userService.findAll();

		expect(users).toHaveLength(2);
	});

	it("returns an empty array if there are no users", async () => {
		const users = await userService.findAll();

		expect(users).toEqual([]);
	});
});

describe("UserService.findById", () => {
	it("returns a user by id", async () => {
		const user = await createTestUser();
		expect(user.plan).toBe(PlanRole.FREE);
		expect(user.maxCvs).toBe(1);
		expect(user.downloadCredits).toBe(0);
		expect(user.freeDownloadsRemaining).toBe(0);
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

describe("UserService.getDownloadStatus / canDownload*", () => {
	it("returns false flags when stocks are empty", async () => {
		const user = await createTestUser();
		const status = await userService.getDownloadStatus(user.id);

		expect(status).toEqual({
			freeDownloadsRemaining: 0,
			downloadCredits: 0,
			canDownloadFree: false,
			canDownloadPaid: false,
		});
		await expect(userService.canDownloadFree(user.id)).resolves.toBe(false);
		await expect(userService.canDownloadPaid(user.id)).resolves.toBe(false);
	});

	it("reflects free and paid stocks independently", async () => {
		const user = await createTestUser();
		await prisma.user.update({
			where: { id: user.id },
			data: { freeDownloadsRemaining: 2, downloadCredits: 3 },
		});

		const status = await userService.getDownloadStatus(user.id);
		expect(status.canDownloadFree).toBe(true);
		expect(status.canDownloadPaid).toBe(true);
		expect(status.freeDownloadsRemaining).toBe(2);
		expect(status.downloadCredits).toBe(3);
	});

	it("throws if the user is not found", async () => {
		await expect(userService.getDownloadStatus("123")).rejects.toThrow(
			NotFoundError,
		);
		await expect(userService.canDownloadFree("123")).rejects.toThrow(
			NotFoundError,
		);
		await expect(userService.canDownloadPaid("123")).rejects.toThrow(
			NotFoundError,
		);
	});
});

describe("UserService.consumeFreeDownload", () => {
	it("decrements freeDownloadsRemaining without touching downloadCredits", async () => {
		const user = await createTestUser();
		await prisma.user.update({
			where: { id: user.id },
			data: { freeDownloadsRemaining: 2, downloadCredits: 5 },
		});

		const updated = await userService.consumeFreeDownload(user.id);
		expect(updated.freeDownloadsRemaining).toBe(1);
		expect(updated.downloadCredits).toBe(5);

		const events = await prisma.downloadEvent.findMany({
			where: { userId: user.id },
		});
		expect(events).toHaveLength(1);
		expect(events[0]?.variant).toBe("WITH_LOGO");
	});

	it("snapshots primaryColorName on free download", async () => {
		const user = await createTestUser();
		await prisma.user.update({
			where: { id: user.id },
			data: { freeDownloadsRemaining: 1 },
		});

		await userService.consumeFreeDownload(user.id, {
			primaryColorName: "olive",
		});

		const event = await prisma.downloadEvent.findFirstOrThrow({
			where: { userId: user.id },
		});
		expect(event.primaryColorName).toBe("olive");
	});

	it("refuses when no free downloads remain", async () => {
		const user = await createTestUser();
		await expect(userService.consumeFreeDownload(user.id)).rejects.toThrow(
			ValidationError,
		);
	});

	it("throws if the user is not found", async () => {
		await expect(userService.consumeFreeDownload("123")).rejects.toThrow(
			NotFoundError,
		);
	});
});

describe("UserService.consumePaidDownload", () => {
	it("decrements downloadCredits without touching freeDownloadsRemaining", async () => {
		const user = await createTestUser();
		await prisma.user.update({
			where: { id: user.id },
			data: { freeDownloadsRemaining: 4, downloadCredits: 2 },
		});

		const updated = await userService.consumePaidDownload(user.id);
		expect(updated.downloadCredits).toBe(1);
		expect(updated.freeDownloadsRemaining).toBe(4);

		const events = await prisma.downloadEvent.findMany({
			where: { userId: user.id, variant: "WITHOUT_LOGO" },
		});
		expect(events).toHaveLength(1);
	});

	it("refuses when no paid credits remain", async () => {
		const user = await createTestUser();
		await expect(userService.consumePaidDownload(user.id)).rejects.toThrow(
			ValidationError,
		);
	});
});

describe("UserService.grantFreeDownload", () => {
	it("grants free downloads once and records the grant", async () => {
		const user = await createTestUser();

		const updated = await userService.grantFreeDownload(
			user.id,
			"PROFILE_CREATED",
			1,
		);
		expect(updated.freeDownloadsRemaining).toBe(1);

		const grants = await prisma.downloadGrant.findMany({
			where: { userId: user.id },
		});
		const [grant] = grants;
		expect(grant).toBeDefined();
		expect(grant).toMatchObject({
			reason: "PROFILE_CREATED",
			amount: 1,
		});
	});

	it("accepts a custom amount", async () => {
		const user = await createTestUser();
		const updated = await userService.grantFreeDownload(
			user.id,
			"TEMPLATE_PURCHASED",
			3,
		);
		expect(updated.freeDownloadsRemaining).toBe(3);
	});

	it("refuses a second grant for the same reason", async () => {
		const user = await createTestUser();
		await userService.grantFreeDownload(user.id, "FIRST_CV_SAVED");

		await expect(
			userService.grantFreeDownload(user.id, "FIRST_CV_SAVED"),
		).rejects.toThrow(ConflictError);

		const reloaded = await prisma.user.findUniqueOrThrow({
			where: { id: user.id },
		});
		expect(reloaded.freeDownloadsRemaining).toBe(1);
	});

	it("allows different reasons on the same user", async () => {
		const user = await createTestUser();
		await userService.grantFreeDownload(user.id, "PROFILE_CREATED");
		const updated = await userService.grantFreeDownload(
			user.id,
			"FIRST_CV_SAVED",
		);
		expect(updated.freeDownloadsRemaining).toBe(2);
	});

	it("rejects amount < 1", async () => {
		const user = await createTestUser();
		await expect(
			userService.grantFreeDownload(user.id, "PROFILE_CREATED", 0),
		).rejects.toThrow(ValidationError);
	});

	it("throws if the user is not found", async () => {
		await expect(
			userService.grantFreeDownload("123", "PROFILE_CREATED"),
		).rejects.toThrow(NotFoundError);
	});
});

describe("UserService.grantPaidDownloadCredits", () => {
	it("increments downloadCredits", async () => {
		const user = await createTestUser();
		const updated = await userService.grantPaidDownloadCredits(user.id, 3);
		expect(updated.downloadCredits).toBe(3);
	});

	it("rejects amount < 1", async () => {
		const user = await createTestUser();
		await expect(
			userService.grantPaidDownloadCredits(user.id, 0),
		).rejects.toThrow(ValidationError);
	});

	it("throws if the user is not found", async () => {
		await expect(
			userService.grantPaidDownloadCredits("123", 1),
		).rejects.toThrow(NotFoundError);
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

describe("UserService.register", () => {
	it("creates a user with a hashed password", async () => {
		const created = await userService.register({
			email: "new@test.com",
			password: "password123",
			name: "Alice",
		});
		expect(created.email).toBe("new@test.com");
		expect(created.name).toBe("Alice");
		expect(created).not.toHaveProperty("password");
		const inDb = await prisma.user.findUnique({
			where: { email: "new@test.com" },
		});
		expect(inDb?.password).toBeTruthy();
		expect(inDb?.password).not.toBe("password123");
		expect(await compare("password123", inDb!.password!)).toBe(true);
	});
	it("throws ConflictError if email already exists", async () => {
		await userService.register({
			email: "dup@test.com",
			password: "password123",
		});
		await expect(
			userService.register({
				email: "dup@test.com",
				password: "password123",
			}),
		).rejects.toBeInstanceOf(ConflictError);
	});
});
// Équivalent « login » côté logique credentials
describe("credentials password check (login logic)", () => {
	it("accepts the correct password", async () => {
		await userService.register({
			email: "login@test.com",
			password: "password123",
		});
		const user = await userService.findByEmail("login@test.com");
		expect(user?.password).toBeTruthy();
		expect(await compare("password123", user!.password!)).toBe(true);
	});
	it("rejects a wrong password", async () => {
		await userService.register({
			email: "login2@test.com",
			password: "password123",
		});
		const user = await userService.findByEmail("login2@test.com");
		expect(await compare("wrong-password", user!.password!)).toBe(false);
	});
	it("returns null for unknown email", async () => {
		const user = await userService.findByEmail("unknown@test.com");
		expect(user).toBeNull();
	});
});

describe("UserService.logAiUsage", () => {
	it("increments counter and stores optional detail", async () => {
		const user = await createTestUser();

		await userService.logAiUsage(user.id, "REVIEW_CV", "  note  ");

		const refreshed = await prisma.user.findUniqueOrThrow({
			where: { id: user.id },
		});
		expect(refreshed.iaRequestsUsed).toBe(1);

		const event = await prisma.aiEvent.findFirstOrThrow({
			where: { userId: user.id },
		});
		expect(event.feature).toBe("REVIEW_CV");
		expect(event.detail).toBe("note");
	});

	it("omits detail when empty", async () => {
		const user = await createTestUser();
		await userService.logAiUsage(user.id, "IMPORT_CV");

		const event = await prisma.aiEvent.findFirstOrThrow({
			where: { userId: user.id },
		});
		expect(event.detail).toBeNull();
	});
});

describe("UserService premium download gate", () => {
	it("blocks free download of locked premium template", async () => {
		const user = await createTestUser();
		await prisma.user.update({
			where: { id: user.id },
			data: { freeDownloadsRemaining: 2 },
		});
		const template = await createTestTemplate();
		await prisma.cVTemplate.update({
			where: { id: template.id },
			data: { isPremium: true },
		});

		await expect(
			userService.consumeFreeDownload(user.id, {
				templateId: template.id,
			}),
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	it("resolves templateId from cvId for premium check", async () => {
		const user = await createTestUser();
		await prisma.user.update({
			where: { id: user.id },
			data: { downloadCredits: 2 },
		});
		const template = await createTestTemplate();
		await prisma.cVTemplate.update({
			where: { id: template.id },
			data: { isPremium: true },
		});
		const cv = await createCV(user.id, template.id);

		await expect(
			userService.consumePaidDownload(user.id, { cvId: cv.id }),
		).rejects.toBeInstanceOf(ForbiddenError);
	});
});

describe("UserService.updateProfile", () => {
	it("throws NotFoundError for unknown user", async () => {
		await expect(
			userService.updateProfile("missing-user", { name: "x" }),
		).rejects.toThrow(NotFoundError);
	});
});

describe("UserService password reset", () => {
	it("requestPasswordReset creates a token for known email", async () => {
		const user = await createTestUser();

		const result = await userService.requestPasswordReset(
			`  ${user.email.toUpperCase()}  `,
		);
		expect(result).toEqual({ ok: true });

		const tokens = await prisma.passwordResetToken.findMany({
			where: { email: user.email },
		});
		expect(tokens).toHaveLength(1);
		expect(tokens[0]!.expiresAt.getTime()).toBeGreaterThan(Date.now());
	});

	it("requestPasswordReset returns ok without leaking unknown emails", async () => {
		const result = await userService.requestPasswordReset(
			"nobody-exists@test.com",
		);
		expect(result).toEqual({ ok: true });

		const tokens = await prisma.passwordResetToken.findMany({
			where: { email: "nobody-exists@test.com" },
		});
		expect(tokens).toHaveLength(0);
	});

	it("resetPassword updates password and clears tokens", async () => {
		const user = await createTestUser();
		const rawToken = randomBytes(32).toString("hex");
		const tokenHash = createHash("sha256").update(rawToken).digest("hex");
		await prisma.passwordResetToken.create({
			data: {
				email: user.email,
				tokenHash,
				expiresAt: new Date(Date.now() + 60 * 60 * 1000),
			},
		});

		const result = await userService.resetPassword({
			token: rawToken,
			password: "new-password-99",
		});
		expect(result).toEqual({ ok: true });

		const refreshed = await prisma.user.findUniqueOrThrow({
			where: { id: user.id },
		});
		expect(await compare("new-password-99", refreshed.password!)).toBe(true);

		const tokens = await prisma.passwordResetToken.findMany({
			where: { email: user.email },
		});
		expect(tokens).toHaveLength(0);
	});

	it("resetPassword rejects expired token", async () => {
		const user = await createTestUser();
		const rawToken = randomBytes(32).toString("hex");
		const tokenHash = createHash("sha256").update(rawToken).digest("hex");
		await prisma.passwordResetToken.create({
			data: {
				email: user.email,
				tokenHash,
				expiresAt: new Date(Date.now() - 1000),
			},
		});

		await expect(
			userService.resetPassword({
				token: rawToken,
				password: "whatever",
			}),
		).rejects.toMatchObject({
			message: expect.stringContaining("invalide ou expiré"),
		});

		const tokens = await prisma.passwordResetToken.findMany({
			where: { email: user.email },
		});
		expect(tokens).toHaveLength(0);
	});

	it("resetPassword rejects unknown token", async () => {
		await expect(
			userService.resetPassword({
				token: "deadbeef".repeat(8),
				password: "whatever",
			}),
		).rejects.toBeInstanceOf(ValidationError);
	});

	it("resetPassword rejects when user no longer exists", async () => {
		const rawToken = randomBytes(32).toString("hex");
		const tokenHash = createHash("sha256").update(rawToken).digest("hex");
		await prisma.passwordResetToken.create({
			data: {
				email: "ghost-reset@test.com",
				tokenHash,
				expiresAt: new Date(Date.now() + 60 * 60 * 1000),
			},
		});

		await expect(
			userService.resetPassword({
				token: rawToken,
				password: "whatever",
			}),
		).rejects.toBeInstanceOf(ValidationError);
	});
});
