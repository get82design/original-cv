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

	it("résout HeaderSidebarOne en mono distinct de HeaderOne", () => {
		const entry = resolveMonoHeaderEntry("HeaderSidebarOne");
		expect(entry.kind).toBe("mono");
		expect(entry.Component).not.toBe(resolveMonoHeaderEntry("HeaderOne").Component);
	});

	it("résout HeaderSidebarTwo en mono distinct de HeaderSidebarOne", () => {
		const entry = resolveMonoHeaderEntry("HeaderSidebarTwo");
		expect(entry.kind).toBe("mono");
		expect(entry.Component).not.toBe(resolveMonoHeaderEntry("HeaderSidebarOne").Component);
	});

	it("résout HeaderSplitOne en split avec Sidebar + Main", () => {
		const entry = resolveHeaderEntry("HeaderSplitOne");
		expect(entry.kind).toBe("split");
		if (entry.kind === "split") {
			expect(entry.Sidebar).toBeTypeOf("function");
			expect(entry.Main).toBeTypeOf("function");
		}
	});

	it("résout HeaderSplitTwo en split distinct de HeaderSplitOne", () => {
		const entry = resolveHeaderEntry("HeaderSplitTwo");
		expect(entry.kind).toBe("split");
		const splitOne = resolveHeaderEntry("HeaderSplitOne");
		if (entry.kind === "split" && splitOne.kind === "split") {
			expect(entry.Sidebar).not.toBe(splitOne.Sidebar);
			expect(entry.Main).not.toBe(splitOne.Main);
		}
	});

	it("resolveSplitHeaderEntry retombe sur HeaderSplitOne si mono", () => {
		const entry = resolveSplitHeaderEntry("HeaderSidebarOne");
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
