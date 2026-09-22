import { z } from "zod";

export const LevelSchema = z.enum(["Débutant", "Junior", "Intermédiaire", "Senior", "Expert"]);
export type Level = z.infer<typeof LevelSchema>;

export const CvTimelineStatusSchema = z.enum(["COMPLETED", "ABANDONED", "INTERRUPTED"]);
export type CvTimelineStatus = z.infer<typeof CvTimelineStatusSchema>;

export const CVModuleItemTypeSchema = z.enum([
	"cvSkillGroup",
	"cvExperience",
	"cvEducation",
	"cvProject",
	"cvVolunteering",
	"cvPublication",
	"cvAchievement",
	"cvExpertise",
	"cvFormation",
	"cvCertification",
	"cvPrize",
	"cvLanguage",
	"cvPassion",
	"cvCompetenceGroup",
	"cvTagGroup",
	"cvDescription",
	"cvPhilosophy",
	"cvStrength",
	"cvSocialMedia",
	"cvTag",
]);
export type CVModuleItemType = z.infer<typeof CVModuleItemTypeSchema>;

export const CVModuleTypeSchema = z.enum([
	"skill",
	"experience",
	"education",
	"project",
	"volunteering",
	"publication",
	"achievement",
	"expertise",
	"formation",
	"certification",
	"prize",
	"language",
	"passion",
	"competence",
	"description",
	"philosophy",
	"strength",
	"socialMedia",
	"tag",
]);
export type CVModuleType = z.infer<typeof CVModuleTypeSchema>;
