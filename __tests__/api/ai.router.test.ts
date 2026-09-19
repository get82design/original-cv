import { afterEach, describe, expect, it, vi } from "vitest";
import { cvImportService } from "../../src/services/ai/cvImportService";
import {
	createTestCaller,
	createTestSession,
} from "./helpers/create-test-caller";

describe("ai.router importCvFromPdf", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

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
