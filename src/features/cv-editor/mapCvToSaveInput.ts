// src/features/cv-editor/mapCvToSaveInput.ts
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/api/root";
import type { CvSaveInput, CvFormValues } from "../../services/schemas/cvSave.schema";
import {
	educationContentSchema,
	experienceContentSchema,
	languageContentSchema,
	// philosophyContentSchema,
	projectContentSchema,
	socialMediaContentSchema,
	strengthContentSchema,
	statContentSchema,
	formationContentSchema,
	certificationContentSchema,
	prizeContentSchema,
	passionContentSchema,
	expertiseContentSchema,
	volunteeringContentSchema,
	publicationContentSchema,
	achievementContentSchema,
	tagContentSchema,
	competenceContentSchema,
	skillContentSchema,
} from "../../services/schemas/cvTemplate.schema";
import type { JsonValueType } from "@/services/schemas/cvModule.schema";
import { dateToStringMonthYear } from "../../utils/date";

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type CvFull = RouterOutputs["cv"]["byId"];
type ExperienceSettings = NonNullable<NonNullable<CvSaveInput["datas"]["experience"]>["settings"]>;
type EducationSettings = NonNullable<NonNullable<CvSaveInput["datas"]["education"]>["settings"]>;
type SkillGroupSettings = NonNullable<NonNullable<CvSaveInput["datas"]["skillGroup"]>["settings"]>;
type LanguageSettings = NonNullable<NonNullable<CvSaveInput["datas"]["language"]>["settings"]>;
type ProjectSettings = NonNullable<NonNullable<CvSaveInput["datas"]["project"]>["settings"]>;
type SocialMediaSettings = NonNullable<
	NonNullable<CvSaveInput["datas"]["socialMedia"]>["settings"]
>;
type StrengthSettings = NonNullable<NonNullable<CvSaveInput["datas"]["strength"]>["settings"]>;
type StatSettings = NonNullable<NonNullable<CvSaveInput["datas"]["stat"]>["settings"]>;
type PhilosophySettings = NonNullable<NonNullable<CvSaveInput["datas"]["philosophy"]>["settings"]>;
type FormationSettings = NonNullable<NonNullable<CvSaveInput["datas"]["formation"]>["settings"]>;
type CertificationSettings = NonNullable<
	NonNullable<CvSaveInput["datas"]["certification"]>["settings"]
>;
type PrizeSettings = NonNullable<NonNullable<CvSaveInput["datas"]["prize"]>["settings"]>;
type PassionSettings = NonNullable<NonNullable<CvSaveInput["datas"]["passion"]>["settings"]>;
type ExpertiseSettings = NonNullable<NonNullable<CvSaveInput["datas"]["expertise"]>["settings"]>;
type VolunteeringSettings = NonNullable<
	NonNullable<CvSaveInput["datas"]["volunteering"]>["settings"]
>;
type PublicationSettings = NonNullable<
	NonNullable<CvSaveInput["datas"]["publication"]>["settings"]
>;
type AchievementSettings = NonNullable<
	NonNullable<CvSaveInput["datas"]["achievement"]>["settings"]
>;
type CompetenceGroupSettings = NonNullable<
	NonNullable<CvSaveInput["datas"]["competenceGroup"]>["settings"]
>;
type TagGroupSettings = NonNullable<NonNullable<CvSaveInput["datas"]["tagGroup"]>["settings"]>;

const defaultTitleSettings: ExperienceSettings["title"] = {
	sizeModel: "18px",
	weightModel: 600,
	colorSelect: "black",
	sizeSelect: "md",
	weightSelect: "md",
	withPrimaryColor: false,
	textAlign: "left",
};

function asDate(value: unknown): Date {
	if (value instanceof Date) return value;
	return new Date(value as string);
}

function withFallback(value: string | undefined, fallback: string) {
	const t = value?.trim();
	return t ? t : fallback;
}

function deriveCvTitle(cv: CvFormValues): string {
	const prenom = cv.datas?.header?.prenom?.trim() ?? "";
	const nom = cv.datas?.header?.nom?.trim() ?? "";
	if (prenom && nom) return `CV - ${prenom} ${nom}`;
	return withFallback(cv.title, "Mon CV");
}

export function mapFormToSaveInput(cv: CvFormValues): CvSaveInput {
	const title = deriveCvTitle(cv);
	return {
		...cv,
		title,
		cvId: cv.cvId && cv.cvId !== "0" ? cv.cvId : undefined,
		modules: cv.modules?.map((m) =>
			m.type === "description"
				? { ...m, title: cv.datas?.description?.title ?? m.title }
				: m.type === "experience"
					? { ...m, title: cv.datas?.experience?.title ?? m.title }
					: m.type === "education"
						? { ...m, title: cv.datas?.education?.title ?? m.title }
						: m.type === "skill"
							? { ...m, title: cv.datas?.skillGroup?.title ?? m.title }
							: m.type === "language"
								? { ...m, title: cv.datas?.language?.title ?? m.title }
								: m.type === "project"
									? { ...m, title: cv.datas?.project?.title ?? m.title }
									: m.type === "volunteering"
										? { ...m, title: cv.datas?.volunteering?.title ?? m.title }
										: m.type === "formation"
											? { ...m, title: cv.datas?.formation?.title ?? m.title }
											: m.type === "certification"
												? { ...m, title: cv.datas?.certification?.title ?? m.title }
												: m.type === "prize"
													? { ...m, title: cv.datas?.prize?.title ?? m.title }
													: m.type === "expertise"
														? { ...m, title: cv.datas?.expertise?.title ?? m.title }
														: m.type === "socialMedia"
															? { ...m, title: cv.datas?.socialMedia?.title ?? m.title }
															: m.type === "strength"
																? { ...m, title: cv.datas?.strength?.title ?? m.title }
																: m.type === "stat"
																	? { ...m, title: cv.datas?.stat?.title ?? m.title }
																: m.type === "philosophy"
																	? { ...m, title: cv.datas?.philosophy?.title ?? m.title }
																	: m.type === "passion"
																		? { ...m, title: cv.datas?.passion?.title ?? m.title }
																		: m.type === "competence"
																			? { ...m, title: cv.datas?.competenceGroup?.title ?? m.title }
																			: m.type === "tag"
																				? { ...m, title: cv.datas?.tagGroup?.title ?? m.title }
																				: m.type === "publication"
																					? { ...m, title: cv.datas?.publication?.title ?? m.title }
																					: m.type === "achievement"
																						? {
																								...m,
																								title: cv.datas?.achievement?.title ?? m.title,
																							}
																						: m,
		),
		datas: {
			...cv.datas,
			header: cv.datas?.header
				? {
						...cv.datas.header,
						title: withFallback(cv.datas.header.title, title),
					}
				: undefined,
			experience: cv.datas?.experience
				? {
						...cv.datas.experience,
						content: cv.datas.experience.content
							.filter((item) => item.content.title.trim() || item.content.company.trim())
							.map((item) => ({
								...item,
								content: {
									...item.content,
									title: withFallback(item.content.title, "Intitulé"),
									company: withFallback(item.content.company, "Entreprise"),
									start: asDate(item.content.start),
									end: item.content.end ? asDate(item.content.end) : null,
									missions: (item.content.missions ?? []).filter(
										(m) => m.content.content.trim().length > 0,
									),
								},
							})),
					}
				: undefined,
			project: cv.datas?.project
				? {
						...cv.datas.project,
						content: cv.datas.project.content
							.filter((item) => item.content.title.trim())
							.map((item) => ({
								...item,
								content: {
									...item.content,
									title: withFallback(item.content.title, "Intitulé"),
									start: asDate(item.content.start),
									end: item.content.end ? asDate(item.content.end) : null,
									missions: (item.content.missions ?? []).filter(
										(m) => m.content.content.trim().length > 0,
									),
								},
							})),
					}
				: undefined,
			volunteering: cv.datas?.volunteering
				? {
						...cv.datas.volunteering,
						content: cv.datas.volunteering.content
							.filter((item) => item.content.title.trim() || item.content.organisation.trim())
							.map((item) => ({
								...item,
								content: {
									...item.content,
									title: withFallback(item.content.title, "Intitulé"),
									organisation: withFallback(item.content.organisation, "Organisation"),
									start: asDate(item.content.start),
									end: item.content.end ? asDate(item.content.end) : null,
									missions: (item.content.missions ?? []).filter(
										(m) => m.content.content.trim().length > 0,
									),
								},
							})),
					}
				: undefined,
			education: cv.datas?.education
				? {
						...cv.datas.education,
						content: cv.datas.education.content
							.filter((item) => item.content.school.trim())
							.map((item) => ({
								...item,
								content: {
									...item.content,
									school: withFallback(item.content.school, "Établissement"),
									start: asDate(item.content.start),
									end: item.content.end ? asDate(item.content.end) : null,
								},
							})),
					}
				: undefined,
			formation: cv.datas?.formation
				? {
						...cv.datas.formation,
						content: cv.datas.formation.content
							.filter((item) => item.content.title.trim())
							.map((item) => ({
								...item,
								content: {
									...item.content,
									title: withFallback(item.content.title, "Intitulé"),
									start: asDate(item.content.start),
									end: item.content.end ? asDate(item.content.end) : undefined,
								},
							})),
					}
				: undefined,
			philosophy: cv.datas?.philosophy?.content?.citation?.trim() ? cv.datas.philosophy : undefined,
			certification: cv.datas?.certification
				? {
						...cv.datas.certification,
						content: cv.datas.certification.content
							.filter((item) => item.content.title.trim())
							.map((item) => ({
								...item,
								content: {
									...item.content,
									title: withFallback(item.content.title, "Intitulé"),
								},
							})),
					}
				: undefined,
			achievement: cv.datas?.achievement
				? {
						...cv.datas.achievement,
						content: cv.datas.achievement.content
							.filter((item) => item.content.title.trim())
							.map((item) => ({
								...item,
								content: {
									...item.content,
									title: withFallback(item.content.title, "Intitulé"),
								},
							})),
					}
				: undefined,
			expertise: cv.datas?.expertise
				? {
						...cv.datas.expertise,
						content: cv.datas.expertise.content
							.filter((item) => item.content.title.trim())
							.map((item) => ({
								...item,
								content: {
									...item.content,
									title: withFallback(item.content.title, "Intitulé"),
								},
							})),
					}
				: undefined,
			language: cv.datas?.language
				? {
						...cv.datas.language,
						content: cv.datas.language.content
							.filter((item) => item.content.name.trim())
							.map((item) => ({
								...item,
								content: {
									...item.content,
									name: withFallback(item.content.name, "Langue"),
								},
							})),
					}
				: undefined,
			passion: cv.datas?.passion
				? {
						...cv.datas.passion,
						content: cv.datas.passion.content
							.filter((item) => item.content.title.trim())
							.map((item) => ({
								...item,
								content: {
									...item.content,
									title: withFallback(item.content.title, "Intitulé"),
									icon: withFallback(item.content.icon, "BsBalloonHeartFill"),
								},
							})),
					}
				: undefined,
			prize: cv.datas?.prize
				? {
						...cv.datas.prize,
						content: cv.datas.prize.content
							.filter((item) => item.content.title.trim())
							.map((item) => ({
								...item,
								content: {
									...item.content,
									title: withFallback(item.content.title, "Intitulé"),
									domaine: item.content.domaine ?? "",
								},
							})),
					}
				: undefined,
			publication: cv.datas?.publication
				? {
						...cv.datas.publication,
						content: cv.datas.publication.content
							.filter((item) => item.content.title.trim())
							.map((item) => ({
								...item,
								content: {
									...item.content,
									title: withFallback(item.content.title, "Intitulé"),
									start: asDate(item.content.start),
									end: item.content.end ? asDate(item.content.end) : undefined,
								},
							})),
					}
				: undefined,
			socialMedia: cv.datas?.socialMedia
				? {
						...cv.datas.socialMedia,
						content: cv.datas.socialMedia.content
							.filter(
								(item) => item.content.username.trim() || (item.content.socialNetwork ?? "").trim(),
							)
							.map((item) => ({
								...item,
								content: {
									...item.content,
									username: withFallback(item.content.username, "Utilisateur"),
									icon: item.content.icon ?? "",
								},
							})),
					}
				: undefined,
			strength: cv.datas?.strength
				? {
						...cv.datas.strength,
						content: cv.datas.strength.content
							.filter((item) => item.content.title.trim())
							.map((item) => ({
								...item,
								content: {
									...item.content,
									title: withFallback(item.content.title, "Intitulé"),
								},
							})),
					}
				: undefined,
			stat: cv.datas?.stat
				? {
						...cv.datas.stat,
						content: cv.datas.stat.content
							.filter(
								(item) => item.content.label.trim() && item.content.value.trim(),
							)
							.map((item) => ({
								...item,
								content: {
									...item.content,
									label: withFallback(item.content.label, "Libellé"),
									value: withFallback(item.content.value, "0"),
								},
							})),
					}
				: undefined,
			description: cv.datas?.description?.content?.description?.trim()
				? cv.datas.description
				: undefined,
			skillGroup: cv.datas?.skillGroup
				? {
						...cv.datas.skillGroup,
						content: cv.datas.skillGroup.content
							.map((group) => ({
								...group,
								content: {
									...group.content,
									skills: (group.content.skills ?? []).filter(
										(s) => (s.content.name ?? "").trim().length > 0 || !!s.content.skillId,
									),
								},
							}))
							.filter(
								(group) =>
									(group.content.title ?? "").trim().length > 0 ||
									(group.content.skills?.length ?? 0) > 0,
							),
					}
				: undefined,
			competenceGroup: cv.datas?.competenceGroup
				? {
						...cv.datas.competenceGroup,
						content: cv.datas.competenceGroup.content
							.map((group) => ({
								...group,
								content: {
									...group.content,
									competences: (group.content.competences ?? []).filter(
										(c) => (c.content.name ?? "").trim().length > 0 || !!c.content.competenceId,
									),
								},
							}))
							.filter(
								(group) =>
									(group.content.title ?? "").trim().length > 0 ||
									(group.content.competences?.length ?? 0) > 0,
							),
					}
				: undefined,
			tagGroup: cv.datas?.tagGroup
				? {
						...cv.datas.tagGroup,
						content: cv.datas.tagGroup.content
							.map((group) => ({
								...group,
								content: {
									...group.content,
									tags: (group.content.tags ?? []).filter(
										(t) => (t.content.name ?? "").trim().length > 0 || !!t.content.tagId,
									),
								},
							}))
							.filter(
								(group) =>
									(group.content.title ?? "").trim().length > 0 ||
									(group.content.tags?.length ?? 0) > 0,
							),
					}
				: undefined,
		},
	} as CvSaveInput;
}

export function mapCvToSaveInput(cv: CvFull): CvSaveInput {
	const experienceModule = cv.modules.find((m) => m.type === "experience");
	const descriptionModule = cv.modules.find((m) => m.type === "description");
	const educationModule = cv.modules.find((m) => m.type === "education");
	const skillModule = cv.modules.find((m) => m.type === "skill");
	const languageModule = cv.modules.find((m) => m.type === "language");
	const projectModule = cv.modules.find((m) => m.type === "project");
	const socialMediaModule = cv.modules.find((m) => m.type === "socialMedia");
	const strengthModule = cv.modules.find((m) => m.type === "strength");
	const statModule = cv.modules.find((m) => m.type === "stat");
	const philosophyModule = cv.modules.find((m) => m.type === "philosophy");
	const formationModule = cv.modules.find((m) => m.type === "formation");
	const certificationModule = cv.modules.find((m) => m.type === "certification");
	const prizeModule = cv.modules.find((m) => m.type === "prize");
	const passionModule = cv.modules.find((m) => m.type === "passion");
	const expertiseModule = cv.modules.find((m) => m.type === "expertise");
	const volunteeringModule = cv.modules.find((m) => m.type === "volunteering");
	const publicationModule = cv.modules.find((m) => m.type === "publication");
	const achievementModule = cv.modules.find((m) => m.type === "achievement");
	const competenceModule = cv.modules.find((m) => m.type === "competence");
	const tagModule = cv.modules.find((m) => m.type === "tag");

	return {
		cvId: cv.id,
		templateId: cv.templateId,
		title: cv.title,
		...(cv.photo !== undefined ? { photo: cv.photo } : {}),
		...(cv.layoutGeneral != null && Object.keys(cv.layoutGeneral as object).length > 0
			? {
					layoutGeneral: cv.layoutGeneral as NonNullable<CvSaveInput["layoutGeneral"]>,
				}
			: {}),
		datas: {
			...(cv.headerCv
				? {
						header: {
							id: cv.headerCv.id,
							title: cv.headerCv.title,
							...(cv.headerCv.subtitle != null ? { subtitle: cv.headerCv.subtitle } : {}),
							...(cv.headerCv.phone != null ? { phone: cv.headerCv.phone } : {}),
							...(cv.headerCv.email != null ? { email: cv.headerCv.email } : {}),
							...(cv.headerCv.location != null ? { location: cv.headerCv.location } : {}),
							...(cv.headerCv.portfolio != null ? { portfolio: cv.headerCv.portfolio } : {}),
							...(cv.headerCv.nom != null ? { nom: cv.headerCv.nom } : {}),
							...(cv.headerCv.prenom != null ? { prenom: cv.headerCv.prenom } : {}),
							drivingLicenses: cv.headerCv.drivingLicenses ?? [],
							hasVehicle: cv.headerCv.hasVehicle ?? false,
							...(cv.headerCv.settings != null
								? {
										settings: cv.headerCv.settings as NonNullable<
											CvSaveInput["datas"]["header"]
										>["settings"],
									}
								: {}),
						},
					}
				: {}),
			...(cv.description
				? {
						description: {
							id: cv.description.id,
							title: descriptionModule?.title ?? undefined,
							content: { description: cv.description.description },
							settings: {
								title:
									(
										descriptionModule?.settings as {
											title?: typeof defaultTitleSettings;
										} | null
									)?.title ?? defaultTitleSettings,
								content:
									(
										descriptionModule?.settings as {
											content?: { description?: typeof defaultTitleSettings };
										} | null
									)?.content?.description ?? defaultTitleSettings,
							},
						},
					}
				: {}),
			experience: {
				title: experienceModule?.title ?? undefined,
				content: [...cv.experiences]
					.sort((a, b) => a.order - b.order)
					.map((exp) => ({
						id: exp.id,
						clientKey: exp.id,
						order: exp.order,
						content: {
							title: exp.title,
							company: exp.company,
							start: exp.start,
							...(exp.end !== undefined ? { end: exp.end } : {}),
							periode: [
								exp.start ? `De ${dateToStringMonthYear(exp.start)}` : null,
								exp.end ? `à ${dateToStringMonthYear(exp.end)}` : null,
							]
								.filter(Boolean)
								.join(" "),
							...(exp.location != null ? { location: exp.location } : {}),
							...(exp.description != null ? { description: exp.description } : {}),
							settings: experienceContentSchema.safeParse({
								...((experienceModule?.settings as { content?: object } | null)?.content ?? {}),
								...(exp.settings && typeof exp.settings === "object" ? exp.settings : {}),
							}).data,
							missions: [...exp.cvMissions]
								.sort((a, b) => a.order - b.order)
								.map((m) => ({
									id: m.id,
									clientKey: m.id,
									order: m.order,
									content: { content: m.content },
								})),
						},
					})),
				settings: {
					title:
						(
							experienceModule?.settings as {
								title?: ExperienceSettings["title"];
							} | null
						)?.title ?? defaultTitleSettings,
				},
			},
			project: {
				title: projectModule?.title ?? undefined,
				content: [...cv.projects]
					.sort((a, b) => a.order - b.order)
					.map((project) => ({
						id: project.id,
						clientKey: project.id,
						order: project.order,
						content: {
							title: project.title,
							start: project.start,
							...(project.end !== undefined ? { end: project.end } : {}),
							periode: [
								project.start ? `De ${dateToStringMonthYear(project.start)}` : null,
								project.end ? `à ${dateToStringMonthYear(project.end)}` : null,
							]
								.filter(Boolean)
								.join(" "),
							...(project.location != null ? { location: project.location } : {}),
							...(project.description != null ? { description: project.description } : {}),
							...(project.result != null ? { result: project.result } : {}),
							...(project.technology != null ? { technology: project.technology } : {}),
							...(project.status != null ? { status: project.status } : {}),
							missions: [...project.cvMissions]
								.sort((a, b) => a.order - b.order)
								.map((m) => ({
									id: m.id,
									clientKey: m.id,
									order: m.order,
									content: { content: m.content },
								})),
							settings: projectContentSchema.safeParse({
								...((projectModule?.settings as { content?: object } | null)?.content ?? {}),
								...(project.settings && typeof project.settings === "object"
									? project.settings
									: {}),
							}).data,
						},
					})),
				settings: {
					title:
						(
							projectModule?.settings as {
								title?: ProjectSettings["title"];
							} | null
						)?.title ?? defaultTitleSettings,
				},
			},
			volunteering: {
				title: volunteeringModule?.title ?? undefined,
				content: [...cv.volunteerings]
					.sort((a, b) => a.order - b.order)
					.map((volunteering) => ({
						id: volunteering.id,
						clientKey: volunteering.id,
						order: volunteering.order,
						content: {
							title: volunteering.title,
							organisation: volunteering.organisation,
							start: volunteering.start,
							...(volunteering.end !== undefined ? { end: volunteering.end } : {}),
							periode: [
								volunteering.start ? `De ${dateToStringMonthYear(volunteering.start)}` : null,
								volunteering.end ? `à ${dateToStringMonthYear(volunteering.end)}` : null,
							]
								.filter(Boolean)
								.join(" "),
							...(volunteering.location != null ? { location: volunteering.location } : {}),
							...(volunteering.description != null
								? { description: volunteering.description }
								: {}),
							settings: volunteeringContentSchema.safeParse({
								...((volunteeringModule?.settings as { content?: object } | null)?.content ?? {}),
								...(volunteering.settings && typeof volunteering.settings === "object"
									? volunteering.settings
									: {}),
							}).data,
							missions: [...volunteering.cvMissions]
								.sort((a, b) => a.order - b.order)
								.map((m) => ({
									id: m.id,
									clientKey: m.id,
									order: m.order,
									content: { content: m.content },
								})),
						},
					})),
				settings: {
					title:
						(
							volunteeringModule?.settings as {
								title?: VolunteeringSettings["title"];
							} | null
						)?.title ?? defaultTitleSettings,
				},
			},
			formation: {
				title: formationModule?.title ?? undefined,
				content: [...cv.formations]
					.sort((a, b) => a.order - b.order)
					.map((formation) => ({
						id: formation.id,
						clientKey: formation.id,
						order: formation.order,
						content: {
							title: formation.title,
							start: formation.start,
							...(formation.organismeFormation != null
								? { organismeFormation: formation.organismeFormation }
								: {}),
							...(formation.end !== undefined ? { end: formation.end } : {}),
							...(formation.status != null ? { status: formation.status } : {}),
							settings: formationContentSchema.safeParse({
								...((formationModule?.settings as { content?: object } | null)?.content ?? {}),
								...(formation.settings && typeof formation.settings === "object"
									? formation.settings
									: {}),
							}).data,
						},
					})),
				settings: {
					title:
						(
							formationModule?.settings as {
								title?: FormationSettings["title"];
							} | null
						)?.title ?? defaultTitleSettings,
				},
			},
			certification: {
				title: certificationModule?.title ?? undefined,
				content: [...cv.certifications]
					.sort((a, b) => a.order - b.order)
					.map((certification) => ({
						id: certification.id,
						clientKey: certification.id,
						order: certification.order,
						content: {
							title: certification.title,
							organismeCertification: certification.organismeCertification ?? "",
							settings: certificationContentSchema.safeParse({
								...((certificationModule?.settings as { content?: object } | null)?.content ?? {}),
								...(certification.settings && typeof certification.settings === "object"
									? certification.settings
									: {}),
							}).data,
						},
					})),
				settings: {
					title:
						(
							certificationModule?.settings as {
								title?: CertificationSettings["title"];
							} | null
						)?.title ?? defaultTitleSettings,
				},
			},
			prize: {
				title: prizeModule?.title ?? undefined,
				content: [...cv.prizes]
					.sort((a, b) => a.order - b.order)
					.map((prize) => ({
						id: prize.id,
						clientKey: prize.id,
						order: prize.order,
						content: {
							title: prize.title,
							domaine: prize.domaine ?? "",
							icon: prize.icon ?? undefined,
							settings: prizeContentSchema.safeParse({
								...((prizeModule?.settings as { content?: object } | null)?.content ?? {}),
								...(prize.settings && typeof prize.settings === "object" ? prize.settings : {}),
							}).data,
						},
					})),
				settings: {
					title:
						(
							prizeModule?.settings as {
								title?: PrizeSettings["title"];
							} | null
						)?.title ?? defaultTitleSettings,
				},
			},
			expertise: {
				title: expertiseModule?.title ?? undefined,
				content: [...cv.expertises]
					.sort((a, b) => a.order - b.order)
					.map((expertise) => ({
						id: expertise.id,
						clientKey: expertise.id,
						order: expertise.order,
						content: {
							title: expertise.title,
							level: expertise.level,
							settings: expertiseContentSchema.safeParse({
								...((expertiseModule?.settings as { content?: object } | null)?.content ?? {}),
								...(expertise.settings && typeof expertise.settings === "object"
									? expertise.settings
									: {}),
							}).data,
						},
					})),
				settings: {
					title:
						(
							expertiseModule?.settings as {
								title?: ExpertiseSettings["title"];
							} | null
						)?.title ?? defaultTitleSettings,
				},
			},
			...(cv.philosophy
				? {
						philosophy: {
							id: cv.philosophy.id,
							title: philosophyModule?.title ?? undefined,
							content: {
								citation: cv.philosophy.citation,
								author: cv.philosophy.author ?? undefined,
								...(cv.philosophy.settings != null
									? {
											settings: cv.philosophy.settings as Record<string, boolean>,
										}
									: {}),
							},
							settings: {
								title:
									(
										philosophyModule?.settings as {
											title?: PhilosophySettings["title"];
										} | null
									)?.title ?? defaultTitleSettings,
								content: (philosophyModule?.settings as PhilosophySettings | null)?.content ?? {
									citation: defaultTitleSettings,
									author: defaultTitleSettings,
									withAuthor: true,
								},
							},
						},
					}
				: {}),
			socialMedia: {
				title: socialMediaModule?.title ?? undefined,
				content: [...cv.socialMedias]
					.sort((a, b) => a.order - b.order)
					.map((socialMedia) => ({
						id: socialMedia.id,
						clientKey: socialMedia.id,
						order: socialMedia.order,
						content: {
							socialNetwork: socialMedia.socialNetwork ?? undefined,
							username: socialMedia.username,
							icon: socialMedia.icon,
							settings: socialMediaContentSchema.safeParse({
								...((socialMediaModule?.settings as { content?: object } | null)?.content ?? {}),
								...(socialMedia.settings && typeof socialMedia.settings === "object"
									? socialMedia.settings
									: {}),
							}).data,
						},
					})),
				settings: {
					title:
						(
							socialMediaModule?.settings as {
								title?: SocialMediaSettings["title"];
							} | null
						)?.title ?? defaultTitleSettings,
				},
			},
			passion: {
				title: passionModule?.title ?? undefined,
				content: [...cv.passions]
					.sort((a, b) => a.order - b.order)
					.map((passion) => ({
						id: passion.id,
						clientKey: passion.id,
						order: passion.order,
						content: {
							title: passion.title,
							icon: passion.icon,
							settings: passionContentSchema.safeParse({
								...((passionModule?.settings as { content?: object } | null)?.content ?? {}),
								...(passion.settings && typeof passion.settings === "object"
									? passion.settings
									: {}),
							}).data,
						},
					})),
				settings: {
					title:
						(
							passionModule?.settings as {
								title?: PassionSettings["title"];
							} | null
						)?.title ?? defaultTitleSettings,
				},
			},
			language: {
				title: languageModule?.title ?? undefined,
				content: [...cv.languages]
					.sort((a, b) => a.order - b.order)
					.map((language) => ({
						id: language.id,
						clientKey: language.id,
						order: language.order,
						content: {
							name: language.name,
							level: language.level,
							settings: languageContentSchema.safeParse({
								...((languageModule?.settings as { content?: object } | null)?.content ?? {}),
								...(language.settings && typeof language.settings === "object"
									? language.settings
									: {}),
							}).data,
						},
					})),
				settings: {
					title:
						(
							languageModule?.settings as {
								title?: LanguageSettings["title"];
							} | null
						)?.title ?? defaultTitleSettings,
				},
			},
			publication: {
				title: publicationModule?.title ?? undefined,
				content: [...cv.publications]
					.sort((a, b) => a.order - b.order)
					.map((publication) => ({
						id: publication.id,
						clientKey: publication.id,
						order: publication.order,
						content: {
							title: publication.title,
							start: publication.start,
							...(publication.end !== undefined ? { end: publication.end } : {}),
							...(publication.journalName != null ? { journalName: publication.journalName } : {}),
							...(publication.description != null ? { description: publication.description } : {}),
							...(publication.url != null ? { url: publication.url } : {}),
							settings: publicationContentSchema.safeParse({
								...((publicationModule?.settings as { content?: object } | null)?.content ?? {}),
								...(publication.settings && typeof publication.settings === "object"
									? publication.settings
									: {}),
							}).data,
						},
					})),
				settings: {
					title:
						(
							publicationModule?.settings as {
								title?: PublicationSettings["title"];
							} | null
						)?.title ?? defaultTitleSettings,
				},
			},
			strength: {
				title: strengthModule?.title ?? undefined,
				content: [...cv.strengths]
					.sort((a, b) => a.order - b.order)
					.map((strength) => ({
						id: strength.id,
						clientKey: strength.id,
						order: strength.order,
						content: {
							title: strength.title,
							icon: strength.icon ?? undefined,
							description: strength.description ?? undefined,
							settings: strengthContentSchema.safeParse({
								...((strengthModule?.settings as { content?: object } | null)?.content ?? {}),
								...(strength.settings && typeof strength.settings === "object"
									? strength.settings
									: {}),
							}).data,
						},
					})),
				settings: {
					title:
						(
							strengthModule?.settings as {
								title?: StrengthSettings["title"];
							} | null
						)?.title ?? defaultTitleSettings,
				},
			},
			stat: {
				title: statModule?.title ?? undefined,
				content: [...(cv.stats ?? [])]
					.sort((a, b) => a.order - b.order)
					.map((stat) => ({
						id: stat.id,
						clientKey: stat.id,
						order: stat.order,
						content: {
							label: stat.label,
							value: stat.value,
							settings: statContentSchema.safeParse({
								...((statModule?.settings as { content?: object } | null)?.content ?? {}),
								...(stat.settings && typeof stat.settings === "object" ? stat.settings : {}),
							}).data,
						},
					})),
				settings: {
					title:
						(
							statModule?.settings as {
								title?: StatSettings["title"];
							} | null
						)?.title ?? defaultTitleSettings,
				},
			},
			achievement: {
				title: achievementModule?.title ?? undefined,
				content: [...cv.achievements]
					.sort((a, b) => a.order - b.order)
					.map((achievement) => ({
						id: achievement.id,
						clientKey: achievement.id,
						order: achievement.order,
						content: {
							title: achievement.title,
							description: achievement.description ?? undefined,
							settings: achievementContentSchema.safeParse({
								...((achievementModule?.settings as { content?: object } | null)?.content ?? {}),
								...(achievement.settings && typeof achievement.settings === "object"
									? achievement.settings
									: {}),
							}).data,
						},
					})),
				settings: {
					title:
						(
							achievementModule?.settings as {
								title?: AchievementSettings["title"];
							} | null
						)?.title ?? defaultTitleSettings,
				},
			},
			education: {
				title: educationModule?.title ?? undefined,
				content: [...cv.educations]
					.sort((a, b) => a.order - b.order)
					.map((education) => ({
						id: education.id,
						clientKey: education.id,
						order: education.order,
						content: {
							title: education.title ?? "",
							school: education.school,
							degree: education.degree,
							city: education.city ?? undefined,
							start: education.start,
							end: education.end ?? undefined,
							obtained: education.obtained ?? undefined,
							year: education.end
								? String(new Date(education.end).getFullYear())
								: education.start
									? String(new Date(education.start).getFullYear())
									: "",
							settings: educationContentSchema.safeParse({
								...((educationModule?.settings as { content?: object } | null)?.content ?? {}),
								...(education.settings && typeof education.settings === "object"
									? education.settings
									: {}),
							}).data,
						},
					})),
				settings: {
					title:
						(
							educationModule?.settings as {
								title?: EducationSettings["title"];
							} | null
						)?.title ?? defaultTitleSettings,
				},
			},
			skillGroup: {
				title: skillModule?.title ?? undefined,
				content: [...cv.skillGroups]
					.sort((a, b) => a.order - b.order)
					.map((g) => ({
						id: g.id,
						clientKey: g.id,
						order: g.order,
						content: {
							title: g.title ?? "",
							settings: skillContentSchema.safeParse({
								...((skillModule?.settings as { content?: object } | null)?.content ?? {}),
								...(g.settings && typeof g.settings === "object" ? g.settings : {}),
							}).data,
							skills: [...g.skills] // ou g.skills selon l'include findById
								.sort((a, b) => a.order - b.order)
								.map((s) => ({
									id: s.id,
									clientKey: s.id,
									order: s.order,
									content: {
										name: s.skill.name,
										skillId: s.skillId,
										level: s.level,
									},
								})),
						},
					})),
				settings: {
					title:
						(
							skillModule?.settings as {
								title?: SkillGroupSettings["title"];
							} | null
						)?.title ?? defaultTitleSettings,
				},
			},
			competenceGroup: {
				title: competenceModule?.title ?? undefined,
				content: [...cv.competences]
					.sort((a, b) => a.order - b.order)
					.map((g) => ({
						id: g.id,
						clientKey: g.id,
						order: g.order,
						content: {
							title: g.title ?? "",
							settings: competenceContentSchema.safeParse({
								...((competenceModule?.settings as { content?: object } | null)?.content ?? {}),
								...(g.settings && typeof g.settings === "object" ? g.settings : {}),
							}).data,
							competences: [...g.cvCompetences]
								.sort((a, b) => a.order - b.order)
								.map((c) => ({
									id: c.id,
									clientKey: c.id,
									order: c.order,
									content: {
										competenceId: c.competenceId,
										name: c.competence.name,
									},
								})),
						},
					})),
				settings: {
					title:
						(
							competenceModule?.settings as {
								title?: CompetenceGroupSettings["title"];
							} | null
						)?.title ?? defaultTitleSettings,
				},
			},
			tagGroup: {
				title: tagModule?.title ?? undefined,
				content: [...cv.tagGroups]
					.sort((a, b) => a.order - b.order)
					.map((g) => ({
						id: g.id,
						clientKey: g.id,
						order: g.order,
						content: {
							title: g.title ?? "",
							settings: tagContentSchema.safeParse({
								...((tagModule?.settings as { content?: object } | null)?.content ?? {}),
								...(g.settings && typeof g.settings === "object" ? g.settings : {}),
							}).data,
							tags: [...g.tags]
								.sort((a, b) => a.order - b.order)
								.map((t) => ({
									id: t.id,
									clientKey: t.id,
									order: t.order,
									content: {
										tagId: t.tagId,
										name: t.tag.name,
									},
								})),
						},
					})),
				settings: {
					title:
						(
							tagModule?.settings as {
								title?: TagGroupSettings["title"];
							} | null
						)?.title ?? defaultTitleSettings,
				},
			},
		},
		modules: [...cv.modules]
			.sort((a, b) => a.order - b.order)
			.map((m) => ({
				id: m.id,
				type: m.type,
				order: m.order,
				column: m.column,
				isActive: m.isActive,
				...(m.title != null ? { title: m.title } : {}),
				settings: (m.settings ?? {}) as JsonValueType,
			})),
	};
}
