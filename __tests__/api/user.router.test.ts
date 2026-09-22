import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { prismaTest } from "../../lib/prismaTest";
import { createCV } from "../utils/create-test-cv-full-flow";
import { createTestTemplate } from "../utils/create-test-template";
import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";

describe("userRouter", () => {
	it("me returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();

		await expect(caller.user.me()).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
	});

	it("me returns the current user", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const result = await caller.user.me();

		expect(result.id).toBe(user.id);
		expect(result.email).toBe(user.email);
	});

	it("updateProfile updates the current user", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const updated = await caller.user.updateProfile({
			name: "Nouveau nom",
		});

		expect(updated.id).toBe(user.id);
		expect(updated.name).toBe("Nouveau nom");
	});

	it("updateProfile rejects invalid input (Zod)", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(
			caller.user.updateProfile({
				// @ts-expect-error — test de validation runtime
				name: 123,
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("canCreateCv returns true for a new user", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const canCreate = await caller.user.canCreateCv();

		expect(canCreate).toBe(true);
	});

	it("countUserCvs returns the number of CVs", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		const template = await createTestTemplate();

		expect(await caller.user.countUserCvs()).toBe(0);

		await createCV(user.id, template.id);

		expect(await caller.user.countUserCvs()).toBe(1);
	});

	it("getDownloadStatus returns free/paid flags", async () => {
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { freeDownloadsRemaining: 1, downloadCredits: 2 },
		});
		const caller = await createTestCaller(createTestSession(user));

		const status = await caller.user.getDownloadStatus();

		expect(status).toEqual({
			freeDownloadsRemaining: 1,
			downloadCredits: 2,
			canDownloadFree: true,
			canDownloadPaid: true,
		});
	});

	it("getDownloadStatus returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();

		await expect(caller.user.getDownloadStatus()).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
	});

	it("consumeFreeDownload snapshots primaryColorName", async () => {
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { freeDownloadsRemaining: 1 },
		});
		const caller = await createTestCaller(createTestSession(user));

		await caller.user.consumeFreeDownload({
			primaryColorName: "blue",
		});

		const event = await prismaTest.downloadEvent.findFirstOrThrow({
			where: { userId: user.id },
		});
		expect(event.primaryColorName).toBe("blue");
	});

	it("consumeFreeDownload returns BAD_REQUEST when empty", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(caller.user.consumeFreeDownload()).rejects.toMatchObject({
			code: "BAD_REQUEST",
		});
	});

	it("consumePaidDownload decrements paid credits only", async () => {
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { freeDownloadsRemaining: 3, downloadCredits: 2 },
		});
		const caller = await createTestCaller(createTestSession(user));

		const updated = await caller.user.consumePaidDownload();

		expect(updated.downloadCredits).toBe(1);
		expect(updated.freeDownloadsRemaining).toBe(3);
	});

	it("consumePaidDownload returns BAD_REQUEST when empty", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(caller.user.consumePaidDownload()).rejects.toMatchObject({
			code: "BAD_REQUEST",
		});
	});

	it("consumeDownloadCredit decrements credits", async () => {
		const user = await createTestUser();
		await prismaTest.user.update({
			where: { id: user.id },
			data: { downloadCredits: 2 },
		});
		const caller = await createTestCaller(createTestSession(user));

		const updated = await caller.user.consumeDownloadCredit();

		expect(updated.downloadCredits).toBe(1);
	});

	it("consumeDownloadCredit returns BAD_REQUEST when no credits", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(caller.user.consumeDownloadCredit()).rejects.toMatchObject({
			code: "BAD_REQUEST",
		});
	});

	it("incrementIaRequests increments the counter", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const updated = await caller.user.incrementIaRequests();

		expect(updated.iaRequestsUsed).toBe(1);
	});

	it("register creates a user without session", async () => {
		const caller = await createTestCaller(); // pas de session

		const created = await caller.user.register({
			email: "api@test.com",
			password: "password123",
			name: "Bob",
		});

		expect(created.email).toBe("api@test.com");
		expect(created.name).toBe("Bob");
		expect(created).not.toHaveProperty("password");
	});

	it("register returns CONFLICT when email already exists", async () => {
		const caller = await createTestCaller();

		await caller.user.register({
			email: "same@test.com",
			password: "password123",
		});

		await expect(
			caller.user.register({
				email: "same@test.com",
				password: "password123",
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});

	it("register rejects invalid input (Zod)", async () => {
		const caller = await createTestCaller();

		await expect(
			caller.user.register({
				email: "not-an-email",
				password: "short", // < 8
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("forgotPassword returns ok for known and unknown emails", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller();

		await expect(caller.user.forgotPassword({ email: user.email })).resolves.toEqual({ ok: true });

		const tokens = await prismaTest.passwordResetToken.findMany({
			where: { email: user.email },
		});
		expect(tokens).toHaveLength(1);

		await expect(caller.user.forgotPassword({ email: "ghost@test.com" })).resolves.toEqual({
			ok: true,
		});
	});

	it("resetPassword updates password via public procedure", async () => {
		const { createHash, randomBytes } = await import("crypto");
		const { compare } = await import("bcrypt");
		const user = await createTestUser();
		const rawToken = randomBytes(32).toString("hex");
		await prismaTest.passwordResetToken.create({
			data: {
				email: user.email,
				tokenHash: createHash("sha256").update(rawToken).digest("hex"),
				expiresAt: new Date(Date.now() + 60 * 60 * 1000),
			},
		});

		const caller = await createTestCaller();
		await expect(
			caller.user.resetPassword({
				token: rawToken,
				password: "brand-new-99",
			}),
		).resolves.toEqual({ ok: true });

		const refreshed = await prismaTest.user.findUniqueOrThrow({
			where: { id: user.id },
		});
		expect(await compare("brand-new-99", refreshed.password!)).toBe(true);
	});
});
