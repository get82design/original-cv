import { describe, expect, it } from "vitest";
import {
	resolveHeaderEntry,
	resolveMonoHeaderEntry,
	resolveSplitHeaderEntry,
} from "@/features/cv-editor/component/template/register/header/HeaderRegister";

describe("HeaderRegister resolve", () => {
	it("résout HeaderOne en mono", () => {
		const entry = resolveHeaderEntry("HeaderOne");
		expect(entry.kind).toBe("mono");
	});

	it("résout HeaderSplitOne en split avec Sidebar + Main", () => {
		const entry = resolveHeaderEntry("HeaderSplitOne");
		expect(entry.kind).toBe("split");
		if (entry.kind === "split") {
			expect(entry.Sidebar).toBeTypeOf("function");
			expect(entry.Main).toBeTypeOf("function");
		}
	});

	it("resolveSplitHeaderEntry retombe sur HeaderSplitOne si mono", () => {
		const entry = resolveSplitHeaderEntry("HeaderFive");
		expect(entry.kind).toBe("split");
		const expected = resolveSplitHeaderEntry("HeaderSplitOne");
		expect(entry.Sidebar).toBe(expected.Sidebar);
		expect(entry.Main).toBe(expected.Main);
	});

	it("resolveMonoHeaderEntry retombe sur HeaderOne si split", () => {
		const entry = resolveMonoHeaderEntry("HeaderSplitOne");
		expect(entry.kind).toBe("mono");
		expect(entry.Component).toBe(resolveMonoHeaderEntry("HeaderOne").Component);
	});
});
