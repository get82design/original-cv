import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prismaTest } from "../../../lib/prismaTest";
import {
	DELETE_ACCOUNT_CONFIRMATION,
	userService,
} from "../../../src/services/user/userService";
import { NotFoundError, ValidationError } from "../../../src/services/errors";
import * as previewStorage from "../../../src/services/storage/previewStorage";
import { createTestUser } from "../../utils/create-test-user";
import { createTestProfile } from "../../utils/create-test-profile";
import { createTestTemplate } from "../../utils/create-test-template";
import { createCV } from "../../utils/create-test-cv-full-flow";

describe("userService.deleteAccount", () => {
	const deleteIfManaged = vi.fn().mockResolvedValue(undefined);

	beforeEach(() => {
		deleteIfManaged.mockClear();
		vi.spyOn(previewStorage, "getPreviewStorage").mockReturnValue({
			put: vi.fn(async () => ({ publicUrl: "/uploads/cv-previews/x.jpg" })),
			deleteIfManaged,
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("rejects when confirmation is not SUPPRIMER", async () => {
		const user = await createTestUser();
		await expect(userService.deleteAccount(user.id, "supprimer")).rejects.toBeInstanceOf(
			ValidationError,
		);
		await expect(userService.deleteAccount(user.id, "")).rejects.toBeInstanceOf(ValidationError);

		const stillThere = await prismaTest.user.findUnique({ where: { id: user.id } });
		expect(stillThere).not.toBeNull();
	});

	it("deletes user, profile, CV and reset tokens ; anonymizes AI events", async () => {
		const user = await createTestUser();
		await createTestProfile(user.id, "Ada", "Lovelace");
		const template = await createTestTemplate();
		const cv = await createCV(user.id, template.id);
		await prismaTest.cV.update({
			where: { id: cv.id },
			data: {
				previewUrl: "/uploads/cv-previews/fake-with.jpg",
				previewUrlClean: "/uploads/cv-previews/fake-clean.jpg",
			},
		});

		await prismaTest.passwordResetToken.create({
			data: {
				email: user.email,
				tokenHash: `hash-${user.id}`,
				expiresAt: new Date(Date.now() + 3600_000),
			},
		});

		const aiEvent = await prismaTest.aiEvent.create({
			data: {
				userId: user.id,
				feature: "COVER_LETTER",
			},
		});

		const result = await userService.deleteAccount(user.id, DELETE_ACCOUNT_CONFIRMATION);
		expect(result).toEqual({ ok: true });

		expect(await prismaTest.user.findUnique({ where: { id: user.id } })).toBeNull();
		expect(await prismaTest.profile.findFirst({ where: { userId: user.id } })).toBeNull();
		expect(await prismaTest.cV.findUnique({ where: { id: cv.id } })).toBeNull();
		expect(
			await prismaTest.passwordResetToken.findFirst({ where: { email: user.email } }),
		).toBeNull();

		const refreshedEvent = await prismaTest.aiEvent.findUniqueOrThrow({
			where: { id: aiEvent.id },
		});
		expect(refreshedEvent.userId).toBeNull();

		expect(deleteIfManaged).toHaveBeenCalledWith("/uploads/cv-previews/fake-with.jpg");
		expect(deleteIfManaged).toHaveBeenCalledWith("/uploads/cv-previews/fake-clean.jpg");
	});

	it("rejects unknown user", async () => {
		await expect(
			userService.deleteAccount("missing-id", DELETE_ACCOUNT_CONFIRMATION),
		).rejects.toBeInstanceOf(NotFoundError);
	});
});
