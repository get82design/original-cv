import type { CvFormValues } from "@/services/schemas/cvSave.schema";
import {
	templateDefaultStylesSchema,
	templateStructureSchema,
} from "@/services/schemas/cvTemplate.schema";
import type { TemplateCv } from "@utils/trpc.types";
import {
	loadTemplateSnapshot,
	saveTemplateSnapshot,
	type TemplateDatasSettingsSnapshot,
	type TemplateSnapshot,
} from "./templateCache";

type CvDatas = NonNullable<CvFormValues["datas"]>;

export function applyTemplateToForm(
	current: CvFormValues,
	model: TemplateCv,
	options?: { updateModules?: boolean; resetSectionStyles?: boolean },
): CvFormValues {
	const structure = templateStructureSchema.parse(model.structure);
	const defaultStyles = templateDefaultStylesSchema.parse(model.defaultStyles);

	const experienceFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "experience" }> =>
			m.type === "experience",
	);
	const educationFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "education" }> =>
			m.type === "education",
	);
	const descriptionFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "description" }> =>
			m.type === "description",
	);
	const skillGroupFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "skill" }> => m.type === "skill",
	);
	const languageFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "language" }> => m.type === "language",
	);
	const projectFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "project" }> => m.type === "project",
	);
	const socialMediaFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "socialMedia" }> =>
			m.type === "socialMedia",
	);
	const strengthFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "strength" }> => m.type === "strength",
	);
	const statFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "stat" }> => m.type === "stat",
	);
	const philosophyFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "philosophy" }> =>
			m.type === "philosophy",
	);
	const formationFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "formation" }> =>
			m.type === "formation",
	);
	const certificationFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "certification" }> =>
			m.type === "certification",
	);
	const prizeFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "prize" }> => m.type === "prize",
	);
	const passionFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "passion" }> => m.type === "passion",
	);
	const expertiseFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "expertise" }> =>
			m.type === "expertise",
	);
	const volunteeringFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "volunteering" }> =>
			m.type === "volunteering",
	);
	const publicationFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "publication" }> =>
			m.type === "publication",
	);
	const achievementFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "achievement" }> =>
			m.type === "achievement",
	);
	const competenceGroupFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "competence" }> =>
			m.type === "competence",
	);
	const tagGroupFromModel = structure.modules.find(
		(m): m is Extract<typeof m, { type: "tag" }> => m.type === "tag",
	);
	return {
		...current,
		templateId: model.id,
		layoutGeneral: {
			layout: structure.layout,
			defaultStyles,
			// slugTemplate: defaultStyles.slugTemplate,
			// components: defaultStyles.components,
		},
		datas: {
			...current.datas,
			header: {
				...current.datas?.header,
				//   settings: current.datas?.header?.settings ?? structure.header.settings, // ← styles du template
				settings: structure.header.settings, // ← styles du template
			},
			...(experienceFromModel || current.datas?.experience
				? {
						experience: {
							title:
								current.datas?.experience?.title ?? experienceFromModel!.title,
							content: current.datas?.experience?.content ?? [],
							settings: options?.resetSectionStyles
								? {
										...current.datas?.experience?.settings,
										title: experienceFromModel!.settings.title, // defaults du nouveau template
									}
								: (current.datas?.experience?.settings ?? {
										title: experienceFromModel!.settings.title,
									}),
						},
					}
				: {}),
			...(educationFromModel || current.datas?.education
				? {
						education: {
							title:
								current.datas?.education?.title ?? educationFromModel!.title,
							content: current.datas?.education?.content ?? [],
							settings: options?.resetSectionStyles
								? {
										...current.datas?.education?.settings,
										title: educationFromModel!.settings.title, // defaults du nouveau template
									}
								: (current.datas?.education?.settings ?? {
										title: educationFromModel!.settings.title,
									}),
						},
					}
				: {}),
			...(descriptionFromModel || current.datas?.description
				? {
						description: {
							title:
								current.datas?.description?.title ??
								descriptionFromModel!.title,
							content: current.datas?.description?.content ?? {
								description: "",
							},
							settings: options?.resetSectionStyles
								? {
										...current.datas?.description?.settings,
										title: descriptionFromModel!.settings.title,
										content: descriptionFromModel!.settings.content.description,
									}
								: (current.datas?.description?.settings ?? {
										title: descriptionFromModel!.settings.title,
										content: descriptionFromModel!.settings.content.description,
									}),
						},
					}
				: {}),
			...(skillGroupFromModel || current.datas?.skillGroup
				? {
						skillGroup: {
							title:
								current.datas?.skillGroup?.title ?? skillGroupFromModel!.title,
							content: current.datas?.skillGroup?.content ?? [],
							settings: options?.resetSectionStyles
								? {
										...current.datas?.skillGroup?.settings,
										title: skillGroupFromModel!.settings.title, // defaults du nouveau template
									}
								: (current.datas?.skillGroup?.settings ?? {
										title: skillGroupFromModel!.settings.title,
									}),
						},
					}
				: {}),
			...(languageFromModel || current.datas?.language
				? {
						language: {
							title: current.datas?.language?.title ?? languageFromModel!.title,
							content: current.datas?.language?.content ?? [],
							settings: options?.resetSectionStyles
								? {
										...current.datas?.language?.settings,
										title: languageFromModel!.settings.title, // defaults du nouveau template
									}
								: (current.datas?.language?.settings ?? {
										title: languageFromModel!.settings.title,
									}),
						},
					}
				: {}),
			...(projectFromModel || current.datas?.project
				? {
						project: {
							title: current.datas?.project?.title ?? projectFromModel!.title,
							content: current.datas?.project?.content ?? [],
							settings: options?.resetSectionStyles
								? {
										...current.datas?.project?.settings,
										title: projectFromModel!.settings.title, // defaults du nouveau template
									}
								: (current.datas?.project?.settings ?? {
										title: projectFromModel!.settings.title,
									}),
						},
					}
				: {}),
			...(socialMediaFromModel || current.datas?.socialMedia
				? {
						socialMedia: {
							title:
								current.datas?.socialMedia?.title ??
								socialMediaFromModel!.title,
							content: current.datas?.socialMedia?.content ?? [],
							settings: options?.resetSectionStyles
								? {
										...current.datas?.socialMedia?.settings,
										title: socialMediaFromModel!.settings.title, // defaults du nouveau template
									}
								: (current.datas?.socialMedia?.settings ?? {
										title: socialMediaFromModel!.settings.title,
									}),
						},
					}
				: {}),
			...(strengthFromModel || current.datas?.strength
				? {
						strength: {
							title: current.datas?.strength?.title ?? strengthFromModel!.title,
							content: current.datas?.strength?.content ?? [],
							settings: options?.resetSectionStyles
								? {
										...current.datas?.strength?.settings,
										title: strengthFromModel!.settings.title, // defaults du nouveau template
									}
								: (current.datas?.strength?.settings ?? {
										title: strengthFromModel!.settings.title,
									}),
						},
					}
				: {}),
			...(statFromModel || current.datas?.stat
				? {
						stat: {
							title: current.datas?.stat?.title ?? statFromModel!.title,
							content: current.datas?.stat?.content ?? [],
							settings: options?.resetSectionStyles
								? {
										...current.datas?.stat?.settings,
										title: statFromModel!.settings.title,
									}
								: (current.datas?.stat?.settings ?? {
										title: statFromModel!.settings.title,
									}),
						},
					}
				: {}),
			...(philosophyFromModel || current.datas?.philosophy
				? {
						philosophy: {
							title:
								current.datas?.philosophy?.title ?? philosophyFromModel!.title,
							content: current.datas?.philosophy?.content ?? {
								citation: "",
								author: "",
							},
							settings: options?.resetSectionStyles
								? {
										...current.datas?.philosophy?.settings,
										title: philosophyFromModel!.settings.title,
										content: philosophyFromModel!.settings.content,
									}
								: (current.datas?.philosophy?.settings ?? {
										title: philosophyFromModel!.settings.title,
										content: philosophyFromModel!.settings.content,
									}),
						},
					}
				: {}),
			...(formationFromModel || current.datas?.formation
				? {
						formation: {
							title:
								current.datas?.formation?.title ?? formationFromModel!.title,
							content: current.datas?.formation?.content ?? [],
							settings: options?.resetSectionStyles
								? {
										...current.datas?.formation?.settings,
										title: formationFromModel!.settings.title, // defaults du nouveau template
									}
								: (current.datas?.formation?.settings ?? {
										title: formationFromModel!.settings.title,
									}),
						},
					}
				: {}),
			...(certificationFromModel || current.datas?.certification
				? {
						certification: {
							title:
								current.datas?.certification?.title ??
								certificationFromModel!.title,
							content: current.datas?.certification?.content ?? [],
							settings: options?.resetSectionStyles
								? {
										...current.datas?.certification?.settings,
										title: certificationFromModel!.settings.title, // defaults du nouveau template
									}
								: (current.datas?.certification?.settings ?? {
										title: certificationFromModel!.settings.title,
									}),
						},
					}
				: {}),
			...(prizeFromModel || current.datas?.prize
				? {
						prize: {
							title: current.datas?.prize?.title ?? prizeFromModel!.title,
							content: current.datas?.prize?.content ?? [],
							settings: options?.resetSectionStyles
								? {
										...current.datas?.prize?.settings,
										title: prizeFromModel!.settings.title, // defaults du nouveau template
									}
								: (current.datas?.prize?.settings ?? {
										title: prizeFromModel!.settings.title,
									}),
						},
					}
				: {}),
			...(passionFromModel || current.datas?.passion
				? {
						passion: {
							title: current.datas?.passion?.title ?? passionFromModel!.title,
							content: current.datas?.passion?.content ?? [],
							settings: options?.resetSectionStyles
								? {
										...current.datas?.passion?.settings,
										title: passionFromModel!.settings.title, // defaults du nouveau template
									}
								: (current.datas?.passion?.settings ?? {
										title: passionFromModel!.settings.title,
									}),
						},
					}
				: {}),
			...(expertiseFromModel || current.datas?.expertise
				? {
						expertise: {
							title:
								current.datas?.expertise?.title ?? expertiseFromModel!.title,
							content: current.datas?.expertise?.content ?? [],
							settings: options?.resetSectionStyles
								? {
										...current.datas?.expertise?.settings,
										title: expertiseFromModel!.settings.title, // defaults du nouveau template
									}
								: (current.datas?.expertise?.settings ?? {
										title: expertiseFromModel!.settings.title,
									}),
						},
					}
				: {}),
			...(volunteeringFromModel || current.datas?.volunteering
				? {
						volunteering: {
							title:
								current.datas?.volunteering?.title ??
								volunteeringFromModel!.title,
							content: current.datas?.volunteering?.content ?? [],
							settings: options?.resetSectionStyles
								? {
										...current.datas?.volunteering?.settings,
										title: volunteeringFromModel!.settings.title, // defaults du nouveau template
									}
								: (current.datas?.volunteering?.settings ?? {
										title: volunteeringFromModel!.settings.title,
									}),
						},
					}
				: {}),
			...(publicationFromModel || current.datas?.publication
				? {
						publication: {
							title:
								current.datas?.publication?.title ??
								publicationFromModel!.title,
							content: current.datas?.publication?.content ?? [],
							settings: options?.resetSectionStyles
								? {
										...current.datas?.publication?.settings,
										title: publicationFromModel!.settings.title, // defaults du nouveau template
									}
								: (current.datas?.publication?.settings ?? {
										title: publicationFromModel!.settings.title,
									}),
						},
					}
				: {}),
			...(achievementFromModel || current.datas?.achievement
				? {
						achievement: {
							title:
								current.datas?.achievement?.title ??
								achievementFromModel!.title,
							content: current.datas?.achievement?.content ?? [],
							settings: options?.resetSectionStyles
								? {
										...current.datas?.achievement?.settings,
										title: achievementFromModel!.settings.title, // defaults du nouveau template
									}
								: (current.datas?.achievement?.settings ?? {
										title: achievementFromModel!.settings.title,
									}),
						},
					}
				: {}),
			...(competenceGroupFromModel || current.datas?.competenceGroup
				? {
						competenceGroup: {
							title:
								current.datas?.competenceGroup?.title ??
								competenceGroupFromModel!.title,
							content: current.datas?.competenceGroup?.content ?? [],
							settings: options?.resetSectionStyles
								? {
										...current.datas?.competenceGroup?.settings,
										title: competenceGroupFromModel!.settings.title, // defaults du nouveau template
									}
								: (current.datas?.competenceGroup?.settings ?? {
										title: competenceGroupFromModel!.settings.title,
									}),
						},
					}
				: {}),
			...(tagGroupFromModel || current.datas?.tagGroup
				? {
						tagGroup: {
							title: current.datas?.tagGroup?.title ?? tagGroupFromModel!.title,
							content: (current.datas?.tagGroup?.content ?? []).map((group) => {
								const fromModel = tagGroupFromModel?.settings.content;
								const prev = group.content?.settings;
								return {
									...group,
									content: {
										...group.content,
										settings:
											options?.resetSectionStyles && fromModel
												? {
														groupTitle: fromModel.groupTitle,
														tags: fromModel.tags,
														withGroupTitle: fromModel.withGroupTitle,
														design: fromModel.design,
													}
												: (prev ?? {
														groupTitle: fromModel!.groupTitle,
														tags: fromModel!.tags,
														withGroupTitle: fromModel!.withGroupTitle,
														design: fromModel!.design,
													}),
									},
								};
							}),
							settings: options?.resetSectionStyles
								? {
										...current.datas?.tagGroup?.settings,
										title: tagGroupFromModel!.settings.title, // defaults du nouveau template
									}
								: (current.datas?.tagGroup?.settings ?? {
										title: tagGroupFromModel!.settings.title,
									}),
						},
					}
				: {}),
		},
		...(options?.updateModules
			? {
					modules: structure.modules.map((module) => ({
						...module,
						column: "column" in module ? (module.column as number) : 0,
						// settings: {
						// 	...structure.modules[module.order - 1]?.settings,
						// },
					})),
				}
			: {
					modules: current?.modules?.map((module) => {
						const fromModel = structure.modules.find(
							(m) => m.type === module.type,
						);
						return {
							...module,
							settings: fromModel?.settings ?? module.settings,
						};
					}),
				}),
		//! penser à changer sizeModel, weightModel, colorSelect, withPrimaryColor, textAlign directement dans le settings des datas
	};
}

function mergeDatasSettings(
	base: CvFormValues["datas"],
	cached: TemplateDatasSettingsSnapshot,
): Partial<CvDatas> {
	if (!base) return {};

	const merged: Partial<CvDatas> = {};

	for (const key of Object.keys(cached) as (keyof CvDatas)[]) {
		const cachedSection = cached[key];
		if (!cachedSection?.settings) continue;

		const baseSection = base[key];
		if (!baseSection || typeof baseSection !== "object") continue;

		(merged as Record<keyof CvDatas, CvDatas[keyof CvDatas]>)[key] = {
			...baseSection,
			settings: cachedSection.settings,
		} as CvDatas[typeof key];
	}

	return merged;
}

function mergeSnapshot(
	base: CvFormValues,
	snap: TemplateSnapshot,
): CvFormValues {
	return {
		...base,
		layoutGeneral: snap.layoutGeneral ?? base.layoutGeneral,
		modules: snap.modules ?? base.modules,
		datas: {
			...base.datas,
			...mergeDatasSettings(base.datas, snap.datasSettings),
		} as CvDatas,
	};
}

export function switchTemplate(
	current: CvFormValues,
	model: TemplateCv,
	options?: { updateModules?: boolean },
): CvFormValues {
	const prevId = current.templateId;
	// 1. Sauver l’ancien template
	if (prevId && prevId !== model.id) {
		saveTemplateSnapshot(prevId, current);
	}
	// 2. Appliquer le nouveau (structure + defaults)
	const withNewTemplate = applyTemplateToForm(current, model, {
		updateModules: options?.updateModules ?? true,
		resetSectionStyles: true, // ← important
	});
	// 3. Restaurer le cache du nouveau s’il existe
	const cached = loadTemplateSnapshot(model.id);
	if (!cached) return withNewTemplate;
	return mergeSnapshot(withNewTemplate, cached);
}
