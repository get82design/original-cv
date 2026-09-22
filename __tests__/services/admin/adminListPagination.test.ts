import { describe, expect, it } from "vitest";
import { adminAiService } from "../../../src/services/admin/adminAiService";
import { adminCreditLogService } from "../../../src/services/admin/adminCreditLogService";
import { adminDownloadService } from "../../../src/services/admin/adminDownloadService";

describe("admin list services page clamping", () => {
	it("clamps page and pageSize in ai / downloads / credit logs", async () => {
		const ai = await adminAiService.listAiEvents({
			period: "all",
			page: 0,
			pageSize: 999,
		});
		expect(ai.page).toBe(1);
		expect(ai.pageSize).toBe(50);

		const downloads = await adminDownloadService.listDownloads({
			period: "all",
			page: -5,
			pageSize: 0,
		});
		expect(downloads.page).toBe(1);
		expect(downloads.pageSize).toBe(1);

		const logs = await adminCreditLogService.listCreditLogs({
			period: "all",
			page: 0,
			pageSize: 100,
		});
		expect(logs.page).toBe(1);
		expect(logs.pageSize).toBe(50);
	});
});
