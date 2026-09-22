// src/services/schemas/cvSave.schema.ts
import { z } from "zod";
import { createExperienceSchema, createMissionExperienceSchema } from "./experience.schema";
import { createCvHeaderSchema } from "./cvHeader.schema";
import { createCvModuleSchema } from "./cvModule.schema";
import { createDescriptionSchema } from "./description.schema";
import { createMissionProjectSchema, createProjectSchema } from "./project.schema";
import { createMissionVolunteeringSchema, createVolunteeringSchema } from "./volunteering.schema";
import { createFormationSchema } from "./formation.schema";
import { createCertificationSchema } from "./certification.schema";
import { createPrizeSchema } from "./prize.schema";
import { createExpertiseSchema } from "./expertise.schema";
import { createPhilosophySchema } from "./philosophy.schema";
import { createSocialMediaSchema } from "./socialMedia.schema";
import { createPassionInputSchema } from "./passion.schema";
import { createLanguageSchema } from "./language.schema";
import { createPublicationSchema } from "./publication.schema";
import { createStrengthSchema } from "./strength.schema";
import { createAchievementSchema } from "./achievement.schema";
import { createEducationSchema } from "./education.schema";
import { createSkillGroupSchema } from "./skillGroup.schema";
import { skillInCvFormSchema } from "./skill.schema";
import { createCompetenceGroupSchema } from "./competenceGroup.schema";
import { competenceInCvFormSchema, createCompetenceSchema } from "./competence.schema";
import {
	baseSettingsSchema,
	philosophyContentSchema,
	templateDefaultStylesSchema,
	templateLayoutSchema,
} from "./cvTemplate.schema";
import { createTagSchema, tagInCvFormSchema } from "./tag.schema";
import { createTagGroupSchema } from "./tagGroup.schema";

/** Id local front (ex: "experience-1") */
const clientKeySchema = z.string().min(1);

/** Item de liste : id serveur optionnel + clientKey */
function listItemSchema<T extends z.ZodType>(contentSchema: T) {
	return z.object({
		id: z.string().optional(),
		clientKey: clientKeySchema,
		order: z.number().int().min(0).optional(),
		content: contentSchema,
	});
}

// --- Header (réutilise createCvHeaderSchema) ---
const headerSchema = createCvHeaderSchema
	.extend({
		id: z.string().optional(),
	})
	.partial();

// --- description ---
const descriptionSchema = z.object({
	id: z.string().optional(),
	title: z.string().optional(), // titre de section UI → plutôt module.title
	content: createDescriptionSchema, // → CvDescription.description
	settings: z
		.object({
			title: baseSettingsSchema,
			content: baseSettingsSchema,
		})
		.optional(),
});

const experienceItemContentSchema = createExperienceSchema
	.omit({ order: true, missions: true })
	.extend({
		start: z.coerce.date(), // plus souple que z.date() pour le JSON front
		end: z.coerce.date().nullable().optional(),
		missions: z
			.array(listItemSchema(createMissionExperienceSchema.omit({ order: true })))
			.default([]),
	});

const experienceSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(experienceItemContentSchema)),
	settings: z
		.object({
			title: baseSettingsSchema,
		})
		.optional(),
});

const projectItemContentSchema = createProjectSchema.omit({ order: true, missions: true }).extend({
	start: z.coerce.date(), // plus souple que z.date() pour le JSON front
	end: z.coerce.date().nullable().optional(),
	missions: z.array(listItemSchema(createMissionProjectSchema.omit({ order: true }))).default([]),
});

const projectSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(projectItemContentSchema)),
	settings: z
		.object({
			title: baseSettingsSchema,
		})
		.optional(),
});

const volunteeringItemContentSchema = createVolunteeringSchema
	.omit({ order: true, missions: true })
	.extend({
		start: z.coerce.date(), // plus souple que z.date() pour le JSON front
		end: z.coerce.date().nullable().optional(),
		missions: z
			.array(listItemSchema(createMissionVolunteeringSchema.omit({ order: true })))
			.default([]),
	});

const volunteeringSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(volunteeringItemContentSchema)),
	settings: z
		.object({
			title: baseSettingsSchema,
		})
		.optional(),
});

const formationItemContentSchema = createFormationSchema.omit({ order: true }).extend({
	start: z.coerce.date(), // plus souple que z.date() pour le JSON front
	end: z.coerce.date().nullable().optional(),
});

const formationSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(formationItemContentSchema)),
	settings: z
		.object({
			title: baseSettingsSchema,
		})
		.optional(),
});

const certificationItemContentSchema = createCertificationSchema.omit({
	order: true,
});

const certificationSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(certificationItemContentSchema)),
	settings: z
		.object({
			title: baseSettingsSchema,
		})
		.optional(),
});

export const prizeItemContentSchema = createPrizeSchema.omit({ order: true });

const prizeSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(prizeItemContentSchema)),
	settings: z
		.object({
			title: baseSettingsSchema,
		})
		.optional(),
});

const expertiseItemContentSchema = createExpertiseSchema.omit({ order: true });

const expertiseSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(expertiseItemContentSchema)),
	settings: z
		.object({
			title: baseSettingsSchema,
		})
		.optional(),
});

const philosophySchema = z.object({
	id: z.string().optional(),
	title: z.string().optional(), // titre de section UI → plutôt module.title
	content: createPhilosophySchema, // → CvPhilosophy.citation
	settings: z
		.object({
			title: baseSettingsSchema,
			content: philosophyContentSchema,
		})
		.optional(),
});

const socialMediaItemContentSchema = createSocialMediaSchema.omit({
	order: true,
});

const socialMediaSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(socialMediaItemContentSchema)),
	settings: z
		.object({
			title: baseSettingsSchema,
		})
		.optional(),
});

const passionItemContentSchema = createPassionInputSchema.omit({ order: true });

const passionSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(passionItemContentSchema)),
	settings: z
		.object({
			title: baseSettingsSchema,
		})
		.optional(),
});

const languageItemContentSchema = createLanguageSchema.omit({ order: true });

const languageSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(languageItemContentSchema)),
	settings: z
		.object({
			title: baseSettingsSchema,
		})
		.optional(),
});

const publicationItemContentSchema = createPublicationSchema.omit({ order: true }).extend({
	start: z.coerce.date(), // plus souple que z.date() pour le JSON front
	end: z.coerce.date().nullable().optional(),
});

const publicationSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(publicationItemContentSchema)),
	settings: z
		.object({
			title: baseSettingsSchema,
		})
		.optional(),
});

const strengthItemContentSchema = createStrengthSchema.omit({ order: true });

const strengthSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(strengthItemContentSchema)),
	settings: z
		.object({
			title: baseSettingsSchema,
		})
		.optional(),
});

const achievementItemContentSchema = createAchievementSchema.omit({
	order: true,
});

const achievementSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(achievementItemContentSchema)),
	settings: z
		.object({
			title: baseSettingsSchema,
		})
		.optional(),
});

const educationItemContentSchema = createEducationSchema.omit({ order: true }).extend({
	start: z.coerce.date(), // plus souple que z.date() pour le JSON front
	end: z.coerce.date().nullable().optional(),
});

const educationSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(educationItemContentSchema)),
	settings: z
		.object({
			title: baseSettingsSchema,
		})
		.optional(),
});

const skillInGroupSchema = listItemSchema(skillInCvFormSchema);

const skillGroupItemContentSchema = createSkillGroupSchema
	.omit({ order: true, skills: true })
	.extend({
		skills: z.array(skillInGroupSchema).default([]),
	});

const skillGroupSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(skillGroupItemContentSchema)),
	settings: z
		.object({
			title: baseSettingsSchema,
		})
		.optional(),
});

const competenceInGroupSchema = listItemSchema(competenceInCvFormSchema);

const competenceGroupItemContentSchema = createCompetenceGroupSchema
	.omit({ order: true, competences: true })
	.extend({
		competences: z.array(competenceInGroupSchema).default([]),
	});

const competenceGroupSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(competenceGroupItemContentSchema)),
	settings: z
		.object({
			title: baseSettingsSchema,
		})
		.optional(),
});

const tagInGroupSchema = listItemSchema(tagInCvFormSchema);

const tagGroupItemContentSchema = createTagGroupSchema.omit({ order: true, tags: true }).extend({
	tags: z.array(tagInGroupSchema).default([]),
});

const tagGroupSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(tagGroupItemContentSchema)),
	settings: z
		.object({
			title: baseSettingsSchema,
		})
		.optional(),
});

const datasSchema = z.object({
	header: headerSchema.optional(),
	description: descriptionSchema.optional(),
	experience: experienceSectionSchema.optional(),
	project: projectSectionSchema.optional(),
	volunteering: volunteeringSectionSchema.optional(),
	formation: formationSectionSchema.optional(),
	certification: certificationSectionSchema.optional(),
	prize: prizeSectionSchema.optional(),
	expertise: expertiseSectionSchema.optional(),
	philosophy: philosophySchema.optional(),
	socialMedia: socialMediaSectionSchema.optional(),
	passion: passionSectionSchema.optional(),
	language: languageSectionSchema.optional(),
	publication: publicationSectionSchema.optional(),
	strength: strengthSectionSchema.optional(),
	achievement: achievementSectionSchema.optional(),
	education: educationSectionSchema.optional(),
	skillGroup: skillGroupSectionSchema.optional(),
	competenceGroup: competenceGroupSectionSchema.optional(),
	tagGroup: tagGroupSectionSchema.optional(),
});

// --- Modules : tableau proche de createCvModuleSchema + id? ---
const moduleInSaveSchema = createCvModuleSchema.extend({
	id: z.string().optional(),
	// order déjà dans createCvModuleSchema (min 1) — OK
	// isActive déjà présent avec default true
});

const cvLayoutGeneralSchema = z.object({
	layout: templateLayoutSchema,
	defaultStyles: templateDefaultStylesSchema,
	// slugTemplate: z.string().min(1),
	// components: z.object({
	//     sectionHeader: z.enum(["HeaderOne", "HeaderTwo", "HeaderThree"]),
	// }),
});

// --- Root ---
export const cvSaveSchema = z.object({
	cvId: z.string().optional(),
	templateId: z.string().min(1),
	title: z.string().min(1),
	photo: z.string().nullable().optional(),
	layoutGeneral: cvLayoutGeneralSchema.optional(), // tu as CV.layoutGeneral en Prisma
	datas: datasSchema.default({}),
	modules: z.array(moduleInSaveSchema).default([]),
});

export type CvSaveInput = z.infer<typeof cvSaveSchema>;
export type CvFormValues = z.input<typeof cvSaveSchema>;
export type CertificationItemContentInput = z.infer<typeof certificationItemContentSchema>;
export type EducationItemContentInput = z.infer<typeof educationItemContentSchema>;
export type ExperienceItemContentInput = z.infer<typeof experienceItemContentSchema>;
export type FormationItemContentInput = z.infer<typeof formationItemContentSchema>;
export type LanguageItemContentInput = z.infer<typeof languageItemContentSchema>;
export type PassionItemContentInput = z.infer<typeof passionItemContentSchema>;
export type PrizeItemContentInput = z.infer<typeof prizeItemContentSchema>;
export type ProjectItemContentInput = z.infer<typeof projectItemContentSchema>;
export type SkillGroupItemContentInput = z.infer<typeof skillGroupItemContentSchema>;
export type SkillItemContentInput = z.infer<typeof skillInGroupSchema>;
export type SocialMediaItemContentInput = z.infer<typeof socialMediaItemContentSchema>;
export type StrengthItemContentInput = z.infer<typeof strengthItemContentSchema>;
export type ExpertiseItemContentInput = z.infer<typeof expertiseItemContentSchema>;
export type VolunteeringItemContentInput = z.infer<typeof volunteeringItemContentSchema>;
export type PublicationItemContentInput = z.infer<typeof publicationItemContentSchema>;
export type AchievementItemContentInput = z.infer<typeof achievementItemContentSchema>;
export type CompetenceGroupItemContentInput = z.infer<typeof competenceGroupItemContentSchema>;
export type CompetenceItemContentInput = z.infer<typeof competenceInGroupSchema>;
export type TagGroupItemContentInput = z.infer<typeof tagGroupItemContentSchema>;
export type TagItemContentInput = z.infer<typeof tagInGroupSchema>;
export type CvModulesInput = z.infer<typeof moduleInSaveSchema>;
