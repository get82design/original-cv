import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";
import { SectionExperienceOne } from "../../components/experience/SectionExperienceOne";
import { MiniExperienceOne } from "../../components/experience/MiniExperienceOne";
import { MdCheck } from "react-icons/md";
import { BsListCheck } from "react-icons/bs";
import { SectionExperienceTwo } from "../../components/experience/SectionExperienceTwo";

// 1. Définis un composant par défaut garanti
const DefaultExperience = SectionExperienceOne;
const DefaultMiniature = MiniExperienceOne;
const DefaultIcon = MdCheck;

export const ExperienceRegister: Record<string, React.ComponentType> = {
	SectionExperienceOne,
	SectionExperienceTwo,
};
export const MiniatureRegister: Record<string, React.ComponentType> = {
	MiniExperienceOne,
};
export const IconRegister: Record<string, React.ComponentType> = {
	BsListCheck,
};

export function MiniatureExperienceRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const miniatureKey =
		templateConfig?.components?.sectionExperience?.miniature ?? "MiniExperienceOne";
	const MiniatureComponent = MiniatureRegister[miniatureKey] ?? DefaultMiniature;
	return <MiniatureComponent />;
}

export function IconExperienceRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const iconKey = templateConfig?.components?.sectionExperience?.icon ?? "IconExperience";
	const IconComponent = IconRegister[iconKey] ?? DefaultIcon;
	return <IconComponent />;
}

export function ExperienceRenderer({ templateConfig }: { templateConfig: TemplateDefaultStyles }) {
	const experienceKey =
		templateConfig?.components?.sectionExperience?.component ?? "SectionExperienceOne";
	const ExperienceComponent = ExperienceRegister[experienceKey] ?? DefaultExperience;
	return <ExperienceComponent />;
}
