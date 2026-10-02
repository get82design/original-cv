import { describe, expect, it } from "vitest";
import { CVModuleType, CvTimelineStatus, Level } from "../../../generated/prisma/client";
import {
	mapCvToSaveInput,
	mapFormToSaveInput,
	type CvFull,
} from "../../../src/features/cv-editor/mapCvToSaveInput";
import { cvSaveSchema, type CvFormValues } from "../../../src/services/schemas/cvSave.schema";

const now = new Date("2024-01-01T00:00:00.000Z");
const start = new Date("2020-01-01T00:00:00.000Z");
const end = new Date("2022-01-01T00:00:00.000Z");

function emptyLists() {
	return {
		experiences: [],
		projects: [],
		volunteerings: [],
		formations: [],
		certifications: [],
		prizes: [],
		expertises: [],
		socialMedias: [],
		passions: [],
		languages: [],
		publications: [],
		strengths: [],
		stats: [],
		achievements: [],
		educations: [],
		skillGroups: [],
		competences: [],
		tagGroups: [],
		modules: [],
	};
}

function baseCv(overrides: Record<string, unknown> = {}): CvFull {
	return {
		id: "cv-1",
		userId: "user-1",
		templateId: "template-1",
		title: "Mon CV",
		photo: null,
		layoutGeneral: null,
		status: "DRAFT",
		createdAt: now,
		updatedAt: now,
		headerCv: null,
		description: null,
		philosophy: null,
		...emptyLists(),
		...overrides,
	} as unknown as CvFull;
}

function baseForm(overrides: Record<string, unknown> = {}): CvFormValues {
	return {
		templateId: "template-1",
		title: "Mon CV",
		photo: null,
		datas: {},
		modules: [],
		...overrides,
	} as CvFormValues;
}

function formModule(
	type: string,
	title: string,
	order: number,
): NonNullable<CvFormValues["modules"]>[number] {
	return {
		type: type as NonNullable<CvFormValues["modules"]>[number]["type"],
		title,
		order,
		column: 0,
		isActive: true,
	};
}

describe("mapCvToSaveInput", () => {
	it("maps a minimal CV", () => {
		const input = mapCvToSaveInput(baseCv());

		expect(input).toMatchObject({
			cvId: "cv-1",
			templateId: "template-1",
			title: "Mon CV",
		});
		expect(input.photo).toBeNull();
		expect(input.layoutGeneral).toBeUndefined();
		expect(input.datas.header).toBeUndefined();
		expect(input.datas.description).toBeUndefined();
		expect(input.datas.philosophy).toBeUndefined();
		expect(input.datas.experience?.content).toEqual([]);
		expect(input.modules).toEqual([]);
		expect(cvSaveSchema.safeParse(input).success).toBe(true);
	});

	it("includes photo and layoutGeneral when set", () => {
		const input = mapCvToSaveInput(
			baseCv({
				photo: "https://cdn/photo.jpg",
				layoutGeneral: { columns: true },
			}),
		);

		expect(input.photo).toBe("https://cdn/photo.jpg");
		expect(input.layoutGeneral).toEqual({ columns: true });
	});

	it("maps header, description and philosophy with optional fields", () => {
		const input = mapCvToSaveInput(
			baseCv({
				headerCv: {
					id: "h1",
					cvId: "cv-1",
					title: "Dev",
					subtitle: "Fullstack",
					phone: "0600000000",
					email: "a@b.c",
					location: "Paris",
					portfolio: "https://site.dev",
					nom: "Doe",
					prenom: "John",
				},
				description: {
					id: "d1",
					cvId: "cv-1",
					description: "Bio",
				},
				philosophy: {
					id: "p1",
					cvId: "cv-1",
					citation: "Cite",
					author: "Auteur",
				},
			}),
		);

		expect(input.datas.header).toEqual({
			id: "h1",
			title: "Dev",
			subtitle: "Fullstack",
			phone: "0600000000",
			email: "a@b.c",
			location: "Paris",
			portfolio: "https://site.dev",
			nom: "Doe",
			prenom: "John",
		});
		expect(input.datas.description).toEqual({
			id: "d1",
			content: { description: "Bio" },
			settings: {
				title: {
					sizeModel: "18px",
					weightModel: 600,
					colorSelect: "black",
					sizeSelect: "md",
					weightSelect: "md",
					withPrimaryColor: false,
					textAlign: "left",
				},
				content: {
					sizeModel: "18px",
					weightModel: 600,
					colorSelect: "black",
					sizeSelect: "md",
					weightSelect: "md",
					withPrimaryColor: false,
					textAlign: "left",
				},
			},
		});
		expect(input.datas.philosophy).toEqual({
			id: "p1",
			content: {
				citation: "Cite",
				author: "Auteur",
			},
			settings: {
				title: {
					sizeModel: "18px",
					weightModel: 600,
					colorSelect: "black",
					sizeSelect: "md",
					weightSelect: "md",
					withPrimaryColor: false,
					textAlign: "left",
				},
				content: {
					citation: {
						sizeModel: "18px",
						weightModel: 600,
						colorSelect: "black",
						sizeSelect: "md",
						weightSelect: "md",
						withPrimaryColor: false,
						textAlign: "left",
					},
					author: {
						sizeModel: "18px",
						weightModel: 600,
						colorSelect: "black",
						sizeSelect: "md",
						weightSelect: "md",
						withPrimaryColor: false,
						textAlign: "left",
					},
					withAuthor: true,
				},
			},
		});
	});

	it("omits null optional header fields", () => {
		const input = mapCvToSaveInput(
			baseCv({
				headerCv: {
					id: "h1",
					cvId: "cv-1",
					title: "Only title",
					subtitle: null,
					phone: null,
					email: null,
					location: null,
					portfolio: null,
					nom: null,
					prenom: null,
				},
			}),
		);

		expect(input.datas.header).toEqual({ id: "h1", title: "Only title" });
	});

	it("sorts experiences/projects/volunteerings and their missions by order", () => {
		const input = mapCvToSaveInput(
			baseCv({
				experiences: [
					{
						id: "e2",
						cvId: "cv-1",
						title: "Second",
						company: "B",
						start,
						end,
						location: null,
						description: null,
						order: 2,
						settings: null,
						cvMissions: [
							{ id: "em2", cvExperienceId: "e2", content: "m2", order: 2 },
							{ id: "em1", cvExperienceId: "e2", content: "m1", order: 1 },
						],
					},
					{
						id: "e1",
						cvId: "cv-1",
						title: "First",
						company: "A",
						start,
						end: null,
						location: "Lyon",
						description: "Desc",
						order: 1,
						settings: null,
						cvMissions: [],
					},
				],
				projects: [
					{
						id: "pr2",
						cvId: "cv-1",
						title: "P2",
						start,
						end,
						location: null,
						description: null,
						technology: null,
						status: CvTimelineStatus.COMPLETED,
						order: 2,
						settings: null,
						cvMissions: [],
					},
					{
						id: "pr1",
						cvId: "cv-1",
						title: "P1",
						start,
						end: null,
						location: "Remote",
						description: "D",
						technology: "TS",
						status: CvTimelineStatus.INTERRUPTED,
						order: 1,
						settings: null,
						cvMissions: [
							{ id: "pm1", cvProjectId: "pr1", content: "ship", order: 1 },
							{ id: "pm2", cvProjectId: "pr1", content: "ship", order: 2 },
						],
					},
				],
				volunteerings: [
					{
						id: "v2",
						cvId: "cv-1",
						title: "V2",
						organisation: "Org",
						start,
						end: null,
						location: null,
						description: null,
						order: 2,
						settings: null,
						cvMissions: [
							{ id: "vm1", cvVolunteeringId: "v1", content: "help", order: 1 },
							{ id: "vm2", cvVolunteeringId: "v1", content: "help", order: 2 },
						],
					},
					{
						id: "v1",
						cvId: "cv-1",
						title: "V1",
						organisation: "Org",
						start,
						end: null,
						location: null,
						description: null,
						order: 1,
						settings: null,
						cvMissions: [
							{ id: "vm1", cvVolunteeringId: "v1", content: "help", order: 1 },
							{ id: "vm2", cvVolunteeringId: "v1", content: "help", order: 2 },
						],
					},
				],
			}),
		);

		expect(input.datas.experience?.content.map((x) => x.id)).toEqual(["e1", "e2"]);
		expect(input.datas.experience?.content[1]?.content.missions.map((m) => m.id)).toEqual([
			"em1",
			"em2",
		]);
		expect(input.datas.project?.content.map((x) => x.id)).toEqual(["pr1", "pr2"]);
		expect(input.datas.volunteering?.content[0]?.content.missions[0]?.id).toBe("vm1");
		expect(input.datas.volunteering?.content[1]?.content.missions[0]?.id).toBe("vm1");
		expect(input.datas.volunteering?.content[1]?.content.missions[1]?.id).toBe("vm2");
		expect(cvSaveSchema.safeParse(input).success).toBe(true);
	});

	it("maps all list sections and modules", () => {
		const input = mapCvToSaveInput(
			baseCv({
				formations: [
					{
						id: "f1",
						cvId: "cv-1",
						title: "Form",
						start,
						end,
						organismeFormation: "OF",
						status: CvTimelineStatus.COMPLETED,
						order: 1,
						settings: null,
					},
					{
						id: "f2",
						cvId: "cv-1",
						title: "Form",
						start,
						end,
						organismeFormation: "OF",
						status: CvTimelineStatus.COMPLETED,
						order: 2,
						settings: null,
					},
				],
				certifications: [
					{
						id: "c1",
						cvId: "cv-1",
						title: "Cert",
						organismeCertification: null,
						order: 1,
						settings: null,
					},
					{
						id: "c2",
						cvId: "cv-1",
						title: "Cert",
						organismeCertification: null,
						order: 2,
						settings: null,
					},
				],
				prizes: [
					{
						id: "z1",
						cvId: "cv-1",
						title: "Prize",
						domaine: null,
						order: 1,
						settings: null,
					},
					{
						id: "z2",
						cvId: "cv-1",
						title: "Prize",
						domaine: null,
						order: 2,
						settings: null,
					},
				],
				expertises: [
					{
						id: "x1",
						cvId: "cv-1",
						title: "Exp",
						level: Level.Senior,
						order: 1,
						settings: null,
					},
					{
						id: "x2",
						cvId: "cv-1",
						title: "Exp",
						level: Level.Senior,
						order: 2,
						settings: null,
					},
				],
				socialMedias: [
					{
						id: "sm1",
						cvId: "cv-1",
						socialNetwork: "LinkedIn",
						username: "john",
						icon: "🌐",
						order: 1,
						settings: null,
					},
					{
						id: "sm2",
						cvId: "cv-1",
						socialNetwork: "LinkedIn",
						username: "john",
						icon: "🌐",
						order: 2,
						settings: null,
					},
				],
				passions: [
					{
						id: "pa1",
						cvId: "cv-1",
						title: "Ski",
						icon: "ski",
						order: 1,
						settings: null,
					},
					{
						id: "pa2",
						cvId: "cv-1",
						title: "Ski",
						icon: "ski",
						order: 2,
						settings: null,
					},
				],
				languages: [
					{
						id: "l1",
						cvId: "cv-1",
						name: "FR",
						level: Level.Expert,
						order: 1,
						settings: null,
					},
					{
						id: "l2",
						cvId: "cv-1",
						name: "EN",
						level: Level.Expert,
						order: 2,
						settings: null,
					},
				],
				publications: [
					{
						id: "pub1",
						cvId: "cv-1",
						title: "Paper",
						start,
						end: null,
						journalName: "Nature",
						description: null,
						url: "https://x",
						order: 1,
						settings: null,
					},
					{
						id: "pub2",
						cvId: "cv-1",
						title: "Paper",
						start,
						end: null,
						journalName: "Nature",
						description: null,
						url: "https://x",
						order: 2,
						settings: null,
					},
				],
				strengths: [
					{
						id: "st1",
						cvId: "cv-1",
						title: "Focus",
						icon: null,
						order: 1,
						settings: null,
					},
					{
						id: "st2",
						cvId: "cv-1",
						title: "Focus",
						icon: null,
						order: 2,
						settings: null,
					},
				],
				achievements: [
					{
						id: "a1",
						cvId: "cv-1",
						title: "Ship",
						description: null,
						order: 1,
						settings: null,
					},
					{
						id: "a2",
						cvId: "cv-1",
						title: "Ship",
						description: null,
						order: 2,
						settings: null,
					},
				],
				educations: [
					{
						id: "ed1",
						cvId: "cv-1",
						title: null,
						school: "Uni",
						degree: "Master",
						city: null,
						start,
						end: null,
						obtained: CvTimelineStatus.COMPLETED,
						order: 1,
						settings: null,
					},
					{
						id: "ed2",
						cvId: "cv-1",
						title: null,
						school: "Uni",
						degree: "Master",
						city: null,
						start,
						end: null,
						obtained: CvTimelineStatus.COMPLETED,
						order: 2,
						settings: null,
					},
				],
				skillGroups: [
					{
						id: "sg2",
						cvId: "cv-1",
						title: "Soft skills",
						order: 2,
						skills: [
							{
								id: "s2",
								groupId: "sg2",
								skillId: "skill-2",
								level: Level.Junior,
								order: 2,
								skill: { id: "skill-2", name: "Vue" },
							},
							{
								id: "s1",
								groupId: "sg2",
								skillId: "skill-1",
								level: Level.Intermédiaire,
								order: 1,
								skill: { id: "skill-1", name: "React" },
							},
						],
					},
					{
						id: "sg1",
						cvId: "cv-1",
						title: "Hard",
						order: 1,
						skills: [
							{
								id: "s0",
								groupId: "sg1",
								skillId: "skill-0",
								level: Level.Senior,
								order: 1,
								skill: { id: "skill-0", name: "TS" },
							},
						],
					},
				],
				competences: [
					{
						id: "cg2",
						cvId: "cv-1",
						title: "B",
						order: 2,
						cvCompetences: [
							{
								id: "cc2",
								groupId: "cg2",
								competenceId: "comp-2",
								order: 2,
								competence: { id: "comp-2", name: "B" },
							},
							{
								id: "cc1",
								groupId: "cg2",
								competenceId: "comp-1",
								order: 1,
								competence: { id: "comp-1", name: "A" },
							},
						],
					},
					{
						id: "cg1",
						cvId: "cv-1",
						title: "Soft",
						order: 1,
						cvCompetences: [
							{
								id: "cc0",
								groupId: "cg1",
								competenceId: "comp-0",
								order: 1,
								competence: { id: "comp-0", name: "Com" },
							},
						],
					},
				],
				tagGroups: [
					{
						id: "tg2",
						cvId: "cv-1",
						title: "Tags",
						order: 2,
						tags: [
							{
								id: "ct2",
								groupId: "tg2",
								tagId: "tag-2",
								order: 2,
								tag: { id: "tag-2", name: "B" },
							},
							{
								id: "ct1",
								groupId: "tg2",
								tagId: "tag-1",
								order: 1,
								tag: { id: "tag-1", name: "A" },
							},
						],
					},
					{
						id: "tg1",
						cvId: "cv-1",
						title: "Tags",
						order: 1,
						tags: [
							{
								id: "cc0",
								groupId: "cg1",
								tagId: "tag-0",
								order: 1,
								tag: { id: "tag-0", name: "Com" },
							},
						],
					},
				],
				modules: [
					{
						id: "m2",
						cvId: "cv-1",
						type: CVModuleType.experience,
						column: 0,
						order: 2,
						isActive: true,
						title: null,
						settings: null,
					},
					{
						id: "m1",
						cvId: "cv-1",
						type: CVModuleType.description,
						column: 0,
						order: 1,
						isActive: false,
						title: "À propos",
						settings: { compact: true },
					},
				],
			}),
		);

		expect(input.datas.certification?.content[0]?.content.organismeCertification).toBe("");
		expect(input.datas.prize?.content[0]?.content.domaine).toBe("");
		expect(input.datas.education?.content[0]?.content.title).toBe("");
		expect(input.datas.strength?.content[0]?.content.icon).toBeUndefined();
		expect(input.datas.skillGroup?.content[0]?.content.skills[0]?.content).toEqual({
			name: "TS",
			skillId: "skill-0",
			level: Level.Senior,
		});
		expect(input.datas.competenceGroup?.content[0]?.content.competences[0]?.content).toEqual({
			competenceId: "comp-0",
			name: "Com",
		});
		expect(input.datas.tagGroup?.content[0]?.content.tags[0]?.content).toEqual({
			tagId: "tag-0",
			name: "Com",
		});
		expect(input.modules.map((m) => m.id)).toEqual(["m1", "m2"]);
		expect(input.modules[0]).toMatchObject({
			title: "À propos",
			settings: { compact: true },
			isActive: false,
		});
		expect(input.modules[1]?.settings).toEqual({});
		expect(input.modules[1]?.title).toBeUndefined();
		expect(cvSaveSchema.safeParse(input).success).toBe(true);
	});
});

describe("mapFormToSaveInput", () => {
	it("maps a minimal form and drops guest cvId", () => {
		const input = mapFormToSaveInput(baseForm({ cvId: "0", title: "   " }));

		expect(input.cvId).toBeUndefined();
		expect(input.title).toBe("Mon CV");
		expect(input.templateId).toBe("template-1");
		expect(input.datas.header).toBeUndefined();
		expect(input.modules).toEqual([]);
		expect(cvSaveSchema.safeParse(input).success).toBe(true);
	});

	it("keeps a real cvId and derives the title from prenom and nom", () => {
		const input = mapFormToSaveInput(
			baseForm({
				cvId: "cv-1",
				title: "Ancien titre",
				datas: {
					header: {
						prenom: " John ",
						nom: " Doe ",
						title: "   ",
					},
				},
			}),
		);

		expect(input.cvId).toBe("cv-1");
		expect(input.title).toBe("CV - John Doe");
		expect(input.datas.header?.title).toBe("CV - John Doe");
		expect(cvSaveSchema.safeParse(input).success).toBe(true);
	});

	it("falls back to the form title when the name is incomplete", () => {
		const input = mapFormToSaveInput(
			baseForm({
				title: "  Titre perso  ",
				datas: { header: { prenom: "John", nom: "", title: "Dev" } },
			}),
		);

		expect(input.title).toBe("Titre perso");
		expect(input.datas.header?.title).toBe("Dev");
	});

	it("copies section titles onto matching modules", () => {
		const input = mapFormToSaveInput(
			baseForm({
				datas: {
					description: { title: "À propos", content: { description: "Bio" } },
					experience: { title: "Expériences", content: [] },
					education: { title: "Études", content: [] },
					skillGroup: { title: "Compétences", content: [] },
					language: { title: "Langues", content: [] },
					project: { title: "Projets", content: [] },
					volunteering: { title: "Bénévolat", content: [] },
					formation: { title: "Formations", content: [] },
					certification: { title: "Certifs", content: [] },
					prize: { title: "Prix", content: [] },
					expertise: { title: "Expertises", content: [] },
					socialMedia: { title: "Réseaux", content: [] },
					strength: { title: "Forces", content: [] },
					philosophy: {
						title: "Citation",
						content: { citation: "Think" },
					},
					passion: { title: "Passions", content: [] },
					competenceGroup: { title: "Savoir-faire", content: [] },
					tagGroup: { title: "Tags", content: [] },
					publication: { title: "Pubs", content: [] },
					achievement: { title: "Réussites", content: [] },
				},
				modules: [
					formModule("description", "old", 1),
					formModule("experience", "old", 2),
					formModule("education", "old", 3),
					formModule("skill", "old", 4),
					formModule("language", "old", 5),
					formModule("project", "old", 6),
					formModule("volunteering", "old", 7),
					formModule("formation", "old", 8),
					formModule("certification", "old", 9),
					formModule("prize", "old", 10),
					formModule("expertise", "old", 11),
					formModule("socialMedia", "old", 12),
					formModule("strength", "old", 13),
					formModule("philosophy", "old", 14),
					formModule("passion", "old", 15),
					formModule("competence", "old", 16),
					formModule("tag", "old", 17),
					formModule("publication", "old", 18),
					formModule("achievement", "old", 19),
				],
			}),
		);

		expect(input.modules?.map((m) => m.title)).toEqual([
			"À propos",
			"Expériences",
			"Études",
			"Compétences",
			"Langues",
			"Projets",
			"Bénévolat",
			"Formations",
			"Certifs",
			"Prix",
			"Expertises",
			"Réseaux",
			"Forces",
			"Citation",
			"Passions",
			"Savoir-faire",
			"Tags",
			"Pubs",
			"Réussites",
		]);
		expect(cvSaveSchema.safeParse(input).success).toBe(true);
	});

	it("filters empty dated items, empty missions and coerces string dates", () => {
		const startDate = new Date("2020-01-01T00:00:00.000Z");
		const input = mapFormToSaveInput(
			baseForm({
				datas: {
					experience: {
						content: [
							{
								clientKey: "exp-empty",
								content: {
									title: "  ",
									company: "",
									start: startDate,
									end: null,
									missions: [],
								},
							},
							{
								clientKey: "exp-company",
								content: {
									title: "",
									company: "ACME",
									start: "2020-06-01T00:00:00.000Z",
									end: "2021-06-01T00:00:00.000Z",
									missions: [
										{ clientKey: "m-empty", content: { content: "  " } },
										{
											clientKey: "m-ok",
											content: { content: "Livré" },
										},
									],
								},
							},
							{
								clientKey: "exp-title",
								content: {
									title: "Dev",
									company: "  ",
									start: startDate,
									end: null,
								},
							},
						],
					},
					project: {
						content: [
							{
								clientKey: "p-empty",
								content: {
									title: "  ",
									start: startDate,
									end: null,
									missions: [],
								},
							},
							{
								clientKey: "p-ok",
								content: {
									title: "App",
									start: "2019-01-01T00:00:00.000Z",
									end: null,
									missions: [{ clientKey: "pm", content: { content: "Code" } }],
								},
							},
						],
					},
					volunteering: {
						content: [
							{
								clientKey: "v-empty",
								content: {
									title: "",
									organisation: "  ",
									start: startDate,
									end: null,
									missions: [],
								},
							},
							{
								clientKey: "v-org",
								content: {
									title: "",
									organisation: "Croix Rouge",
									start: startDate,
									end: null,
									missions: [],
								},
							},
							{
								clientKey: "v-title",
								content: {
									title: "Aide",
									organisation: "",
									start: startDate,
									end: null,
								},
							},
						],
					},
					education: {
						content: [
							{
								clientKey: "ed-empty",
								content: {
									title: "Master",
									school: "  ",
									degree: "M2",
									start: startDate,
									end: null,
								},
							},
							{
								clientKey: "ed-ok",
								content: {
									title: "Master",
									school: "Uni",
									degree: "M2",
									start: "2018-09-01T00:00:00.000Z",
									end: null,
								},
							},
						],
					},
					formation: {
						content: [
							{
								clientKey: "f-empty",
								content: { title: "  ", start: startDate },
							},
							{
								clientKey: "f-ok",
								content: {
									title: "React",
									start: startDate,
									end: "2022-01-01T00:00:00.000Z",
								},
							},
							{
								clientKey: "f-open",
								content: { title: "Vue", start: startDate },
							},
						],
					},
					publication: {
						content: [
							{
								clientKey: "pub-empty",
								content: { title: "", start: startDate },
							},
							{
								clientKey: "pub-ok",
								content: {
									title: "Paper",
									start: startDate,
									end: "2023-01-01T00:00:00.000Z",
								},
							},
						],
					},
				},
			}),
		);

		expect(input.datas.experience?.content.map((i) => i.clientKey)).toEqual([
			"exp-company",
			"exp-title",
		]);
		expect(input.datas.experience?.content[0]?.content).toMatchObject({
			title: "Intitulé",
			company: "ACME",
		});
		expect(input.datas.experience?.content[0]?.content.start).toEqual(
			new Date("2020-06-01T00:00:00.000Z"),
		);
		expect(input.datas.experience?.content[0]?.content.end).toEqual(
			new Date("2021-06-01T00:00:00.000Z"),
		);
		expect(input.datas.experience?.content[0]?.content.missions.map((m) => m.clientKey)).toEqual([
			"m-ok",
		]);
		expect(input.datas.experience?.content[1]?.content.company).toBe("Entreprise");
		expect(input.datas.experience?.content[1]?.content.start).toBe(startDate);
		expect(input.datas.experience?.content[1]?.content.end).toBeNull();

		expect(input.datas.project?.content.map((i) => i.clientKey)).toEqual(["p-ok"]);
		expect(input.datas.volunteering?.content.map((i) => i.clientKey)).toEqual(["v-org", "v-title"]);
		expect(input.datas.volunteering?.content[0]?.content.title).toBe("Intitulé");
		expect(input.datas.volunteering?.content[1]?.content.organisation).toBe("Organisation");
		expect(input.datas.education?.content.map((i) => i.clientKey)).toEqual(["ed-ok"]);
		expect(input.datas.formation?.content.map((i) => i.clientKey)).toEqual(["f-ok", "f-open"]);
		expect(input.datas.formation?.content[0]?.content.end).toEqual(
			new Date("2022-01-01T00:00:00.000Z"),
		);
		expect(input.datas.formation?.content[1]?.content.end).toBeUndefined();
		expect(input.datas.publication?.content[0]?.content.end).toEqual(
			new Date("2023-01-01T00:00:00.000Z"),
		);
		expect(cvSaveSchema.safeParse(input).success).toBe(true);
	});

	it("drops empty philosophy and description", () => {
		const empty = mapFormToSaveInput(
			baseForm({
				datas: {
					philosophy: { content: { citation: "   " } },
					description: { content: { description: "  " } },
				},
			}),
		);
		expect(empty.datas.philosophy).toBeUndefined();
		expect(empty.datas.description).toBeUndefined();

		const filled = mapFormToSaveInput(
			baseForm({
				datas: {
					philosophy: { content: { citation: "Think", author: "Ada" } },
					description: { content: { description: "Bio" } },
				},
			}),
		);
		expect(filled.datas.philosophy?.content.citation).toBe("Think");
		expect(filled.datas.description?.content.description).toBe("Bio");
		expect(cvSaveSchema.safeParse(filled).success).toBe(true);
	});

	it("filters empty remaining sections and applies fallbacks", () => {
		const input = mapFormToSaveInput(
			baseForm({
				datas: {
					certification: {
						content: [
							{ clientKey: "c-empty", content: { title: "  ", organismeCertification: "" } },
							{
								clientKey: "c-ok",
								content: { title: "AWS", organismeCertification: "Amazon" },
							},
						],
					},
					achievement: {
						content: [
							{ clientKey: "a-empty", content: { title: "" } },
							{ clientKey: "a-ok", content: { title: "Ship" } },
						],
					},
					expertise: {
						content: [
							{
								clientKey: "x-empty",
								content: { title: "  ", level: Level.Senior },
							},
							{
								clientKey: "x-ok",
								content: { title: "TS", level: Level.Senior },
							},
						],
					},
					language: {
						content: [
							{
								clientKey: "l-empty",
								content: { name: "  ", level: Level.Expert },
							},
							{
								clientKey: "l-ok",
								content: { name: "FR", level: Level.Expert },
							},
						],
					},
					passion: {
						content: [
							{ clientKey: "pa-empty", content: { title: "", icon: "" } },
							{ clientKey: "pa-ok", content: { title: "Ski", icon: "" } },
						],
					},
					prize: {
						content: [
							{ clientKey: "z-empty", content: { title: "  ", domaine: "" } },
							{ clientKey: "z-ok", content: { title: "Oscar", domaine: undefined } },
						],
					},
					socialMedia: {
						content: [
							{
								clientKey: "sm-empty",
								content: { username: "", socialNetwork: "  ", icon: "" },
							},
							{
								clientKey: "sm-ok",
								content: {
									username: "",
									socialNetwork: "LinkedIn",
									icon: undefined,
								},
							},
						],
					},
					strength: {
						content: [
							{ clientKey: "st-empty", content: { title: "  " } },
							{ clientKey: "st-ok", content: { title: "Focus" } },
						],
					},
				},
			}),
		);

		expect(input.datas.certification?.content.map((i) => i.clientKey)).toEqual(["c-ok"]);
		expect(input.datas.achievement?.content.map((i) => i.clientKey)).toEqual(["a-ok"]);
		expect(input.datas.expertise?.content.map((i) => i.clientKey)).toEqual(["x-ok"]);
		expect(input.datas.language?.content.map((i) => i.clientKey)).toEqual(["l-ok"]);
		expect(input.datas.passion?.content[0]?.content.icon).toBe("BsBalloonHeartFill");
		expect(input.datas.prize?.content[0]?.content.domaine).toBe("");
		expect(input.datas.socialMedia?.content[0]?.content).toMatchObject({
			username: "Utilisateur",
			icon: "",
		});
		expect(input.datas.strength?.content.map((i) => i.clientKey)).toEqual(["st-ok"]);
		expect(cvSaveSchema.safeParse(input).success).toBe(true);
	});

	it("drops empty skill, competence and tag groups and blank children", () => {
		const input = mapFormToSaveInput(
			baseForm({
				datas: {
					skillGroup: {
						content: [
							{
								clientKey: "sg-empty",
								content: {
									title: "  ",
									skills: [
										{
											clientKey: "s-blank",
											content: { name: "  ", level: Level.Junior },
										},
									],
								},
							},
							{
								clientKey: "sg-ok",
								content: {
									title: "Hard",
									skills: [
										{
											clientKey: "s-name",
											content: { name: "React", level: Level.Senior },
										},
										{
											clientKey: "s-id",
											content: {
												name: "",
												skillId: "skill-1",
												level: Level.Junior,
											},
										},
										{
											clientKey: "s-blank",
											content: { name: "  ", level: Level.Débutant },
										},
									],
								},
							},
						],
					},
					competenceGroup: {
						content: [
							{
								clientKey: "cg-empty",
								content: { title: "", competences: [] },
							},
							{
								clientKey: "cg-ok",
								content: {
									title: "Soft",
									competences: [
										{ clientKey: "c-name", content: { name: "Com" } },
										{
											clientKey: "c-id",
											content: { name: "", competenceId: "comp-1" },
										},
										{ clientKey: "c-blank", content: { name: "  " } },
									],
								},
							},
						],
					},
					tagGroup: {
						content: [
							{
								clientKey: "tg-empty",
								content: { title: "", tags: [] },
							},
							{
								clientKey: "tg-ok",
								content: {
									title: "Stack",
									tags: [
										{ clientKey: "t-name", content: { name: "TS" } },
										{
											clientKey: "t-id",
											content: { name: "", tagId: "tag-1" },
										},
										{ clientKey: "t-blank", content: { name: "  " } },
									],
								},
							},
						],
					},
				},
			}),
		);

		expect(input.datas.skillGroup?.content.map((g) => g.clientKey)).toEqual(["sg-ok"]);
		expect(input.datas.skillGroup?.content[0]?.content.skills.map((s) => s.clientKey)).toEqual([
			"s-name",
			"s-id",
		]);
		expect(
			input.datas.competenceGroup?.content[0]?.content.competences.map((c) => c.clientKey),
		).toEqual(["c-name", "c-id"]);
		expect(input.datas.tagGroup?.content[0]?.content.tags.map((t) => t.clientKey)).toEqual([
			"t-name",
			"t-id",
		]);
		expect(cvSaveSchema.safeParse(input).success).toBe(true);
	});
});
