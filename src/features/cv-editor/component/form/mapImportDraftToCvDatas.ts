import { v4 as uuid } from "uuid";
import {
	templateStructureSchema,
	type TemplateModule,
} from "../../../../services/schemas/cvTemplate.schema";
import type { CvFormValues } from "../../../../services/schemas/cvSave.schema";
import type { CvImportDraft } from "../../../../services/schemas/cvImportDraft.schema";
import {
	LevelSchema,
	type Level,
} from "../../../../services/schemas/enums";
import type { TemplateCv } from "../../../../../utils/trpc.types";

function getModule<T extends TemplateModule["type"]>(
	modules: TemplateModule[],
	type: T,
): Extract<TemplateModule, { type: T }> | undefined {
	return modules.find(
		(m): m is Extract<TemplateModule, { type: T }> => m.type === type,
	);
}

/** YYYY | YYYY-MM | YYYY-MM-DD → Date (1er du mois / 1er janv. si partiel). */
export function parseImportDate(
	value?: string | null,
): Date | undefined {
	if (!value?.trim()) return undefined;
	const v = value.trim();
	if (/^\d{4}$/.test(v)) return new Date(`${v}-01-01T12:00:00`);
	if (/^\d{4}-\d{2}$/.test(v)) return new Date(`${v}-01T12:00:00`);
	if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(`${v}T12:00:00`);
	return undefined;
}

function toLevel(raw?: string | null): Level {
	const parsed = LevelSchema.safeParse(raw);
	return parsed.success ? parsed.data : "Intermédiaire";
}

/**
 * Mappe un draft d’import Gemini vers datas CV (même forme que mapProfileToCvDatas).
 * Respecte les modules présents dans le template.
 */
export function mapImportDraftToCvDatas(
	draft: CvImportDraft,
	model: TemplateCv,
): Partial<CvFormValues["datas"]> {
	const { modules, header } = templateStructureSchema.parse(model.structure);

	const exp = getModule(modules, "experience");
	const edu = getModule(modules, "education");
	const language = getModule(modules, "language");
	const description = getModule(modules, "description");
	const certification = getModule(modules, "certification");
	const socialMedia = getModule(modules, "socialMedia");
	const formation = getModule(modules, "formation");
	const skill = getModule(modules, "skill");

	const firstName = draft.identity?.firstName?.trim() || "";
	const lastName = draft.identity?.lastName?.trim() || "";
	const fullName = [firstName, lastName].filter(Boolean).join(" ");

	return {
		header: {
			prenom: firstName,
			nom: lastName,
			title: fullName || draft.identity?.title || "CV",
			subtitle: draft.identity?.title ?? "",
			phone: draft.identity?.phone ?? "",
			email: draft.identity?.email ?? "",
			location: draft.identity?.location ?? "",
			portfolio: "",
			settings: header.settings,
		},
		...(exp
			? {
					experience: {
						title: exp.title,
						settings: { title: exp.settings.title },
						content: draft.experiences.map((e, order) => ({
							clientKey: `import-exp-${uuid()}`,
							order: order + 1,
							content: {
								title: e.title,
								company: e.company ?? "",
								start: parseImportDate(e.start) ?? new Date(),
								end: parseImportDate(e.end) ?? null,
								description: e.description ?? undefined,
								location: e.location ?? undefined,
								missions: e.missions.map((m, mo) => ({
									clientKey: `import-mission-${uuid()}`,
									order: mo + 1,
									content: { content: m.content },
								})),
								settings: exp.settings.content,
							},
						})),
					},
				}
			: {}),
		...(edu
			? {
					education: {
						title: edu.title,
						settings: { title: edu.settings.title },
						content: draft.educations.map((e, order) => ({
							clientKey: `import-edu-${uuid()}`,
							order: order + 1,
							content: {
								title: e.title,
								school: e.school?.trim() || "—",
								degree: e.degree ?? "",
								start: parseImportDate(e.start) ?? new Date(),
								end: parseImportDate(e.end) ?? null,
								obtained: null,
								city: e.city ?? undefined,
								settings: edu.settings.content,
							},
						})),
					},
				}
			: {}),
		...(formation
			? {
					formation: {
						title: formation.title,
						settings: { title: formation.settings.title },
						content: draft.formations.map((f, order) => ({
							clientKey: `import-formation-${uuid()}`,
							order: order + 1,
							content: {
								title: f.title,
								organismeFormation: f.organismeFormation ?? "",
								status: null,
								start: parseImportDate(f.start) ?? new Date(),
								end: parseImportDate(f.end) ?? undefined,
								settings: formation.settings.content,
							},
						})),
					},
				}
			: {}),
		...(language
			? {
					language: {
						title: language.title,
						settings: { title: language.settings.title },
						content: draft.languages.map((l, order) => ({
							clientKey: `import-lang-${uuid()}`,
							order: order + 1,
							content: {
								name: l.name,
								level: toLevel(
									typeof l.level === "string" ? l.level : null,
								),
								settings: language.settings.content,
							},
						})),
					},
				}
			: {}),
		...(skill && draft.skills.length > 0
			? {
					skillGroup: {
						title: skill.title,
						settings: { title: skill.settings.title },
						content: [
							{
								clientKey: `import-skill-group-${uuid()}`,
								order: 1,
								content: {
									title: "Compétences",
									skills: draft.skills.map((name, order) => ({
										clientKey: `import-skill-${uuid()}`,
										order: order + 1,
										content: {
											name,
											level: "Intermédiaire" as Level,
										},
									})),
									settings: skill.settings.content,
								},
							},
						],
					},
				}
			: {}),
		...(certification
			? {
					certification: {
						title: certification.title,
						settings: { title: certification.settings.title },
						content: draft.certifications.map((c, order) => ({
							clientKey: `import-cert-${uuid()}`,
							order: order + 1,
							content: {
								title: c.title,
								organismeCertification:
									c.organismeCertification ?? "",
								settings: certification.settings.content,
							},
						})),
					},
				}
			: {}),
		...(socialMedia
			? {
					socialMedia: {
						title: socialMedia.title,
						settings: { title: socialMedia.settings.title },
						content: draft.socialMedias.map((s, order) => ({
							clientKey: `import-social-${uuid()}`,
							order: order + 1,
							content: {
								socialNetwork: s.network ?? s.url ?? undefined,
								username: s.username ?? s.url ?? "",
								icon: "",
								settings: socialMedia.settings.content,
							},
						})),
					},
				}
			: {}),
		...(description
			? {
					description: {
						title: description.title,
						settings: {
							title: description.settings.title,
							content: description.settings.content.description,
						},
						content: {
							description: draft.description ?? "",
						},
					},
				}
			: {}),
	};
}

/** Applique le draft sur un CvFormValues existant (template déjà posé). */
export function applyImportDraftToForm(
	current: CvFormValues,
	draft: CvImportDraft,
	model: TemplateCv,
): CvFormValues {
	const next = structuredClone(current);
	const firstName = draft.identity?.firstName?.trim() || "";
	const lastName = draft.identity?.lastName?.trim() || "";
	const fullName = [firstName, lastName].filter(Boolean).join(" ");
	if (fullName) {
		next.title = `CV - ${fullName}`;
	}
	next.datas = {
		...next.datas,
		...mapImportDraftToCvDatas(draft, model),
	};
	return next;
}
