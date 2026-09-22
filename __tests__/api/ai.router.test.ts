import { afterEach, describe, expect, it, vi } from "vitest";
import { prismaTest } from "../../lib/prismaTest";
import { cvImportService } from "../../src/services/ai/cvImportService";
import { geminiService } from "../../src/services/ai/geminiService";
import { createTestUser } from "../utils/create-test-user";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("ai.router", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("importCvFromPdf", () => {
		it("returns the draft from the import service and logs AI usage", async () => {
			const user = await createTestUser();
			vi.spyOn(cvImportService, "importCvFromPdf").mockResolvedValue({
				draft: {
					identity: { firstName: "Ada" },
					experiences: [],
					educations: [],
					formations: [],
					languages: [],
					skills: [],
					certifications: [],
					socialMedias: [],
					warnings: [],
				},
				pageCount: 1,
			});

			const caller = await createTestCaller(createTestSession(user));

			const result = await caller.ai.importCvFromPdf({
				pdfBase64: Buffer.from("%PDF").toString("base64"),
				maxPages: 2,
			});

			expect(result.pageCount).toBe(1);
			expect(result.draft.identity.firstName).toBe("Ada");
			expect(cvImportService.importCvFromPdf).toHaveBeenCalledOnce();

			const events = await prismaTest.aiEvent.findMany({
				where: { userId: user.id },
			});
			expect(events).toHaveLength(1);
			expect(events[0]?.feature).toBe("IMPORT_CV");

			const refreshed = await prismaTest.user.findUniqueOrThrow({
				where: { id: user.id },
			});
			expect(refreshed.iaRequestsUsed).toBe(1);
		});

		it("rejects unauthenticated callers", async () => {
			const caller = await createTestCaller(null);

			await expect(
				caller.ai.importCvFromPdf({
					pdfBase64: Buffer.from("%PDF").toString("base64"),
				}),
			).rejects.toMatchObject({ code: "UNAUTHORIZED" });
		});

		it("rejects when daily import quota is reached", async () => {
			const user = await createTestUser();
			const importSpy = vi
				.spyOn(cvImportService, "importCvFromPdf")
				.mockResolvedValue({
					draft: {
						identity: {},
						experiences: [],
						educations: [],
						formations: [],
						languages: [],
						skills: [],
						certifications: [],
						socialMedias: [],
						warnings: [],
					},
					pageCount: 1,
				});

			await prismaTest.aiEvent.createMany({
				data: [
					{ feature: "IMPORT_CV", userId: user.id },
					{ feature: "IMPORT_CV", userId: user.id },
				],
			});

			const caller = await createTestCaller(createTestSession(user));

			await expect(
				caller.ai.importCvFromPdf({
					pdfBase64: Buffer.from("%PDF").toString("base64"),
				}),
			).rejects.toMatchObject({
				code: "BAD_REQUEST",
				message: expect.stringContaining("Limite d’imports"),
			});
			expect(importSpy).not.toHaveBeenCalled();
		});
	});

	describe("rewriteSection", () => {
		it("returns the rewrite from geminiService and logs AI usage", async () => {
			const user = await createTestUser();
			await prismaTest.aiFeaturePrice.upsert({
				where: { feature: "REWRITE_SECTION" },
				create: {
					feature: "REWRITE_SECTION",
					costFree: 2,
					costPaid: 1,
				},
				update: { costFree: 2, costPaid: 1 },
			});
			await prismaTest.user.update({
				where: { id: user.id },
				data: { downloadCredits: 3, freeDownloadsRemaining: 0 },
			});

			vi.spyOn(geminiService, "rewriteSection").mockResolvedValue({
				rationale: "Plus clair.",
				rewrittenText: "Dev produit.",
				items: [],
			});

			const caller = await createTestCaller(createTestSession(user));

			const result = await caller.ai.rewriteSection({
				sectionType: "description",
				sectionLabel: "Profil",
				sourceText: "Dev motivé",
				paymentMethod: "paid",
			});

			expect(result.rewrite.rewrittenText).toBe("Dev produit.");
			expect(geminiService.rewriteSection).toHaveBeenCalledWith({
				sectionType: "description",
				sectionLabel: "Profil",
				sourceText: "Dev motivé",
			});

			const events = await prismaTest.aiEvent.findMany({
				where: { userId: user.id },
			});
			expect(events).toHaveLength(1);
			expect(events[0]?.feature).toBe("REWRITE_SECTION");
			expect(events[0]?.detail).toBe("Profil");
			expect(events[0]?.paymentMethod).toBe("PAID");
			expect(events[0]?.creditsSpent).toBe(1);

			const refreshed = await prismaTest.user.findUniqueOrThrow({
				where: { id: user.id },
			});
			expect(refreshed.downloadCredits).toBe(2);
		});

		it("rejects when credits are insufficient", async () => {
			const user = await createTestUser();
			await prismaTest.aiFeaturePrice.upsert({
				where: { feature: "REWRITE_SECTION" },
				create: {
					feature: "REWRITE_SECTION",
					costFree: 2,
					costPaid: 1,
				},
				update: { costFree: 2, costPaid: 1 },
			});
			await prismaTest.user.update({
				where: { id: user.id },
				data: { downloadCredits: 0, freeDownloadsRemaining: 0 },
			});
			const spy = vi.spyOn(geminiService, "rewriteSection");

			const caller = await createTestCaller(createTestSession(user));

			await expect(
				caller.ai.rewriteSection({
					sectionType: "description",
					sectionLabel: "Profil",
					sourceText: "Dev motivé",
					paymentMethod: "paid",
				}),
			).rejects.toMatchObject({
				code: "BAD_REQUEST",
				message: expect.stringContaining("insuffisants"),
			});
			expect(spy).not.toHaveBeenCalled();
		});

		it("rejects unauthenticated callers", async () => {
			const caller = await createTestCaller(null);

			await expect(
				caller.ai.rewriteSection({
					sectionType: "experience",
					sectionLabel: "Expériences",
					sourceText: "x",
					paymentMethod: "paid",
				}),
			).rejects.toMatchObject({ code: "UNAUTHORIZED" });
		});
	});
});
