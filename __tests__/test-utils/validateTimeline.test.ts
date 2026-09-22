import { describe, expect, it } from "vitest";
import { validateTimeline } from "../../src/utils/validateTimeline";
import { CvTimelineStatus } from "../../generated/prisma/enums";

describe("validateTimeline", () => {
	// TEST 1 : current timeline
	it("accepts current timeline", () => {
		expect(() => validateTimeline(new Date("2025-01-01"), null, null)).not.toThrow();
	});

	// TEST 2 : completed timeline
	it("accepts completed timeline", () => {
		expect(() =>
			validateTimeline(new Date("2020-01-01"), new Date("2022-01-01"), CvTimelineStatus.COMPLETED),
		).not.toThrow();
	});

	// TEST 3 : end is before start
	it("throws if end is before start", () => {
		expect(() =>
			validateTimeline(new Date("2025-01-01"), new Date("2024-01-01"), CvTimelineStatus.COMPLETED),
		).toThrow();
	});

	// TEST 4 : completed has no end date
	it("throws if completed has no end date", () => {
		expect(() =>
			validateTimeline(new Date("2020-01-01"), null, CvTimelineStatus.COMPLETED),
		).toThrow();
	});

	// TEST 5 : abandoned timeline
	it("accepts abandoned timeline", () => {
		expect(() =>
			validateTimeline(new Date("2020-01-01"), new Date("2021-01-01"), CvTimelineStatus.ABANDONED),
		).not.toThrow();
	});

	// TEST 6 : same start and end date
	it("accepts same start and end date", () => {
		expect(() =>
			validateTimeline(new Date("2025-01-01"), new Date("2025-01-01"), CvTimelineStatus.COMPLETED),
		).not.toThrow();
	});
});
