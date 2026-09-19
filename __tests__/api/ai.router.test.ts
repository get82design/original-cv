import { afterEach, describe, expect, it, vi } from "vitest";
import { cvImportService } from "../../src/services/ai/cvImportService";
import { geminiService } from "../../src/services/ai/geminiService";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("ai.router", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("importCvFromPdf", () => {
		it("returns the draft from the import service", async () => {
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

			const caller = await createTestCaller(
				createTestSession({ id: "u1", email: "a@b.c" }),
			);

			const result = await caller.ai.importCvFromPdf({
				pdfBase64: Buffer.from("%PDF").toString("base64"),
				maxPages: 2,
			});

			expect(result.pageCount).toBe(1);
			expect(result.draft.identity.firstName).toBe("Ada");
			expect(cvImportService.importCvFromPdf).toHaveBeenCalledOnce();
		});

		it("rejects unauthenticated callers", async () => {
			const caller = await createTestCaller(null);

			await expect(
				caller.ai.importCvFromPdf({
					pdfBase64: Buffer.from("%PDF").toString("base64"),
				}),
			).rejects.toMatchObject({ code: "UNAUTHORIZED" });
		});
	});

	describe("reviewCv", () => {
		it("returns the review from geminiService", async () => {
			vi.spyOn(geminiService, "reviewCv").mockResolvedValue({
				summary: "CV solide.",
				score: 8,
				strengths: ["Clarté"],
				improvements: [],
				quickWins: ["Titre"],
			});

			const caller = await createTestCaller(
				createTestSession({ id: "u1", email: "a@b.c" }),
			);

			const result = await caller.ai.reviewCv({
				cvText: "Ada Lovelace — Analyste",
			});

			expect(result.review.score).toBe(8);
			expect(geminiService.reviewCv).toHaveBeenCalledWith(
				"Ada Lovelace — Analyste",
			);
		});

		it("rejects unauthenticated callers", async () => {
			const caller = await createTestCaller(null);

			await expect(
				caller.ai.reviewCv({ cvText: "x" }),
			).rejects.toMatchObject({ code: "UNAUTHORIZED" });
		});
	});
});
