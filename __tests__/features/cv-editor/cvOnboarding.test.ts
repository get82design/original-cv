import { describe, expect, it } from "vitest";
import { CV_ONBOARDING_STEPS } from "@/features/cv-editor/component/dialog/cvOnboarding";

describe("CV_ONBOARDING_STEPS", () => {
	it("exposes exactly 5 steps with stable ids", () => {
		expect(CV_ONBOARDING_STEPS).toHaveLength(5);
		expect(CV_ONBOARDING_STEPS.map((s) => s.id)).toEqual([
			"bienvenue",
			"sections",
			"dock",
			"sauvegarder",
			"telecharger-tips",
		]);
	});

	it("requires title, text and icon on every step", () => {
		for (const step of CV_ONBOARDING_STEPS) {
			expect(step.title.trim().length).toBeGreaterThan(0);
			expect(step.text.trim().length).toBeGreaterThan(0);
			expect(step.icon).toMatch(/^pi /);
		}
	});
});
