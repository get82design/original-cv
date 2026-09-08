import { 
	isBlankExperience, 
	isBlankStrength, 
	isBlankFormation, 
	isBlankProject, 
	isBlankPublication, 
	isBlankAchievement, 
	isBlankVolunteering, 
	isBlankEducation, 
	isBlankLanguage, 
	isBlankPassion, 
	isBlankPrize, 
	isBlankCertification, 
	isBlankSocialMedia, 
	isBlankExpertise, 
	isBlankSkillGroup, 
	isBlankCompetenceGroup, 
	isBlankTagGroup 
} from "@/utils/isBankSection";
import z from "zod";

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
