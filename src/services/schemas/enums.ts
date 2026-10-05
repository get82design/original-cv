import { z } from "zod";

export const LevelSchema = z.enum(["Débutant", "Junior", "Intermédiaire", "Senior", "Expert"]);
export type Level = z.infer<typeof LevelSchema>;

export const CvTimelineStatusSchema = z.enum(["COMPLETED", "ABANDONED", "INTERRUPTED"]);
export type CvTimelineStatus = z.infer<typeof CvTimelineStatusSchema>;

/** Catégories de permis de conduire (France) */
export const DrivingLicenseSchema = z.enum([
	"AM",
	"A1",
	"A2",
	"A",
	"B",
	"B1",
	"BE",
	"C1",
	"C",
	"C1E",
	"CE",
	"D1",
	"D",
	"D1E",
	"DE",
]);
export type DrivingLicense = z.infer<typeof DrivingLicenseSchema>;

export const DRIVING_LICENSE_OPTIONS: { value: DrivingLicense; label: string }[] = [
	{ value: "AM", label: "AM (cyclomoteur)" },
	{ value: "A1", label: "A1 (moto légère)" },
	{ value: "A2", label: "A2 (moto intermédiaire)" },
	{ value: "A", label: "A (moto)" },
	{ value: "B", label: "B (voiture)" },
	{ value: "B1", label: "B1 (quadricycle)" },
	{ value: "BE", label: "BE (voiture + remorque)" },
	{ value: "C1", label: "C1 (poids lourd léger)" },
	{ value: "C", label: "C (poids lourd)" },
	{ value: "C1E", label: "C1E" },
	{ value: "CE", label: "CE (poids lourd + remorque)" },
	{ value: "D1", label: "D1 (minibus)" },
	{ value: "D", label: "D (transport de personnes)" },
	{ value: "D1E", label: "D1E" },
	{ value: "DE", label: "DE (bus + remorque)" },
];

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
	"cvStat",
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
	"stat",
]);
export type CVModuleType = z.infer<typeof CVModuleTypeSchema>;
