import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";

import { createTestUser } from "../utils/create-test-user";
import { createTestCaller, createTestSession } from "./helpers/create-test-caller";
import {
	createCvTemplateSchema,
	type CreateCvTemplateInput,
} from "../../src/services/schemas/cvTemplate.schema";

const baseSettings = {
	sizeModel: "14px",
	weightModel: 400,
	colorSelect: "black" as const,
	sizeSelect: "md" as const,
	weightSelect: "md" as const,
	withPrimaryColor: false,
};
const minimalStructure = {
	layout: {
		columns: 1,
		marge: "md",
		space: "md",
		withPhoto: false,
		stylePhoto: "flat",
		listStyle: "none",
		titleSection: {
			textTransform: "capitalize",
			withIcon: false,
			iconStyle: "flat",
			withLigneDessous: false,
			withLigneDessus: false,
			lineWeight: "md",
			bottomSpaceLine: "md",
			topSpaceLine: "md",
			iconColor: "black",
		},
		typography: {
			fontFamily: "inter",
			roles: {
				body: "inter",
				headerTitle: "inter",
				headerSubTitle: "inter",
				sectionTitle: "inter",
			},
		},
	},
	header: {
		settings: {
			title: baseSettings,
			subTitle: baseSettings,
			content: baseSettings,
			nom: baseSettings,
			prenom: baseSettings,
		},
	},
	modules: [
		{
			type: "skill" as const,
			column: 0,
			order: 1,
			isActive: true,
			title: "Skills",
			settings: {
				title: baseSettings,
				content: {
					groupTitle: baseSettings,
					skills: baseSettings,
					design: "stars",
					withGroupTitle: true,
				},
			},
		},
	],
} satisfies CreateCvTemplateInput["structure"];
const modernePayload = {
	name: "Template Moderne",
	structure: minimalStructure,
	defaultStyles: {
		primaryColor: { name: "Noir" },
		slugTemplate: "moderne",
	},
};
const classiquePayload = {
	name: "Template Classique",
	structure: {
		...minimalStructure,
	},
	defaultStyles: {
		primaryColor: { name: "Blanc" },
		slugTemplate: "classique",
	},
};

describe("cvTemplateRouter", () => {
	it("create returns UNAUTHORIZED without session", async () => {
		const caller = await createTestCaller();

		await expect(caller.cvTemplate.create(modernePayload)).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
	});

	it("create creates a template via tRPC", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const template = await caller.cvTemplate.create(modernePayload);

		expect(template.name).toBe("Template Moderne");
		const parsed = createCvTemplateSchema.parse(modernePayload);

		expect(template.structure).toEqual(parsed.structure);
		expect(template.defaultStyles).toEqual(parsed.defaultStyles);
	});

	it("create rejects invalid input (Zod)", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));
		// name vide
		await expect(
			caller.cvTemplate.create({
				...modernePayload,
				name: "",
			}),
		).rejects.toBeInstanceOf(TRPCError);
		// structure invalide (ancienne forme / champs manquants)
		await expect(
			caller.cvTemplate.create({
				name: "Bad",
				// @ts-expect-error — test de validation runtime
				structure: { sections: ["header"] },
				defaultStyles: modernePayload.defaultStyles,
			}),
		).rejects.toBeInstanceOf(TRPCError);
		// defaultStyles invalide
		await expect(
			caller.cvTemplate.create({
				name: "Bad styles",
				structure: modernePayload.structure,
				// @ts-expect-error — test de validation runtime
				defaultStyles: { color: "#000000" },
			}),
		).rejects.toBeInstanceOf(TRPCError);
		// module experience incomplet (settings obligatoires)
		await expect(
			caller.cvTemplate.create({
				name: "Bad module",
				structure: {
					...minimalStructure,
					modules: [
						// @ts-expect-error — test de validation runtime
						{
							type: "experience" as const,
							order: 1,
							isActive: true,
							title: "Expérience",
							// settings manquant → Zod doit rejeter
						},
					],
				},
				defaultStyles: modernePayload.defaultStyles,
			}),
		).rejects.toBeInstanceOf(TRPCError);
	});

	it("create returns CONFLICT when name already exists", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.cvTemplate.create(modernePayload);

		await expect(caller.cvTemplate.create(modernePayload)).rejects.toMatchObject({
			code: "CONFLICT",
		});
	});

	it("findById returns a template", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const created = await caller.cvTemplate.create(modernePayload);
		const found = await caller.cvTemplate.findById({ id: created.id });

		expect(found.id).toBe(created.id);
		expect(found.name).toBe("Template Moderne");
	});

	it("findById returns NOT_FOUND for unknown id", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await expect(caller.cvTemplate.findById({ id: "unknown-id" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	// it("findById returns UNAUTHORIZED without session", async () => {
	// 	const caller = await createTestCaller();

	// 	await expect(
	// 		caller.cvTemplate.findById({ id: "any" }),
	// 	).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	// });

	it("findById works without session", async () => {
		const user = await createTestUser();
		const authed = await createTestCaller(createTestSession(user));
		const created = await authed.cvTemplate.create(modernePayload);
		const guest = await createTestCaller();
		const found = await guest.cvTemplate.findById({ id: created.id });
		expect(found.id).toBe(created.id);
	});

	it("findAll returns templates sorted by name", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		await caller.cvTemplate.create(modernePayload);
		await caller.cvTemplate.create(classiquePayload);

		const list = await caller.cvTemplate.findAll();

		expect(list).toHaveLength(2);
		expect(list.map((t) => t.name)).toEqual(["Template Classique", "Template Moderne"]);
	});

	it("findAll returns empty array when no templates", async () => {
		const user = await createTestUser();
		const caller = await createTestCaller(createTestSession(user));

		const list = await caller.cvTemplate.findAll();

		expect(list).toEqual([]);
	});

	// it("findAll returns UNAUTHORIZED without session", async () => {
	// 	const caller = await createTestCaller();

	// 	await expect(caller.cvTemplate.findAll()).rejects.toMatchObject({
	// 		code: "UNAUTHORIZED",
	// 	});
	// });

	it("findAll works without session", async () => {
		const caller = await createTestCaller();
		await expect(caller.cvTemplate.findAll()).resolves.toEqual([]);
	});
});
