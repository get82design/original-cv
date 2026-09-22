import { describe, expect, it } from "vitest";
import { reorderItems } from "../../src/utils/reorderCvItems";

describe("reorderItems", () => {
	const createItems = () => [
		{ id: "1", label: "A" },
		{ id: "2", label: "B" },
		{ id: "3", label: "C" },
		{ id: "4", label: "D" },
	];

	it("moves an item forward", () => {
		const result = reorderItems(createItems(), "3", 1);

		expect(result).toEqual([
			{
				item: { id: "3", label: "C" },
				order: 1,
			},
			{
				item: { id: "1", label: "A" },
				order: 2,
			},
			{
				item: { id: "2", label: "B" },
				order: 3,
			},
			{
				item: { id: "4", label: "D" },
				order: 4,
			},
		]);
	});

	it("moves an item backward", () => {
		const result = reorderItems(createItems(), "1", 4);

		expect(result).toEqual([
			{
				item: { id: "2", label: "B" },
				order: 1,
			},
			{
				item: { id: "3", label: "C" },
				order: 2,
			},
			{
				item: { id: "4", label: "D" },
				order: 3,
			},
			{
				item: { id: "1", label: "A" },
				order: 4,
			},
		]);
	});

	it("moves an item to the same position", () => {
		const result = reorderItems(createItems(), "2", 2);

		expect(result).toEqual([
			{
				item: { id: "1", label: "A" },
				order: 1,
			},
			{
				item: { id: "2", label: "B" },
				order: 2,
			},
			{
				item: { id: "3", label: "C" },
				order: 3,
			},
			{
				item: { id: "4", label: "D" },
				order: 4,
			},
		]);
	});

	it("moves the last item to the first position", () => {
		const result = reorderItems(createItems(), "4", 1);

		expect(result.map((r) => r.item.id)).toEqual(["4", "1", "2", "3"]);
		expect(result.map((r) => r.order)).toEqual([1, 2, 3, 4]);
	});

	it("moves the first item to the last position", () => {
		const result = reorderItems(createItems(), "1", 4);

		expect(result.map((r) => r.item.id)).toEqual(["2", "3", "4", "1"]);
		expect(result.map((r) => r.order)).toEqual([1, 2, 3, 4]);
	});

	it("throws if new order is lower than 1", () => {
		expect(() => reorderItems(createItems(), "1", 0)).toThrow("Invalid order");
	});

	it("throws if new order is greater than the number of items", () => {
		expect(() => reorderItems(createItems(), "1", 5)).toThrow("Invalid order");
	});

	it("throws if item does not exist", () => {
		expect(() => reorderItems(createItems(), "999", 1)).toThrow("Item not found");
	});

	it("works with a single item", () => {
		const result = reorderItems([{ id: "1" }], "1", 1);

		expect(result).toEqual([
			{
				item: { id: "1" },
				order: 1,
			},
		]);
	});

	it("preserves all items after reordering", () => {
		const result = reorderItems(createItems(), "2", 4);

		expect(result).toHaveLength(4);
		expect(result.map((r) => r.item.id).sort()).toEqual(["1", "2", "3", "4"]);
	});

	it("returns sequential orders", () => {
		const result = reorderItems(createItems(), "3", 2);

		expect(result.map((r) => r.order)).toEqual([1, 2, 3, 4]);
	});
});
