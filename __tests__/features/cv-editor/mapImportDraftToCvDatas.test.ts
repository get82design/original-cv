import { describe, expect, it } from "vitest";
import {
	parseImportDate,
	mapImportDraftToCvDatas,
	applyImportDraftToForm,
} from "../../../src/features/cv-editor/component/form/mapImportDraftToCvDatas";
import type { CvImportDraft } from "../../../src/services/schemas/cvImportDraft.schema";
import type { CvFormValues } from "../../../src/services/schemas/cvSave.schema";
import type { TemplateCv } from "../../../utils/trpc.types";
import { formCvDefaultValue } from "../../../src/features/cv-editor/component/form/defaultValue";

const baseSettings = {
	sizeModel: "14px",
	weightModel: 400,
	colorSelect: "black" as const,
	sizeSelect: "md" as const,
	weightSelect: "md" as const,
	withPrimaryColor: false,
	textAlign: "left" as const,
};

const experienceContent = {
	title: baseSettings,
	company: baseSettings,
	periode: baseSettings,
	location: baseSettings,
	description: baseSettings,
	missions: baseSettings,
	withDescription: true,
	withListMissions: true,
	withLocation: true,
	withPeriode: true,
	withTitle: true,
	withCompany: true,
};

const minimalModel = {
	id: "tpl-1",
	name: "Test",
	structure: {
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
				textAlign: "left",
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
				type: "experience" as const,
				column: 0,
				order: 1,
				isActive: true,
				title: "Expériences",
				settings: {
					title: baseSettings,
					content: experienceContent,
				},
			},
			{
				type: "skill" as const,
				column: 0,
				order: 2,
				isActive: true,
				title: "Skills",
				settings: {
					title: baseSettings,
					content: {
						groupTitle: baseSettings,
						skills: baseSettings,
						design: "stars" as const,
						withGroupTitle: true,
					},
				},
			},
			{
				type: "description" as const,
				column: 0,
				order: 3,
				isActive: true,
				title: "Profil",
				settings: {
					title: baseSettings,
					content: { description: baseSettings },
				},
			},
		],
	},
	defaultStyles: {},
} as unknown as TemplateCv;

const sampleDraft: CvImportDraft = {
	identity: {
		firstName: "Ada",
		lastName: "Lovelace",
		email: "ada@example.com",
		title: "Mathématicienne",
	},
	description: "Pionnière du calcul.",
	experiences: [
		{
			title: "Analyste",
			company: "Analytical Engine",
			start: "1842-01",
			end: null,
			missions: [{ content: "Algorithmes" }],
		},
	],
	educations: [],
	formations: [],
	languages: [],
	skills: ["Math", "Logique"],
	certifications: [],
	socialMedias: [],
	warnings: [],
};

describe("parseImportDate", () => {
	it("parses YYYY, YYYY-MM and YYYY-MM-DD", () => {
		expect(parseImportDate("2020")?.getFullYear()).toBe(2020);
		expect(parseImportDate("2020-06")?.getMonth()).toBe(5);
		expect(parseImportDate("2020-06-15")?.getDate()).toBe(15);
	});

	it("returns undefined for empty / invalid", () => {
		expect(parseImportDate(null)).toBeUndefined();
		expect(parseImportDate("01/2020")).toBeUndefined();
	});
});

describe("mapImportDraftToCvDatas", () => {
	it("maps identity, experiences and flat skills into template modules", () => {
		const datas = mapImportDraftToCvDatas(sampleDraft, minimalModel);

		expect(datas.header?.prenom).toBe("Ada");
		expect(datas.header?.email).toBe("ada@example.com");
		expect(datas.experience?.content).toHaveLength(1);
		expect(datas.experience?.content?.[0]?.content.title).toBe("Analyste");
		expect(datas.experience?.content?.[0]?.content.missions).toHaveLength(1);
		expect(datas.skillGroup?.content?.[0]?.content.skills).toHaveLength(2);
		expect(datas.description?.content.description).toBe("Pionnière du calcul.");
	});
});

describe("applyImportDraftToForm", () => {
	it("merges draft into current form and sets title", () => {
		const current = {
			...formCvDefaultValue,
			templateId: "tpl-1",
		} as CvFormValues;

		const next = applyImportDraftToForm(current, sampleDraft, minimalModel);
		expect(next.title).toBe("CV - Ada Lovelace");
		expect(next.datas.header?.prenom).toBe("Ada");
		expect(next.datas.experience?.content).toHaveLength(1);
	});
});
