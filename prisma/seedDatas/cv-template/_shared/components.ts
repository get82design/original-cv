import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";

type Components = NonNullable<TemplateDefaultStyles["components"]>;
const labels = {
	sectionExperience: {
		Label: "Expérience",
		icon: "BsListCheck" as const,
		miniature: "MiniExperienceOne" as const,
		item: "CardExperienceOne" as const,
	},
	sectionDescription: {
		Label: "Présentation",
		icon: "BsPerson" as const,
		miniature: "MiniDescriptionOne" as const,
	},
	sectionEducation: {
		Label: "Diplômes",
		icon: "MdSchool" as const,
		miniature: "MiniEducationOne" as const,
		item: "CardEducationOne" as const,
	},
	sectionLanguage: {
		Label: "Langues",
		icon: "MdLanguage" as const,
		miniature: "MiniLanguageOne" as const,
		item: "CardLanguageOne" as const,
	},
	sectionSkill: {
		Label: "Compétences",
		icon: "MdTag" as const,
		miniature: "MiniSkillOne" as const,
		item: "CardSkillOne" as const,
		group: "CardGroupSkillOne" as const,
	},
	sectionCompetence: {
		Label: "Compétences",
		icon: "MdTag" as const,
		miniature: "MiniCompetenceOne" as const,
		item: "CardCompetenceOne" as const,
		group: "CardGroupCompetenceOne" as const,
	},
	sectionTag: {
		Label: "Tags",
		icon: "MdTag" as const,
		miniature: "MiniTagOne" as const,
		item: "CardTagOne" as const,
		group: "CardGroupTagOne" as const,
	},
	sectionSocialMedia: {
		Label: "Réseaux sociaux",
		icon: "FaGlobe" as const,
		miniature: "MiniSocialMediaOne" as const,
		item: "CardSocialMediaOne" as const,
	},
	sectionPassion: {
		Label: "Passions",
		icon: "BsBalloonHeartFill" as const,
		miniature: "MiniPassionOne" as const,
		item: "CardPassionOne" as const,
	},
	sectionProject: {
		Label: "Projets",
		icon: "GoProject" as const,
		miniature: "MiniProjectOne" as const,
		item: "CardProjectOne" as const,
	},
	sectionExpertise: {
		Label: "Expertises",
		icon: "RxMixerVertical" as const,
		miniature: "MiniExpertiseOne" as const,
		item: "CardExpertiseOne" as const,
	},
	sectionStrength: {
		Label: "Points forts",
		icon: "FaThumbsUp" as const,
		miniature: "MiniStrengthOne" as const,
		item: "CardStrengthOne" as const,
	},
	sectionStat: {
		Label: "En nombres",
		icon: "FaChartBar" as const,
		miniature: "MiniStatOne" as const,
		item: "CardStatOne" as const,
	},
	sectionPhilosophy: {
		Label: "Philosophie",
		icon: "FaQuoteLeft" as const,
		miniature: "MiniPhilosophyOne" as const,
	},
	sectionFormation: {
		Label: "Formations",
		icon: "GiLevelTwo" as const,
		miniature: "MiniFormationOne" as const,
		item: "CardFormationOne" as const,
	},
	sectionCertification: {
		Label: "Certifications",
		icon: "PiCertificate" as const,
		miniature: "MiniCertificationOne" as const,
		item: "CardCertificationOne" as const,
	},
	sectionPrize: {
		Label: "Prix",
		icon: "PiMedal" as const,
		miniature: "MiniPrizeOne" as const,
		item: "CardPrizeOne" as const,
	},
	sectionPublication: {
		Label: "Publications",
		icon: "MdArticle" as const,
		miniature: "MiniPublicationOne" as const,
		item: "CardPublicationOne" as const,
	},
	sectionAchievement: {
		Label: "Réalisations",
		icon: "GiAchievement" as const,
		miniature: "MiniAchievementOne" as const,
		item: "CardAchievementOne" as const,
	},
	sectionVolunteering: {
		Label: "Volontariat",
		icon: "MdOutlineVolunteerActivism" as const,
		miniature: "MiniVolunteeringOne" as const,
		item: "CardVolunteeringOne" as const,
	},
};

export function buildComponents(opts: {
	pageLayout?: Components["pageLayout"];
	sectionHeader: Components["sectionHeader"];
	variant: 1 | 2;
}): Components {
	const v = opts.variant === 1 ? "One" : "Two";
	return {
		pageLayout: opts.pageLayout ?? "OneColumnModel",
		sectionHeader: opts.sectionHeader,
		sectionExperience: { ...labels.sectionExperience, component: `SectionExperience${v}` },
		sectionDescription: { ...labels.sectionDescription, component: `SectionDescription${v}` },
		sectionEducation: { ...labels.sectionEducation, component: `SectionEducation${v}` },
		sectionLanguage: { ...labels.sectionLanguage, component: `SectionLanguage${v}` },
		sectionSkill: { ...labels.sectionSkill, component: `SectionSkill${v}` },
		sectionCompetence: { ...labels.sectionCompetence, component: `SectionCompetence${v}` },
		sectionTag: { ...labels.sectionTag, component: `SectionTag${v}` },
		sectionSocialMedia: { ...labels.sectionSocialMedia, component: `SectionSocialMedia${v}` },
		sectionPassion: { ...labels.sectionPassion, component: `SectionPassion${v}` },
		sectionProject: { ...labels.sectionProject, component: `SectionProject${v}` },
		sectionExpertise: { ...labels.sectionExpertise, component: `SectionExpertise${v}` },
		sectionStrength: { ...labels.sectionStrength, component: `SectionStrength${v}` },
		sectionStat: { ...labels.sectionStat, component: `SectionStat${v}` },
		sectionPhilosophy: { ...labels.sectionPhilosophy, component: `SectionPhilosophy${v}` },
		sectionFormation: { ...labels.sectionFormation, component: `SectionFormation${v}` },
		sectionCertification: { ...labels.sectionCertification, component: `SectionCertification${v}` },
		sectionPrize: { ...labels.sectionPrize, component: `SectionPrize${v}` },
		sectionPublication: { ...labels.sectionPublication, component: `SectionPublication${v}` },
		sectionAchievement: { ...labels.sectionAchievement, component: `SectionAchievement${v}` },
		sectionVolunteering: { ...labels.sectionVolunteering, component: `SectionVolunteering${v}` },
	} as Components;
}
