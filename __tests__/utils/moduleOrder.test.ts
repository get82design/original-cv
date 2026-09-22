import { describe, expect, it } from "vitest";
import type { TemplateModule } from "../../src/services/schemas/cvTemplate.schema";
import {
	compactActiveOrders,
	nextActiveOrder,
	nextActiveOrderInColumn,
} from "../../src/utils/moduleOrder";

/** Minimal stubs — moduleOrder ne lit que type / order / isActive / column. */
function stub(
	type: string,
	order: number,
	isActive: boolean,
	column = 0,
): TemplateModule {
	return { type, order, isActive, column } as unknown as TemplateModule;
}

describe("moduleOrder", () => {
	it("compactActiveOrders renumbers active then inactive per column", () => {
		const result = compactActiveOrders([
			stub("description", 10, true),
			stub("experience", 3, false),
			stub("skill", 1, true),
		]);
		const byType = Object.fromEntries(
			result.map((m) => [m.type, m.order]),
		);
		expect(byType.skill).toBe(1);
		expect(byType.description).toBe(2);
		expect(byType.experience).toBe(3);
	});

	it("nextActiveOrder returns 1 when no active modules", () => {
		expect(nextActiveOrder([stub("description", 2, false)])).toBe(1);
	});

	it("nextActiveOrder returns max active + 1", () => {
		expect(
			nextActiveOrder([
				stub("description", 2, true),
				stub("skill", 5, true),
			]),
		).toBe(6);
	});

	it("nextActiveOrderInColumn scopes to column", () => {
		expect(
			nextActiveOrderInColumn(
				[stub("description", 4, true, 0), stub("skill", 9, true, 1)],
				0,
			),
		).toBe(5);
		expect(
			nextActiveOrderInColumn([stub("description", 2, false, 0)], 0),
		).toBe(1);
	});
});
