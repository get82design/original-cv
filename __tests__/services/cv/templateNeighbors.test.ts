import { describe, expect, it } from "vitest";
import { resolveTemplateNeighbors } from "../../../src/services/cv/templateNeighbors";

describe("resolveTemplateNeighbors", () => {
	const ordered = [
		{ slug: "austin", name: "Austin" },
		{ slug: "berlin", name: "Berlin" },
		{ slug: "chicago", name: "Chicago" },
	];

	it("returns next only for the first item", () => {
		expect(resolveTemplateNeighbors(ordered, "austin")).toEqual({
			prev: null,
			next: { slug: "berlin", name: "Berlin" },
		});
	});

	it("returns prev and next for a middle item", () => {
		expect(resolveTemplateNeighbors(ordered, "berlin")).toEqual({
			prev: { slug: "austin", name: "Austin" },
			next: { slug: "chicago", name: "Chicago" },
		});
	});

	it("returns prev only for the last item", () => {
		expect(resolveTemplateNeighbors(ordered, "chicago")).toEqual({
			prev: { slug: "berlin", name: "Berlin" },
			next: null,
		});
	});

	it("returns nulls when slug is unknown", () => {
		expect(resolveTemplateNeighbors(ordered, "inconnu")).toEqual({
			prev: null,
			next: null,
		});
	});
});
