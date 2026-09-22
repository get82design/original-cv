import { z } from "zod";
import { createProfileSchema } from "./profile.schema";
import { createExperienceSchema, createMissionExperienceSchema } from "./experience.schema";
import { CvTimelineStatusSchema, LevelSchema } from "./enums";
import { createMissionProjectSchema, createProjectSchema } from "./project.schema";
import { createPublicationSchema } from "./publication.schema";
import { createAchievementSchema } from "./achievement.schema";
import { createMissionVolunteeringSchema, createVolunteeringSchema } from "./volunteering.schema";
import { createEducationSchema } from "./education.schema";
import { createSkillGroupSchema } from "./skillGroup.schema";
import { skillInCvFormSchema } from "./skill.schema";
import { createLanguageSchema } from "./language.schema";
import { createTagGroupSchema } from "./tagGroup.schema";
import { tagInCvFormSchema } from "./tag.schema";
import { createCompetenceGroupSchema } from "./competenceGroup.schema";
import { competenceInCvFormSchema } from "./competence.schema";
import { createSocialMediaSchema } from "./socialMedia.schema";
import { createExpertiseSchema } from "./expertise.schema";
import { createCertificationSchema } from "./certification.schema";
import { createFormationSchema } from "./formation.schema";
// ... autres create*Schema au fur et à mesure

function listItemSchema<T extends z.ZodType>(contentSchema: T) {
	return z.object({
		id: z.string().optional(),
		clientKey: z.string().min(1),
		order: z.number().int().min(0).optional(),
		content: contentSchema,
	});
}

const experienceContentSchema = createExperienceSchema
	.omit({ order: true, missions: true, settings: true })
	.extend({
		start: z.coerce.date(),
		end: z.coerce.date().nullish(),
		location: z.string().nullish(),
		description: z.string().nullish(),
		company: z.string().nullish(),
		missions: z
			.array(listItemSchema(createMissionExperienceSchema.omit({ order: true })))
			.default([]),
	});

const strengthContentSchema = z.object({
	id: z.string().optional(),
	icon: z.string().nullish(),
	title: z.string().min(1),
	description: z.string().nullish(),
});

const projectContentSchema = createProjectSchema
	.omit({ order: true, missions: true, settings: true })
	.extend({
		description: z.string().nullish(),
		location: z.string().nullish(),
		start: z.coerce.date(),
		end: z.coerce.date().nullish(),
		technology: z.string().nullish(),
		missions: z.array(listItemSchema(createMissionProjectSchema.omit({ order: true }))).default([]),
		status: CvTimelineStatusSchema.optional(),
	});

const publicationContentSchema = createPublicationSchema
	.omit({ order: true, settings: true })
	.extend({
		start: z.coerce.date(),
		end: z.coerce.date().nullish(),
		journalName: z.string().nullish(),
		description: z.string().nullish(),
		url: z.string().nullish(),
	});

const achievementContentSchema = createAchievementSchema
	.omit({ order: true, settings: true })
	.extend({
		description: z.string().nullish(),
		technology: z.string().nullish(),
		year: z.number().nullish(),
	});

const volunteeringContentSchema = createVolunteeringSchema
	.omit({ order: true, missions: true, settings: true })
	.extend({
		description: z.string().nullish(),
		organisation: z.string().nullish(),
		location: z.string().nullish(),
		start: z.coerce.date(),
		end: z.coerce.date().nullish(),
		missions: z
			.array(listItemSchema(createMissionVolunteeringSchema.omit({ order: true })))
			.default([]),
	});

const educationContentSchema = createEducationSchema.omit({ order: true, settings: true }).extend({
	title: z.string().nullish(),
	city: z.string().nullish(),
	school: z.string().nullish(),
	start: z.coerce.date(),
	end: z.coerce.date().nullish(),
	obtained: CvTimelineStatusSchema.optional(),
	degree: z.string().nullish(),
});

const skillGroupContentSchema = createSkillGroupSchema
	.omit({ order: true, skills: true, settings: true })
	.extend({
		title: z.string().nullish(), // Prisma: String?
		skills: z.array(listItemSchema(skillInCvFormSchema)).default([]),
	});

const tagGroupContentSchema = createTagGroupSchema
	.omit({ order: true, tags: true, settings: true })
	.extend({
		title: z.string().nullish(),
		tags: z.array(listItemSchema(tagInCvFormSchema)).default([]),
	});

const competenceGroupContentSchema = createCompetenceGroupSchema
	.omit({ order: true, competences: true, settings: true })
	.extend({
		title: z.string().nullish(),
		competences: z.array(listItemSchema(competenceInCvFormSchema)).default([]),
	});

const languageContentSchema = createLanguageSchema.omit({ order: true, settings: true }).extend({
	name: z.string().nullish(),
	level: LevelSchema.nullish(),
});

const socialMediaContentSchema = createSocialMediaSchema
	.omit({ order: true, settings: true })
	.extend({
		icon: z.string().min(1),
		socialNetwork: z.string().min(1),
		username: z.string().nullish(),
	});

const expertiseContentSchema = createExpertiseSchema.omit({ order: true, settings: true }).extend({
	title: z.string().min(1),
	level: LevelSchema.nullish(),
});

const certificationContentSchema = createCertificationSchema
	.omit({ order: true, settings: true })
	.extend({
		title: z.string().min(1),
		organismeCertification: z.string().nullish(),
	});

const formationContentSchema = createFormationSchema.omit({ order: true, settings: true }).extend({
	title: z.string().min(1),
	organismeFormation: z.string().nullish(),
	start: z.coerce.date(),
	end: z.coerce.date().nullish(),
	status: CvTimelineStatusSchema.optional(),
});

const passionContentSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1),
	icon: z.string().min(1),
});

const prizeContentSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1),
	icon: z.string().min(1),
	domaine: z.string().nullish(),
});

const philosophySchema = z.object({
	id: z.string().optional(),
	citation: z.string().min(1),
	author: z.string().nullish(),
});

const descriptionSchema = z.object({
	id: z.string().optional(),
	description: z.string().min(1),
});

export const profileSaveSchema = createProfileSchema.extend({
	description: descriptionSchema.nullish(),
	philosophy: philosophySchema.nullish(),
	experiences: z.array(listItemSchema(experienceContentSchema)).optional(),
	strengths: z.array(listItemSchema(strengthContentSchema)).optional(),
	projects: z.array(listItemSchema(projectContentSchema)).optional(),
	publications: z.array(listItemSchema(publicationContentSchema)).optional(),
	achievements: z.array(listItemSchema(achievementContentSchema)).optional(),
	volunteerings: z.array(listItemSchema(volunteeringContentSchema)).optional(),
	educations: z.array(listItemSchema(educationContentSchema)).optional(),
	skillGroups: z.array(listItemSchema(skillGroupContentSchema)).optional(),
	languages: z.array(listItemSchema(languageContentSchema)).optional(),
	tagGroups: z.array(listItemSchema(tagGroupContentSchema)).optional(),
	competenceGroups: z.array(listItemSchema(competenceGroupContentSchema)).optional(),
	socialMedias: z.array(listItemSchema(socialMediaContentSchema)).optional(),
	expertises: z.array(listItemSchema(expertiseContentSchema)).optional(),
	certifications: z.array(listItemSchema(certificationContentSchema)).optional(),
	formations: z.array(listItemSchema(formationContentSchema)).optional(),
	passions: z.array(listItemSchema(passionContentSchema)).optional(),
	prizes: z.array(listItemSchema(prizeContentSchema)).optional(),
});

export type ProfileSaveInput = z.infer<typeof profileSaveSchema>;
export type ExperienceInput = z.infer<typeof experienceContentSchema>;
export type DescriptionInput = z.infer<typeof descriptionSchema>;
export type PhilosophyInput = z.infer<typeof philosophySchema>;
export type StrengthInput = z.infer<typeof strengthContentSchema>;
export type ProjectInput = z.infer<typeof projectContentSchema>;
export type PublicationInput = z.infer<typeof publicationContentSchema>;
export type AchievementInput = z.infer<typeof achievementContentSchema>;
export type VolunteeringInput = z.infer<typeof volunteeringContentSchema>;
export type EducationInput = z.infer<typeof educationContentSchema>;
export type SkillGroupInput = z.infer<typeof skillGroupContentSchema>;
export type SkillInput = z.infer<typeof skillInCvFormSchema>;
export type LanguageInput = z.infer<typeof languageContentSchema>;
export type TagGroupInput = z.infer<typeof tagGroupContentSchema>;
export type TagInput = z.infer<typeof tagInCvFormSchema>;
export type CompetenceGroupInput = z.infer<typeof competenceGroupContentSchema>;
export type CompetenceInput = z.infer<typeof competenceInCvFormSchema>;
export type SocialMediaInput = z.infer<typeof socialMediaContentSchema>;
export type ExpertiseInput = z.infer<typeof expertiseContentSchema>;
export type CertificationInput = z.infer<typeof certificationContentSchema>;
export type FormationInput = z.infer<typeof formationContentSchema>;
export type PassionInput = z.infer<typeof passionContentSchema>;
export type PrizeInput = z.infer<typeof prizeContentSchema>;
