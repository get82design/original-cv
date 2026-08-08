// src/services/schemas/cvSave.schema.ts
import { z } from "zod";
import {
	createExperienceSchema,
	createMissionExperienceSchema,
} from "./experience.schema";
import { createCvHeaderSchema } from "./cvHeader.schema";
import {
	createCvModuleSchema,
} from "./cvModule.schema";
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
import { createSkillSchema, skillInCvFormSchema } from "./skill.schema";
import { createCompetenceGroupSchema } from "./competenceGroup.schema";
import { createCompetenceSchema } from "./competence.schema";
import { baseSettingsSchema, templateDefaultStylesSchema, templateLayoutSchema } from "./cvTemplate.schema";

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
const headerSchema = createCvHeaderSchema.extend({
	id: z.string().optional(),
}).partial();

// --- description ---
const descriptionSchema = z.object({
	id: z.string().optional(),
	title: z.string().optional(), // titre de section UI → plutôt module.title
	content: createDescriptionSchema, // → CvDescription.description
	settings: z.object({
		title: baseSettingsSchema,
        content: baseSettingsSchema,
	}),
});

const experienceItemContentSchema = createExperienceSchema
	.omit({ order: true, missions: true })
	.extend({
		start: z.coerce.date(), // plus souple que z.date() pour le JSON front
		end: z.coerce.date().nullable().optional(),
		missions: z.array(
            listItemSchema(createMissionExperienceSchema.omit({ order: true }))
          ).default([]),
	});

const experienceSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(experienceItemContentSchema)),
	settings: z.object({
		title: baseSettingsSchema,
	}),
});

const projectItemContentSchema = createProjectSchema
    .omit({ order: true, missions: true })
    .extend({
        start: z.coerce.date(), // plus souple que z.date() pour le JSON front
        end: z.coerce.date().nullable().optional(),
        missions: z.array(
            listItemSchema(createMissionProjectSchema.omit({ order: true }))
          ).default([]),
    });

const projectSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(projectItemContentSchema)),
	settings: z.object({
		title: baseSettingsSchema,
	}),
});

const volunteeringItemContentSchema = createVolunteeringSchema
    .omit({ order: true, missions: true })
    .extend({
        start: z.coerce.date(), // plus souple que z.date() pour le JSON front
        end: z.coerce.date().nullable().optional(),
        missions: z.array(
            listItemSchema(createMissionVolunteeringSchema.omit({ order: true }))
          ).default([]),
    });

const volunteeringSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(volunteeringItemContentSchema)),
});

const formationItemContentSchema = createFormationSchema
    .omit({ order: true })
    .extend({
        start: z.coerce.date(), // plus souple que z.date() pour le JSON front
        end: z.coerce.date().nullable().optional(),
    });

const formationSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(formationItemContentSchema)),
});

const certificationItemContentSchema = createCertificationSchema.omit({ order: true });

const certificationSectionSchema = z.object({
    title: z.string().optional(), // titre section UI
    content: z.array(listItemSchema(certificationItemContentSchema)),
});

const prizeItemContentSchema = createPrizeSchema
    .omit({ order: true })

const prizeSectionSchema = z.object({
    title: z.string().optional(), // titre section UI
    content: z.array(listItemSchema(prizeItemContentSchema)),
});

const expertiseItemContentSchema = createExpertiseSchema
    .omit({ order: true })

const expertiseSectionSchema = z.object({
    title: z.string().optional(), // titre section UI
    content: z.array(listItemSchema(expertiseItemContentSchema)),
});

const philosophySchema = z.object({
	id: z.string().optional(),
	title: z.string().optional(), // titre de section UI → plutôt module.title
	content: createPhilosophySchema, // → CvPhilosophy.citation
});

const socialMediaItemContentSchema = createSocialMediaSchema
    .omit({ order: true })

const socialMediaSectionSchema = z.object({
    title: z.string().optional(), // titre section UI
    content: z.array(listItemSchema(socialMediaItemContentSchema)),
    settings: z.object({
		title: baseSettingsSchema,
	}),
});

const passionItemContentSchema = createPassionInputSchema
    .omit({ order: true })

const passionSectionSchema = z.object({
    title: z.string().optional(), // titre section UI
    content: z.array(listItemSchema(passionItemContentSchema)),
});

const languageItemContentSchema = createLanguageSchema
    .omit({ order: true })

const languageSectionSchema = z.object({
    title: z.string().optional(), // titre section UI
    content: z.array(listItemSchema(languageItemContentSchema)),
    settings: z.object({
		title: baseSettingsSchema,
	}),
});

const publicationItemContentSchema = createPublicationSchema
    .omit({ order: true })
    .extend({
        start: z.coerce.date(), // plus souple que z.date() pour le JSON front
        end: z.coerce.date().nullable().optional(),
    });

const publicationSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(publicationItemContentSchema)),
});

const strengthItemContentSchema = createStrengthSchema
    .omit({ order: true })

const strengthSectionSchema = z.object({
    title: z.string().optional(), // titre section UI
    content: z.array(listItemSchema(strengthItemContentSchema)),
});

const achievementItemContentSchema = createAchievementSchema
    .omit({ order: true })

const achievementSectionSchema = z.object({
    title: z.string().optional(), // titre section UI
    content: z.array(listItemSchema(achievementItemContentSchema)),
});

const educationItemContentSchema = createEducationSchema
    .omit({ order: true })
    .extend({
        start: z.coerce.date(), // plus souple que z.date() pour le JSON front
        end: z.coerce.date().nullable().optional(),
    });

const educationSectionSchema = z.object({
	title: z.string().optional(), // titre section UI
	content: z.array(listItemSchema(educationItemContentSchema)),
    settings: z.object({
		title: baseSettingsSchema,
	}),
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
    settings: z.object({
		title: baseSettingsSchema,
	}),
});

const competenceInGroupSchema = listItemSchema(
    createCompetenceSchema.omit({ order: true }), // reste: competenceId + level
);

const competenceGroupItemContentSchema = createCompetenceGroupSchema
    .omit({ order: true, competences: true })
    .extend({
      competences: z.array(competenceInGroupSchema).default([]),
});

const competenceGroupSectionSchema = z.object({
    title: z.string().optional(), // titre section UI
    content: z.array(listItemSchema(competenceGroupItemContentSchema)),
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
export type EducationItemContentInput = z.infer<typeof educationItemContentSchema>;
export type ExperienceItemContentInput = z.infer<typeof experienceItemContentSchema>;
export type LanguageItemContentInput = z.infer<typeof languageItemContentSchema>;
export type ProjectItemContentInput = z.infer<typeof projectItemContentSchema>;
export type SkillGroupItemContentInput = z.infer<typeof skillGroupItemContentSchema>;
export type SkillItemContentInput = z.infer<typeof skillInGroupSchema>;
export type SocialMediaItemContentInput = z.infer<typeof socialMediaItemContentSchema>;
export type CvModulesInput = z.infer<typeof moduleInSaveSchema>;
