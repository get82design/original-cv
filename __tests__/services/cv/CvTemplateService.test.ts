import { describe, expect, it } from "vitest";
import { cvTemplateService } from "../../../src/services/cv/cvTemplateService";
import { ConflictError, NotFoundError } from "../../../src/services/errors";
import type { CreateCvTemplateInput } from "../../../src/services/schemas/cvTemplate.schema";

/** Fixtures allégées : le service écrit en Prisma sans re-parser Zod. */
function stubInput(
	name: string,
	structure: unknown = { sections: [] },
	defaultStyles: unknown = { color: "black" },
): CreateCvTemplateInput {
	return { name, structure, defaultStyles } as CreateCvTemplateInput;
}

describe("CvTemplateService.create", () => {
	// TEST 1 : création nominale
	it("creates a template", async () => {
		const template = await cvTemplateService.create(
			stubInput("Template Moderne", { sections: ["header", "skills"] }, { color: "#000000" }),
		);

		expect(template.name).toBe("Template Moderne");

		expect(template.structure).toEqual({
			sections: ["header", "skills"],
		});
	});

	// TEST 2 : nom de template déjà existant
	it("throws if template name already exists", async () => {
		await cvTemplateService.create(stubInput("Template Moderne"));

		await expect(cvTemplateService.create(stubInput("Template Moderne"))).rejects.toThrow(
			ConflictError,
		);
	});
});

describe("CvTemplateService.findById", () => {
	// TEST 1 : recherche nominale
	it("returns a template by id", async () => {
		const created = await cvTemplateService.create(
			stubInput("Template Moderne", { sections: ["header"] }, { color: "#000000" }),
		);
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
		await cvTemplateService.create(
			stubInput("Template Moderne", { sections: ["header"] }, { color: "#000000" }),
		);

		await cvTemplateService.create(
			stubInput(
				"Template Classique",
				{ sections: ["header", "experience"] },
				{ color: "#FFFFFF" },
			),
		);

		const templates = await cvTemplateService.findAll();

		expect(templates).toHaveLength(2);
		expect(templates.map((template) => template.name)).toContain("Template Moderne");
		expect(templates.map((template) => template.name)).toContain("Template Classique");
		expect(templates.every((t) => t.isActive)).toBe(true);
		expect(templates.find((t) => t.name === "Template Moderne")?.slug).toBe("template-moderne");
	});

	it("excludes inactive templates from catalog", async () => {
		const active = await cvTemplateService.create(stubInput("Template Actif Catalog"));
		const inactive = await cvTemplateService.create(stubInput("Template Inactif Catalog"));
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

describe("CvTemplateService.findPublicBySlug", () => {
	it("returns public detail for an active template", async () => {
		await cvTemplateService.create(
			stubInput("Berlin", { layout: { columns: 2 } }, { color: "teal" }),
		);

		const detail = await cvTemplateService.findPublicBySlug("berlin");
		expect(detail.name).toBe("Berlin");
		expect(detail.slug).toBe("berlin");
		expect(detail.columns).toBe(2);
		expect(detail.isPremium).toBe(false);
	});

	it("throws if slug unknown", async () => {
		await expect(cvTemplateService.findPublicBySlug("inconnu")).rejects.toThrow(NotFoundError);
	});

	it("throws if template inactive", async () => {
		const created = await cvTemplateService.create(
			stubInput("Kyoto Hidden", { layout: { columns: 1 } }, { color: "black" }),
		);
		const { prismaTest } = await import("../../../lib/prismaTest");
		await prismaTest.cVTemplate.update({
			where: { id: created.id },
			data: { isActive: false },
		});

		await expect(cvTemplateService.findPublicBySlug("kyoto-hidden")).rejects.toThrow(NotFoundError);
	});

	it("findPublicDetailPage returns prev/next neighbors", async () => {
		await cvTemplateService.create(stubInput("Austin", { layout: { columns: 1 } }));
		await cvTemplateService.create(stubInput("Berlin", { layout: { columns: 2 } }));
		await cvTemplateService.create(stubInput("Chicago", { layout: { columns: 1 } }));

		const page = await cvTemplateService.findPublicDetailPage("berlin");
		expect(page.prev?.slug).toBe("austin");
		expect(page.next?.slug).toBe("chicago");
	});
});

//! test update et delete => //! TODO penser à les faire en mode admin
