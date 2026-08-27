import type {
	AchievementInput,
	CertificationInput,
	CompetenceGroupInput,
	CompetenceInput,
	EducationInput,
	ExperienceInput,
	ExpertiseInput,
	FormationInput,
	LanguageInput,
	PassionInput,
	PrizeInput,
	ProjectInput,
	PublicationInput,
	SkillGroupInput,
	SkillInput,
	SocialMediaInput,
	StrengthInput,
	TagGroupInput,
	TagInput,
	VolunteeringInput,
} from "@/services/schemas/profileSave.schema";
import type { ListItem } from "@utils/type";
import z from "zod";

export function isBlankExperience(item: ListItem<ExperienceInput>) {
	const c = item.content;
	const hasText = [c.title, c.company, c.location, c.description].some((s) =>
		s?.trim(),
	);
	const hasMissions = (c.missions ?? []).some((m) => m.content.content?.trim());
	const hasEnd = c.end != null;
	return !hasText && !hasMissions && !hasEnd;
}

export function isBlankStrength(item: ListItem<StrengthInput>) {
	const c = item.content;
	const hasText = [c.title, c.description].some((s) => s?.trim());
	return !hasText;
}

export function isBlankFormation(item: ListItem<FormationInput>) {
	const c = item.content;
	const hasText = [c.title, c.organismeFormation].some((s) => s?.trim());
	return !hasText;
}

export function isBlankProject(item: ListItem<ProjectInput>) {
	const c = item.content;
	const hasText = [c.title, c.description].some((s) => s?.trim());
	return !hasText;
}

export function isBlankPublication(item: ListItem<PublicationInput>) {
	const c = item.content;
	const hasText = [c.title, c.description, c.url, c.journalName].some((s) =>
		s?.trim(),
	);
	return !hasText;
}

export function isBlankAchievement(item: ListItem<AchievementInput>) {
	const c = item.content;
	const hasText = [c.title, c.description, c.technology].some((s) => s?.trim());
	return !hasText;
}

export function isBlankVolunteering(item: ListItem<VolunteeringInput>) {
	const c = item.content;
	const hasText = [c.title, c.description, c.organisation, c.location].some(
		(s) => s?.trim(),
	);
	const hasMissions = (c.missions ?? []).some((m) => m.content.content?.trim());
	const hasEnd = c.end != null;
	return !hasText && !hasMissions && !hasEnd;
}

export function isBlankEducation(item: ListItem<EducationInput>) {
	const c = item.content;
	const hasText = [c.title, c.school, c.city, c.degree].some((s) => s?.trim());
	const hasEnd = c.end != null;
	return !hasText && !hasEnd;
}

export function isBlankLanguage(item: ListItem<LanguageInput>) {
	const c = item.content;
	const hasText = [c.name].some((s) => s?.trim());
	return !hasText;
}

export function isBlankPassion(item: ListItem<PassionInput>) {
	const c = item.content;
	const hasText = [c.title, c.icon].some((s) => s?.trim());
	return !hasText;
}

export function isBlankPrize(item: ListItem<PrizeInput>) {
	const c = item.content;
	const hasText = [c.title, c.domaine, c.icon].some((s) => s?.trim());
	return !hasText;
}

export function isBlankCertification(item: ListItem<CertificationInput>) {
	const c = item.content;
	const hasText = [c.title, c.organismeCertification].some((s) => s?.trim());
	return !hasText;
}

export function isBlankSocialMedia(item: ListItem<SocialMediaInput>) {
	const c = item.content;
	const hasText = [c.socialNetwork, c.username, c.icon].some((s) => s?.trim());
	return !hasText;
}

export function isBlankExpertise(item: ListItem<ExpertiseInput>) {
	const c = item.content;
	const hasText = [c.title, c.level].some((s) => s?.trim());
	return !hasText;
}

export function isBlankSkill(item: ListItem<SkillInput>) {
	return !item.content?.name?.trim();
}

export function isBlankSkillGroup(item: ListItem<SkillGroupInput>) {
	const hasTitle = !!item.content?.title?.trim();
	const hasSkills = (item.content?.skills ?? []).some(
		(s) => !isBlankSkill(s as ListItem<SkillInput>),
	);
	return !hasTitle && !hasSkills;
}

export function isBlankCompetence(item: ListItem<CompetenceInput>) {
	return !item.content?.name?.trim();
}

export function isBlankCompetenceGroup(item: ListItem<CompetenceGroupInput>) {
	const hasTitle = !!item.content?.title?.trim();
	const hasCompetences = (item.content?.competences ?? []).some(
		(s) => !isBlankCompetence(s as ListItem<CompetenceInput>),
	);
	return !hasTitle && !hasCompetences;
}

export function isBlankTag(item: ListItem<TagInput>) {
	return !item.content?.name?.trim();
}

export function isBlankTagGroup(item: ListItem<TagGroupInput>) {
	const hasTitle = !!item.content?.title?.trim();
	const hasTags = (item.content?.tags ?? []).some(
		(s) => !isBlankTag(s as ListItem<TagInput>),
	);
	return !hasTitle && !hasTags;
}

export const validationSchema = z
	.object({
		firstName: z.string().min(1, { message: "Le prénom est requis" }),
		lastName: z.string().min(1, { message: "Le nom est requis" }),
		experiences: z
			.array(z.any())
			.optional()
			.superRefine((items, ctx) => {
				items?.forEach((item, i) => {
					if (isBlankExperience(item)) return;
					if (!item.content?.title?.trim()) {
						ctx.addIssue({
							code: "custom",
							path: [i, "content", "title"],
							message: "Le titre est requis",
						});
					}
				});
			}),
		strengths: z
			.array(z.any())
			.optional()
			.superRefine((items, ctx) => {
				items?.forEach((item, i) => {
					if (isBlankStrength(item)) return;
					if (!item.content?.title?.trim()) {
						ctx.addIssue({
							code: "custom",
							path: [i, "content", "title"],
							message: "Le titre est requis",
						});
					}
				});
			}),
		formations: z
			.array(z.any())
			.optional()
			.superRefine((items, ctx) => {
				items?.forEach((item, i) => {
					if (isBlankFormation(item)) return;
					if (!item.content?.title?.trim()) {
						ctx.addIssue({
							code: "custom",
							path: [i, "content", "title"],
							message: "Le nom de la formation est requis",
						});
					}
				});
			}),
		projects: z
			.array(z.any())
			.optional()
			.superRefine((items, ctx) => {
				items?.forEach((item, i) => {
					if (isBlankProject(item)) return;
					if (!item.content?.title?.trim()) {
						ctx.addIssue({
							code: "custom",
							path: [i, "content", "title"],
							message: "Le nom du projet est requis",
						});
					}
				});
			}),
		publications: z
			.array(z.any())
			.optional()
			.superRefine((items, ctx) => {
				items?.forEach((item, i) => {
					if (isBlankPublication(item)) return;
					if (!item.content?.title?.trim()) {
						ctx.addIssue({
							code: "custom",
							path: [i, "content", "title"],
							message: "Le titre est requis",
						});
					}
				});
			}),
		achievements: z
			.array(z.any())
			.optional()
			.superRefine((items, ctx) => {
				items?.forEach((item, i) => {
					if (isBlankAchievement(item)) return;
					if (!item.content?.title?.trim()) {
						ctx.addIssue({
							code: "custom",
							path: [i, "content", "title"],
							message: "Le nom de la réalisation est requis",
						});
					}
				});
			}),
		volunteerings: z
			.array(z.any())
			.optional()
			.superRefine((items, ctx) => {
				items?.forEach((item, i) => {
					if (isBlankVolunteering(item)) return;
					if (!item.content?.title?.trim()) {
						ctx.addIssue({
							code: "custom",
							path: [i, "content", "title"],
							message: "Le nom de la volontariat est requis",
						});
					}
				});
			}),
		educations: z
			.array(z.any())
			.optional()
			.superRefine((items, ctx) => {
				items?.forEach((item, i) => {
					if (isBlankEducation(item)) return;
					if (!item.content?.title?.trim()) {
						ctx.addIssue({
							code: "custom",
							path: [i, "content", "title"],
							message: "Le diplôme est requis",
						});
					}
				});
			}),
		languages: z
			.array(z.any())
			.optional()
			.superRefine((items, ctx) => {
				items?.forEach((item, i) => {
					if (isBlankLanguage(item)) return;
					if (!item.content?.name?.trim()) {
						ctx.addIssue({
							code: "custom",
							path: [i, "content", "name"],
							message: "La langue est requise",
						});
					}
				});
			}),
		passions: z
			.array(z.any())
			.optional()
			.superRefine((items, ctx) => {
				items?.forEach((item, i) => {
					if (isBlankPassion(item)) return;
					if (!item.content?.title?.trim()) {
						ctx.addIssue({
							code: "custom",
							path: [i, "content", "title"],
							message: "Le nom de la passion est requis",
						});
					}
				});
			}),
		prizes: z
			.array(z.any())
			.optional()
			.superRefine((items, ctx) => {
				items?.forEach((item, i) => {
					if (isBlankPrize(item)) return;
					if (!item.content?.title?.trim()) {
						ctx.addIssue({
							code: "custom",
							path: [i, "content", "title"],
							message: "Le nom du prix est requis",
						});
					}
				});
			}),
		certifications: z
			.array(z.any())
			.optional()
			.superRefine((items, ctx) => {
				items?.forEach((item, i) => {
					if (isBlankCertification(item)) return;
					if (!item.content?.title?.trim()) {
						ctx.addIssue({
							code: "custom",
							path: [i, "content", "title"],
							message: "Le nom de la certification est requis",
						});
					}
				});
			}),
		socialMedias: z
			.array(z.any())
			.optional()
			.superRefine((items, ctx) => {
				items?.forEach((item, i) => {
					if (isBlankSocialMedia(item)) return;
					if (!item.content?.socialNetwork?.trim()) {
						ctx.addIssue({
							code: "custom",
							path: [i, "content", "socialNetwork"],
							message: "Le réseau social est requis",
						});
					}
					if (!item.content?.username?.trim()) {
						ctx.addIssue({
							code: "custom",
							path: [i, "content", "username"],
							message: "Le nom d'utilisateur est requis",
						});
					}
				});
			}),
		expertises: z
			.array(z.any())
			.optional()
			.superRefine((items, ctx) => {
				items?.forEach((item, i) => {
					if (isBlankExpertise(item)) return;
					if (!item.content?.title?.trim()) {
						ctx.addIssue({
							code: "custom",
							path: [i, "content", "title"],
							message: "Le nom de l'expertise est requis",
						});
					}
				});
			}),
		skillGroups: z
			.array(z.any())
			.optional()
			.superRefine((items, ctx) => {
				items?.forEach((item, i) => {
					if (isBlankSkillGroup(item)) return;
					// if (!item.content?.title?.trim()) {
					// 	ctx.addIssue({
					// 		code: "custom",
					// 		path: [i, "content", "title"],
					// 		message: "Le nom du groupe est requis",
					// 	});
					// }
				});
			}),
		competenceGroups: z
			.array(z.any())
			.optional()
			.superRefine((items, ctx) => {
				items?.forEach((item, i) => {
					if (isBlankCompetenceGroup(item)) return;
				});
			}),
		tagGroups: z
			.array(z.any())
			.optional()
			.superRefine((items, ctx) => {
				items?.forEach((item, i) => {
					if (isBlankTagGroup(item)) return;
				});
			}),
	})
	.passthrough();
