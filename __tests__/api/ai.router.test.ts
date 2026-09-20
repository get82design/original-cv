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
	});

	describe("rewriteSection", () => {
		it("returns the rewrite from geminiService and logs AI usage", async () => {
			const user = await createTestUser();
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
		});

		it("rejects unauthenticated callers", async () => {
			const caller = await createTestCaller(null);

			await expect(
				caller.ai.rewriteSection({
					sectionType: "experience",
					sectionLabel: "Expériences",
					sourceText: "x",
				}),
			).rejects.toMatchObject({ code: "UNAUTHORIZED" });
		});
	});
});
