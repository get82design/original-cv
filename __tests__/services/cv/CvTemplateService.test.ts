import { describe, expect, it } from "vitest";
import { cvTemplateService } from "../../../src/services/cv/cvTemplateService";
import { ConflictError, NotFoundError } from "../../../src/services/errors";

describe("CvTemplateService.create", () => {
	// TEST 1 : création nominale
	it("creates a template", async () => {
		const template = await cvTemplateService.create({
			name: "Template Moderne",
			structure: {
				sections: ["header", "skills"],
			},
			defaultStyles: {
				color: "#000000",
			},
		});

		expect(template.name).toBe("Template Moderne");

		expect(template.structure).toEqual({
			sections: ["header", "skills"],
		});
	});

	// TEST 2 : nom de template déjà existant
	it("throws if template name already exists", async () => {
		await cvTemplateService.create({
			name: "Template Moderne",
			structure: {
				sections: [],
			},
			defaultStyles: {
				color: "black",
			},
		});

		await expect(
			cvTemplateService.create({
				name: "Template Moderne",
				structure: { sections: [] },
				defaultStyles: {
					color: "black",
				},
			}),
		).rejects.toThrow(ConflictError);
	});
});

describe("CvTemplateService.findById", () => {
	// TEST 1 : recherche nominale
	it("returns a template by id", async () => {
		const created = await cvTemplateService.create({
			name: "Template Moderne",
			structure: {
				sections: ["header"],
			},
			defaultStyles: {
				color: "#000000",
			},
		});
		const template = await cvTemplateService.findById(created.id);

		expect(template.id).toBe(created.id);
		expect(template.name).toBe("Template Moderne");
	});

	// TEST 2 : template inexistant
	it("throws if template does not exist", async () => {
		await expect(cvTemplateService.findById("unknown-template")).rejects.toThrow(NotFoundError);
	});
});

describe("CvTemplateService.findAll", () => {
	// TEST 1 : recherche nominale
	it("returns all active templates", async () => {
		await cvTemplateService.create({
			name: "Template Moderne",
			structure: {
				sections: ["header"],
			},
			defaultStyles: {
				color: "#000000",
			},
		});

		await cvTemplateService.create({
			name: "Template Classique",
			structure: {
				sections: ["header", "experience"],
			},
			defaultStyles: {
				color: "#FFFFFF",
			},
		});

		const templates = await cvTemplateService.findAll();

		expect(templates).toHaveLength(2);
		expect(templates.map((template) => template.name)).toContain("Template Moderne");
		expect(templates.map((template) => template.name)).toContain("Template Classique");
		expect(templates.every((t) => t.isActive)).toBe(true);
	});

	it("excludes inactive templates from catalog", async () => {
		const active = await cvTemplateService.create({
			name: "Template Actif Catalog",
			structure: { sections: [] },
			defaultStyles: { color: "black" },
		});
		const inactive = await cvTemplateService.create({
			name: "Template Inactif Catalog",
			structure: { sections: [] },
			defaultStyles: { color: "black" },
		});
		const { prismaTest } = await import("../../../lib/prismaTest");
		await prismaTest.cVTemplate.update({
			where: { id: inactive.id },
			data: { isActive: false },
		});

		const templates = await cvTemplateService.findAll();
		expect(templates.some((t) => t.id === active.id)).toBe(true);
		expect(templates.some((t) => t.id === inactive.id)).toBe(false);
	});

	// TEST 2 : pas de templates existants
	it("returns empty array if no templates exist", async () => {
		const templates = await cvTemplateService.findAll();

		expect(templates).toEqual([]);
	});
});

//! test update et delete => //! TODO penser à les faire en mode admin
