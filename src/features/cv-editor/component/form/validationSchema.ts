import type {
	CompetenceGroupItemContentInput,
	SkillGroupItemContentInput,
	TagGroupItemContentInput,
} from "@/services/schemas/cvSave.schema";
import type { CompetenceGroupInput, CompetenceInput, SkillInput, TagGroupInput, TagInput } from "@/services/schemas/profileSave.schema";
import {
	isBlankAchievement,
	isBlankCertification,
	isBlankCompetence,
	isBlankCompetenceGroup,
	isBlankEducation,
	isBlankExperience,
	isBlankExpertise,
	isBlankFormation,
	isBlankLanguage,
	isBlankPassion,
	isBlankPrize,
	isBlankProject,
	isBlankPublication,
	isBlankSkill,
	isBlankSkillGroup,
	isBlankSocialMedia,
	isBlankStrength,
	isBlankTag,
	isBlankTagGroup,
	isBlankVolunteering,
} from "@/utils/isBankSection";
import type { ListItem } from "@utils/type";
import z from "zod";

function isModuleActive(
	modules: { type?: string; isActive?: boolean }[] | undefined,
	type: string,
) {
	return (modules ?? []).some((m) => m.type === type && m.isActive !== false);
}

/** Garde title/settings/etc. — Zod strip sinon les styles au submit (ex. header.nom/prenom). */
const sectionPassthrough = z
	.object({
		content: z.any().optional(),
	})
	.passthrough();

export const cvValidationSchema = z
	.object({
		cvId: z.string().optional(),
		templateId: z.string().min(1),
		title: z.string().optional(),
		photo: z.string().nullable().optional(),
		datas: z
			.object({
				header: z
					.object({
						prenom: z.string().optional(),
						nom: z.string().optional(),
					})
					.passthrough()
					.optional(),
				description: sectionPassthrough.optional(),
				philosophy: sectionPassthrough.optional(),
				experience: sectionPassthrough.optional(),
				achievement: sectionPassthrough.optional(),
				certification: sectionPassthrough.optional(),
				education: sectionPassthrough.optional(),
				expertise: sectionPassthrough.optional(),
				formation: sectionPassthrough.optional(),
				language: sectionPassthrough.optional(),
				passion: sectionPassthrough.optional(),
				prize: sectionPassthrough.optional(),
				project: sectionPassthrough.optional(),
				publication: sectionPassthrough.optional(),
				socialMedia: sectionPassthrough.optional(),
				strength: sectionPassthrough.optional(),
				volunteering: sectionPassthrough.optional(),
				skillGroup: sectionPassthrough.optional(),
				tagGroup: sectionPassthrough.optional(),
				competenceGroup: sectionPassthrough.optional(),
			})
			.passthrough()
			.optional(),
		modules: z.array(z.any()).optional(),
		layoutGeneral: z.any().optional(),
	})
	.superRefine((cv, ctx) => {
		const prenom = cv.datas?.header?.prenom?.trim() ?? "";
		const nom = cv.datas?.header?.nom?.trim() ?? "";
		const title = cv.title?.trim() ?? "";
		if (!title && !(prenom && nom)) {
			ctx.addIssue({
				code: "custom",
				path: ["title"],
				message: "Le titre du CV est requis (nom et prénom)",
			});
		}
		if (isModuleActive(cv.modules, "experience")) {
			const items = cv.datas?.experience?.content ?? [];
			items.forEach((item, i) => {
				if (isBlankExperience(item)) return;
				if (!item.content?.title?.trim()) {
					ctx.addIssue({
						code: "custom",
						path: ["datas", "experience", "content", i, "content", "title"],
						message: "Le titre est requis",
					});
				}
				if (!item.content?.company?.trim()) {
					ctx.addIssue({
						code: "custom",
						path: ["datas", "experience", "content", i, "content", "company"],
						message: "L'entreprise est requise",
					});
				}
			});
		}
		if (isModuleActive(cv.modules, "achievement")) {
			const items = cv.datas?.achievement?.content ?? [];
			items.forEach((item, i) => {
				if (isBlankAchievement(item)) return;
				if (!item.content?.title?.trim()) {
					ctx.addIssue({
						code: "custom",
						path: ["datas", "achievement", "content", i, "content", "title"],
						message: "Le titre est requis",
					});
				}
			});
		}
		if (isModuleActive(cv.modules, "certification")) {
			const items = cv.datas?.certification?.content ?? [];
			items.forEach((item, i) => {
				if (isBlankCertification(item)) return;
				if (!item.content?.title?.trim()) {
					ctx.addIssue({
						code: "custom",
						path: ["datas", "certification", "content", i, "content", "title"],
						message: "Le titre est requis",
					});
				}
			});
		}
		if (isModuleActive(cv.modules, "education")) {
			const items = cv.datas?.education?.content ?? [];
			items.forEach((item, i) => {
				if (isBlankEducation(item)) return;
				if (!item.content?.school?.trim()) {
					ctx.addIssue({
						code: "custom",
						path: ["datas", "education", "content", i, "content", "school"],
						message: "L'établissement est requis",
					});
				}
			});
		}
		if (isModuleActive(cv.modules, "expertise")) {
			const items = cv.datas?.expertise?.content ?? [];
			items.forEach((item, i) => {
				if (isBlankExpertise(item)) return;
				if (!item.content?.title?.trim()) {
					ctx.addIssue({
						code: "custom",
						path: ["datas", "expertise", "content", i, "content", "title"],
						message: "Le titre est requis",
					});
				}
			});
		}
		if (isModuleActive(cv.modules, "formation")) {
			const items = cv.datas?.formation?.content ?? [];
			items.forEach((item, i) => {
				if (isBlankFormation(item)) return;
				if (!item.content?.title?.trim()) {
					ctx.addIssue({
						code: "custom",
						path: ["datas", "formation", "content", i, "content", "title"],
						message: "Le titre est requis",
					});
				}
			});
		}
		if (isModuleActive(cv.modules, "language")) {
			const items = cv.datas?.language?.content ?? [];
			items.forEach((item, i) => {
				if (isBlankLanguage(item)) return;
				if (!item.content?.name?.trim()) {
					ctx.addIssue({
						code: "custom",
						path: ["datas", "language", "content", i, "content", "name"],
						message: "Le nom de la langue est requis",
					});
				}
			});
		}
		if (isModuleActive(cv.modules, "passion")) {
			const items = cv.datas?.passion?.content ?? [];
			items.forEach((item, i) => {
				if (isBlankPassion(item)) return;
				if (!item.content?.title?.trim()) {
					ctx.addIssue({
						code: "custom",
						path: ["datas", "passion", "content", i, "content", "title"],
						message: "Le titre est requis",
					});
				}
			});
		}
		if (isModuleActive(cv.modules, "prize")) {
			const items = cv.datas?.prize?.content ?? [];
			items.forEach((item, i) => {
				if (isBlankPrize(item)) return;
				if (!item.content?.title?.trim()) {
					ctx.addIssue({
						code: "custom",
						path: ["datas", "prize", "content", i, "content", "title"],
						message: "Le titre est requis",
					});
				}
			});
		}
		if (isModuleActive(cv.modules, "project")) {
			const items = cv.datas?.project?.content ?? [];
			items.forEach((item, i) => {
				if (isBlankProject(item)) return;
				if (!item.content?.title?.trim()) {
					ctx.addIssue({
						code: "custom",
						path: ["datas", "project", "content", i, "content", "title"],
						message: "Le titre est requis",
					});
				}
			});
		}
		if (isModuleActive(cv.modules, "publication")) {
			const items = cv.datas?.publication?.content ?? [];
			items.forEach((item, i) => {
				if (isBlankPublication(item)) return;
				if (!item.content?.title?.trim()) {
					ctx.addIssue({
						code: "custom",
						path: ["datas", "publication", "content", i, "content", "title"],
						message: "Le titre est requis",
					});
				}
			});
		}
		if (isModuleActive(cv.modules, "socialMedia")) {
			const items = cv.datas?.socialMedia?.content ?? [];
			items.forEach((item, i) => {
				if (isBlankSocialMedia(item)) return;
				if (!item.content?.username?.trim()) {
					ctx.addIssue({
						code: "custom",
						path: ["datas", "socialMedia", "content", i, "content", "username"],
						message: "Le nom d'utilisateur est requis",
					});
				}
			});
		}
		if (isModuleActive(cv.modules, "strength")) {
			const items = cv.datas?.strength?.content ?? [];
			items.forEach((item, i) => {
				if (isBlankStrength(item)) return;
				if (!item.content?.title?.trim()) {
					ctx.addIssue({
						code: "custom",
						path: ["datas", "strength", "content", i, "content", "title"],
						message: "Le titre est requis",
					});
				}
			});
		}
		if (isModuleActive(cv.modules, "volunteering")) {
			const items = cv.datas?.volunteering?.content ?? [];
			items.forEach((item, i) => {
				if (isBlankVolunteering(item)) return;
				if (!item.content?.title?.trim()) {
					ctx.addIssue({
						code: "custom",
						path: ["datas", "volunteering", "content", i, "content", "title"],
						message: "Le titre est requis",
					});
				}
				if (!item.content?.organisation?.trim()) {
					ctx.addIssue({
						code: "custom",
						path: ["datas", "volunteering", "content", i, "content", "organisation"],
						message: "L'organisation est requise",
					});
				}
			});
		}
		if (isModuleActive(cv.modules, "description")) {
			const text = cv.datas?.description?.content?.description?.trim() ?? "";
			if (!text) {
				ctx.addIssue({
					code: "custom",
					path: ["datas", "description", "content", "description"],
					message: "La description est requise",
				});
			}
		}
		if (isModuleActive(cv.modules, "philosophy")) {
			const citation = cv.datas?.philosophy?.content?.citation?.trim() ?? "";
			if (!citation) {
				ctx.addIssue({
					code: "custom",
					path: ["datas", "philosophy", "content", "citation"],
					message: "La citation est requise",
				});
			}
			// if (
			// 	cv.datas?.philosophy?.settings?.withAuthor &&
			// 	!cv.datas?.philosophy?.content?.author?.trim()
			// ) {
			// 	ctx.addIssue({
			// 		code: "custom",
			// 		path: ["datas", "philosophy", "content", "author"],
			// 		message: "L'auteur est requis",
			// 	});
			// }
		}
		if (isModuleActive(cv.modules, "skill")) {
			const groups = cv.datas?.skillGroup?.content ?? [];
			groups.forEach((group: ListItem<SkillGroupItemContentInput>, gi) => {
				if (isBlankSkillGroup(group)) return;
				// optionnel : exiger un titre de groupe s'il y a des skills
				// if (!group.content?.title?.trim()) {
				//   ctx.addIssue({
				//     code: "custom",
				//     path: ["datas", "skillGroup", "content", gi, "content", "title"],
				//     message: "Le titre du groupe est requis",
				//   });
				// }
				(group.content?.skills ?? []).forEach((skill, si) => {
					if (isBlankSkill(skill as ListItem<SkillInput>)) return;
					if (!skill.content?.name?.trim()) {
						ctx.addIssue({
							code: "custom",
							path: [
								"datas",
								"skillGroup",
								"content",
								gi,
								"content",
								"skills",
								si,
								"content",
								"name",
							],
							message: "Le nom de la compétence est requis",
						});
					}
				});
			});
		}
		if (isModuleActive(cv.modules, "tag")) {
			const groups = cv.datas?.tagGroup?.content ?? [];
			groups.forEach((group: ListItem<TagGroupItemContentInput>, gi) => {
				if (isBlankTagGroup(group as ListItem<TagGroupInput>)) return;
				// optionnel : exiger un titre de groupe s'il y a des skills
				// if (!group.content?.title?.trim()) {
				//   ctx.addIssue({
				//     code: "custom",
				//     path: ["datas", "skillGroup", "content", gi, "content", "title"],
				//     message: "Le titre du groupe est requis",
				//   });
				// }
				(group.content?.tags ?? []).forEach((tag, si) => {
					if (isBlankTag(tag as ListItem<TagInput>)) return;
					const name = (tag as { content?: { name?: string } }).content?.name?.trim();
					if (!name) {
						ctx.addIssue({
							code: "custom",
							path: ["datas", "tagGroup", "content", gi, "content", "tags", si, "content", "name"],
							message: "Le nom de la compétence est requis",
						});
					}
				});
			});
		}
		if (isModuleActive(cv.modules, "competence")) {
			const groups = cv.datas?.competenceGroup?.content ?? [];
			groups.forEach((group: ListItem<CompetenceGroupItemContentInput>, gi) => {
				if (isBlankCompetenceGroup(group as ListItem<CompetenceGroupInput>)) return;
				// optionnel : exiger un titre de groupe s'il y a des skills
				// if (!group.content?.title?.trim()) {
				//   ctx.addIssue({
				//     code: "custom",
				//     path: ["datas", "skillGroup", "content", gi, "content", "title"],
				//     message: "Le titre du groupe est requis",
				//   });
				// }
				(group.content?.competences ?? []).forEach((competence, si) => {
					if (isBlankCompetence(competence as ListItem<CompetenceInput>)) return;
					const name = (competence as { content?: { name?: string } }).content?.name?.trim();
					if (!name) {
						ctx.addIssue({
							code: "custom",
							path: [
								"datas",
								"competenceGroup",
								"content",
								gi,
								"content",
								"competences",
								si,
								"content",
								"name",
							],
							message: "Le nom de la compétence est requis",
						});
					}
				});
			});
		}
	});
