import { describe, expect, it } from "vitest";
import { colorService } from "../../../src/services/commons/colorService";
import { ConflictError, NotFoundError } from "../../../src/services/errors";

describe("ColorService.create", () => {
	it("creates a color", async () => {
		const color = await colorService.create({
			name: "Red",
			primary: "#FF0000",
		});
		expect(color.name).toBe("red");
		expect(color.primary).toBe("#FF0000");
	});

	it("throws if color already exists", async () => {
		await colorService.create({
			name: "Red",
			primary: "#FF0000",
		});
		await expect(
			colorService.create({
				name: "Red",
				primary: "#FF0000",
			}),
		).rejects.toThrow(ConflictError);
	});

	it("trims and lowercases color name", async () => {
		const color = await colorService.create({
			name: "Red ",
			primary: "#FF0000",
		});

		expect(color.name).toBe("red");
	});

	it("does not allow duplicate names with different casing", async () => {
		await colorService.create({
			name: "Red",
			primary: "#FF0000",
		});

		await expect(
			colorService.create({
				name: " red ",
				primary: "#111111",
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("ColorService.findAll", () => {
	it("returns all colors sorted by order", async () => {
		await colorService.create({
			name: "Red",
			primary: "#FF0000",
		});
		await colorService.create({
			name: "Blue",
			primary: "#0000FF",
		});
		const colors = await colorService.findAll();
		expect(colors).toHaveLength(2);
		expect(colors[0]?.name).toBe("red");
		expect(colors[1]?.name).toBe("blue");
	});

	it("returns an empty array if no colors are found", async () => {
		const colors = await colorService.findAll();
		expect(colors).toHaveLength(0);
	});
});

describe("ColorService.findById", () => {
	it("returns a color by id", async () => {
		const color = await colorService.create({
			name: "Red",
			primary: "#FF0000",
		});
		const foundColor = await colorService.findById(color.id);
		expect(foundColor.name).toBe("red");
		expect(foundColor.primary).toBe("#FF0000");
	});

	it("throws an error if the color is not found", async () => {
		await expect(colorService.findById("123")).rejects.toThrow(NotFoundError);
	});
});

describe("ColorService.findByName", () => {
	it("returns a color by name", async () => {
		const color = await colorService.create({
			name: "Red",
			primary: "#FF0000",
		});
		const foundColor = await colorService.findByName("red");
		expect(foundColor?.name).toBe("red");
		expect(foundColor?.primary).toBe("#FF0000");
	});

	it("returns null if the color is not found", async () => {
		const foundColor = await colorService.findByName("green");
		expect(foundColor).toBeNull();
	});
});

describe("ColorService.update", () => {
	it("updates a color", async () => {
		const color = await colorService.create({
			name: "Red",
			primary: "#FF0000",
		});
		const updatedColor = await colorService.update(color.id, {
			name: "Blue",
			primary: "#0000FF",
		});
		expect(updatedColor.name).toBe("blue");
		expect(updatedColor.primary).toBe("#0000FF");
	});

	it("throws an error if the color is not found", async () => {
		await expect(
			colorService.update("123", {
				name: "Blue",
				primary: "#0000FF",
			}),
		).rejects.toThrow(NotFoundError);
	});

	it("throws an error if the color name already exists", async () => {
		const color = await colorService.create({
			name: "Red",
			primary: "#FF0000",
		});
		await colorService.create({
			name: "Blue",
			primary: "#0000FF",
		});
		await expect(
			colorService.update(color.id, {
				name: "Blue",
				primary: "#0000FF",
			}),
		).rejects.toThrow(ConflictError);
	});

	it("updates only provided fields", async () => {
		const color = await colorService.create({
			name: "Red",
			primary: "#FF0000",
		});
		const updated = await colorService.update(color.id, {
			primary: "#000000",
		});
		expect(updated.name).toBe("red");
		expect(updated.primary).toBe("#000000");
	});
});

describe("ColorService.delete", () => {
	it("deletes a color", async () => {
		const color = await colorService.create({
			name: "Red",
			primary: "#FF0000",
		});
		await colorService.delete(color.id);
		const foundColor = await colorService.findAll();
		expect(foundColor).toHaveLength(0);
	});

	it("throws an error if the color is not found", async () => {
		await expect(colorService.delete("123")).rejects.toThrow(NotFoundError);
	});
});
