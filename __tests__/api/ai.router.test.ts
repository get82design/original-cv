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

	describe("ping", () => {
		it("returns the geminiService ping result", async () => {
			const user = await createTestUser();
			vi.spyOn(geminiService, "ping").mockResolvedValue({
				ok: true,
				text: "OK",
				model: "gemini-test",
			});

			const caller = await createTestCaller(createTestSession(user));
			const result = await caller.ai.ping();

			expect(result).toEqual({
				ok: true,
				text: "OK",
				model: "gemini-test",
			});
			expect(geminiService.ping).toHaveBeenCalledOnce();
		});

		it("rejects unauthenticated callers", async () => {
			const caller = await createTestCaller(null);
			await expect(caller.ai.ping()).rejects.toMatchObject({
				code: "UNAUTHORIZED",
			});
		});
	});

	describe("getBillingOptions", () => {
		it("returns prices and balances for the feature", async () => {
			const user = await createTestUser();
			await prismaTest.aiFeaturePrice.upsert({
				where: { feature: "REVIEW_CV" },
				create: {
					feature: "REVIEW_CV",
					costFree: null,
					costPaid: 2,
				},
				update: { costFree: null, costPaid: 2 },
			});
			await prismaTest.user.update({
				where: { id: user.id },
				data: { downloadCredits: 5, freeDownloadsRemaining: 1 },
			});

			const caller = await createTestCaller(createTestSession(user));
			const result = await caller.ai.getBillingOptions({
				feature: "REVIEW_CV",
			});

			expect(result).toMatchObject({
				feature: "REVIEW_CV",
				costFree: null,
				costPaid: 2,
				downloadCredits: 5,
				freeDownloadsRemaining: 1,
				canPayFree: false,
				canPayPaid: true,
			});
		});

		it("rejects unauthenticated callers", async () => {
			const caller = await createTestCaller(null);
			await expect(
				caller.ai.getBillingOptions({ feature: "REVIEW_CV" }),
			).rejects.toMatchObject({ code: "UNAUTHORIZED" });
		});
	});

	describe("listFeaturePrices", () => {
		it("returns billable AI feature prices", async () => {
			const user = await createTestUser();
			await prismaTest.aiFeaturePrice.upsert({
				where: { feature: "REVIEW_CV" },
				create: {
					feature: "REVIEW_CV",
					costFree: null,
					costPaid: 2,
				},
				update: { costFree: null, costPaid: 2 },
			});
			await prismaTest.aiFeaturePrice.upsert({
				where: { feature: "REWRITE_SECTION" },
				create: {
					feature: "REWRITE_SECTION",
					costFree: 2,
					costPaid: 1,
				},
				update: { costFree: 2, costPaid: 1 },
			});
			await prismaTest.aiFeaturePrice.upsert({
				where: { feature: "COVER_LETTER" },
				create: {
					feature: "COVER_LETTER",
					costFree: null,
					costPaid: 4,
				},
				update: { costFree: null, costPaid: 4 },
			});

			const caller = await createTestCaller(createTestSession(user));
			const prices = await caller.ai.listFeaturePrices();

			expect(prices.map((p) => p.feature)).toEqual([
				"REVIEW_CV",
				"REWRITE_SECTION",
				"COVER_LETTER",
			]);
			expect(prices.find((p) => p.feature === "REVIEW_CV")).toMatchObject(
				{
					costFree: null,
					costPaid: 2,
				},
			);
		});

		it("rejects unauthenticated callers", async () => {
			const caller = await createTestCaller(null);
			await expect(caller.ai.listFeaturePrices()).rejects.toMatchObject({
				code: "UNAUTHORIZED",
			});
		});
	});

	describe("reviewCv", () => {
		it("returns the review from geminiService and logs AI usage", async () => {
			const user = await createTestUser();
			await prismaTest.aiFeaturePrice.upsert({
				where: { feature: "REVIEW_CV" },
				create: {
					feature: "REVIEW_CV",
					costFree: null,
					costPaid: 2,
				},
				update: { costFree: null, costPaid: 2 },
			});
			await prismaTest.user.update({
				where: { id: user.id },
				data: { downloadCredits: 4, freeDownloadsRemaining: 0 },
			});

			vi.spyOn(geminiService, "reviewCv").mockResolvedValue({
				summary: "CV solide.",
				score: 8,
				strengths: ["Parcours clair"],
				improvements: [
					{
						area: "description",
						priority: "haute",
						suggestion: "Chiffrer les résultats.",
					},
				],
				quickWins: ["Préciser le titre"],
			});

			const caller = await createTestCaller(createTestSession(user));
			const result = await caller.ai.reviewCv({
				cvText: "Ada Lovelace — Analyste",
				paymentMethod: "paid",
			});

			expect(result.review.score).toBe(8);
			expect(geminiService.reviewCv).toHaveBeenCalledWith(
				"Ada Lovelace — Analyste",
			);

			const events = await prismaTest.aiEvent.findMany({
				where: { userId: user.id },
			});
			expect(events).toHaveLength(1);
			expect(events[0]?.feature).toBe("REVIEW_CV");
			expect(events[0]?.paymentMethod).toBe("PAID");
			expect(events[0]?.creditsSpent).toBe(2);

			const refreshed = await prismaTest.user.findUniqueOrThrow({
				where: { id: user.id },
			});
			expect(refreshed.downloadCredits).toBe(2);
			expect(refreshed.iaRequestsUsed).toBe(1);
		});

		it("rejects when credits are insufficient", async () => {
			const user = await createTestUser();
			await prismaTest.aiFeaturePrice.upsert({
				where: { feature: "REVIEW_CV" },
				create: {
					feature: "REVIEW_CV",
					costFree: null,
					costPaid: 2,
				},
				update: { costFree: null, costPaid: 2 },
			});
			await prismaTest.user.update({
				where: { id: user.id },
				data: { downloadCredits: 0, freeDownloadsRemaining: 0 },
			});
			const spy = vi.spyOn(geminiService, "reviewCv");

			const caller = await createTestCaller(createTestSession(user));

			await expect(
				caller.ai.reviewCv({
					cvText: "CV minimal",
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
				caller.ai.reviewCv({
					cvText: "CV",
					paymentMethod: "paid",
				}),
			).rejects.toMatchObject({ code: "UNAUTHORIZED" });
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
