import type { ItemGeneralProps } from "@utils/type";
import { LanguageRegister } from "../../template/register/language/LanguageRegister";
import { ExperienceRegister } from "../../template/register/experience/ExperienceRegister";
import { LanguageSectionMenu } from "../../template/components/language/compo/LanguageSectionMenu";
import { DescriptionRegister } from "../../template/register/description/DescriptionRegister";
import { EducationRegister } from "../../template/register/education/EducationRegister";
import { SkillRegister } from "../../template/register/skill/SkillRegister";
import { ProjectRegister } from "../../template/register/project/ProjectRegister";
import { SocialMediaRegister } from "../../template/register/social-media/SocialMediaRegister";
import { StrengthRegister } from "../../template/register/strength/StrengthRegister";
import { StatRegister } from "../../template/register/stat/StatRegister";
import { FormationRegister } from "../../template/register/formation/FormationRegister";
import { CertificationRegister } from "../../template/register/certification/CertificationRegister";
import { PrizeRegister } from "../../template/register/prize/PrizeRegister";
import { PassionRegister } from "../../template/register/passion/PassionRegister";
import { ExpertiseRegister } from "../../template/register/expertise/ExpertiseRegister";
import { VolunteeringRegister } from "../../template/register/volunteering/VolunteeringRegister";
import { PublicationRegister } from "../../template/register/publication/PublicationRegister";
import { AchievementRegister } from "../../template/register/achievement/AchievementRegister";
import { CompetenceRegister } from "../../template/register/competence/CompetenceRegister";
import { TagRegister } from "../../template/register/tag/TagRegister";
import { PhilosophyRegister } from "../../template/register/philosophy/PhilosophyRegister";
import { PassionSectionMenu } from "../../template/components/passion/compo/PassionSectionMenu";
import { PhilosophySectionMenu } from "../../template/components/philosophy/PhilosophySectionMenu";
import { ExpertiseSectionMenu } from "../../template/components/expertise/compo/ExpertiseSectionMenu";
import { EducationSectionMenu } from "../../template/components/education/compo/EducationSectionMenu";
import { FormationSectionMenu } from "../../template/components/formation/compo/FormationSectionMenu";
import { StrengthSectionMenu } from "../../template/components/strength/compo/StrengthSectionMenu";
import { StatSectionMenu } from "../../template/components/stat/compo/StatSectionMenu";
import { CertificationSectionMenu } from "../../template/components/certification/compo/CertificationSectionMenu";
import { PrizeSectionMenu } from "../../template/components/prize/compo/PrizeSectionMenu";
import { SocialMediaSectionMenu } from "../../template/components/social-media/compo/SocialMediaSectionMenu";
import { SkillGroupSectionMenu } from "../../template/components/skill/compo/SkillGroupSectionMenu";
import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";

export type SectionItem = ItemGeneralProps & {
	sectionMenu?: React.ReactNode;
	column?: number;
};

type TemplateComponents = NonNullable<TemplateDefaultStyles["components"]>;
type SectionConfigKey = {
  [K in keyof TemplateComponents]: TemplateComponents[K] extends { component: string }
    ? K
    : never;
}[keyof TemplateComponents];
type CatalogEntry = {
  id: string;
  configKey: SectionConfigKey; // plus "string"
  register: Record<string, React.ComponentType>;
  fallback: string;
  menu?: () => React.ReactNode;
};

export const sectionCatalog: Record<string, CatalogEntry> = {
	experience: {
		id: "section-experience",
		configKey: "sectionExperience",
		register: ExperienceRegister,
		fallback: "SectionExperienceOne",
	},
	language: {
		id: "section-language",
		configKey: "sectionLanguage",
		register: LanguageRegister,
		fallback: "SectionLanguageOne",
		menu: () => <LanguageSectionMenu />,
	},
	description: {
		id: "section-description",
		configKey: "sectionDescription",
		register: DescriptionRegister,
		fallback: "SectionDescriptionOne",
	},
	education: {
		id: "section-education",
		configKey: "sectionEducation",
		register: EducationRegister,
		fallback: "SectionEducationOne",
		menu: () => <EducationSectionMenu />,
	},
	skill: {
		id: "section-skill",
		configKey: "sectionSkill",
		register: SkillRegister,
		fallback: "SectionSkillOne",
		menu: () => <SkillGroupSectionMenu />,
	},
	project: {
		id: "section-project",
		configKey: "sectionProject",
		register: ProjectRegister,
		fallback: "SectionProjectOne",
	},
	socialMedia: {
		id: "section-socialMedia",
		configKey: "sectionSocialMedia",
		register: SocialMediaRegister,
		fallback: "SectionSocialMediaOne",
		menu: () => <SocialMediaSectionMenu />,
	},
	strength: {
		id: "section-strength",
		configKey: "sectionStrength",
		register: StrengthRegister,
		fallback: "SectionStrengthOne",
		menu: () => <StrengthSectionMenu />,
	},
	stat: {
		id: "section-stat",
		configKey: "sectionStat",
		register: StatRegister,
		fallback: "SectionStatOne",
		menu: () => <StatSectionMenu />,
	},
	formation: {
		id: "section-formation",
		configKey: "sectionFormation",
		register: FormationRegister,
		fallback: "SectionFormationOne",
		menu: () => <FormationSectionMenu />,
	},
	certification: {
		id: "section-certification",
		configKey: "sectionCertification",
		register: CertificationRegister,
		fallback: "SectionCertificationOne",
		menu: () => <CertificationSectionMenu />,
	},
	prize: {
		id: "section-prize",
		configKey: "sectionPrize",
		register: PrizeRegister,
		fallback: "SectionPrizeOne",
		menu: () => <PrizeSectionMenu />,
	},
	passion: {
		id: "section-passion",
		configKey: "sectionPassion",
		register: PassionRegister,
		fallback: "SectionPassionOne",
		menu: () => <PassionSectionMenu />,
	},
	expertise: {
		id: "section-expertise",
		configKey: "sectionExpertise",
		register: ExpertiseRegister,
		fallback: "SectionExpertiseOne",
		menu: () => <ExpertiseSectionMenu />,
	},
	volunteering: {
		id: "section-volunteering",
		configKey: "sectionVolunteering",
		register: VolunteeringRegister,
		fallback: "SectionVolunteeringOne",
	},
	publication: {
		id: "section-publication",
		configKey: "sectionPublication",
		register: PublicationRegister,
		fallback: "SectionPublicationOne",
	},
	achievement: {
		id: "section-achievement",
		configKey: "sectionAchievement",
		register: AchievementRegister,
		fallback: "SectionAchievementOne",
	},
	competence: {
		id: "section-competence",
		configKey: "sectionCompetence",
		register: CompetenceRegister,
		fallback: "SectionCompetenceOne",
	},
	tag: {
		id: "section-tag",
		configKey: "sectionTag",
		register: TagRegister,
		fallback: "SectionTagOne",
	},
	philosophy: {
		id: "section-philosophy",
		configKey: "sectionPhilosophy",
		register: PhilosophyRegister,
		fallback: "SectionPhilosophyOne",
		menu: () => <PhilosophySectionMenu />,
	},
};

export function buildItemUse(
	modules: Array<{
		type: string;
		order: number;
		isActive: boolean;
		column?: number;
	}>,
	templateConfig: TemplateDefaultStyles | null | undefined,
	column?: number, // plus tard : filtrer par colonne
): SectionItem[] {
	if (!modules) return [];

	return modules
		.filter((m) => m.isActive)
		.filter((m) => column == null || (m.column ?? 0) === column)
		.map((mod) => {
			const entry = sectionCatalog[mod.type];
			if (!entry) return null;
			const key = templateConfig?.components?.[entry.configKey]?.component ?? entry.fallback;
			return {
				id: entry.id,
				order: mod.order,
				column: mod.column ?? 0,
				content: entry.register[key] ?? entry.register[entry.fallback]!,
				sectionMenu: entry.menu?.(),
			} satisfies SectionItem;
		})
		.filter(Boolean)
		.sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0)) as SectionItem[];
}
