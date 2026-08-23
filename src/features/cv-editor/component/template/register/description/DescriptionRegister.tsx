import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";
import { BsPerson } from "react-icons/bs";
import { MiniDescriptionOne } from "../../components/description/MiniDescriptionOne";
import { SectionDescriptionOne } from "../../components/description/SectionDescriptionOne";
import { SectionDescriptionTwo } from "../../components/description/SectionDescriptionTwo";

// 1. Définis un composant par défaut garanti
const DefaultDescription = SectionDescriptionOne;
const DefaultMiniature = MiniDescriptionOne;
const DefaultIcon = BsPerson;

export const DescriptionRegister: Record<string, React.ComponentType> = {
	SectionDescriptionOne,
	SectionDescriptionTwo,
};
export const MiniatureRegister: Record<string, React.ComponentType> = {
	MiniDescriptionOne,
};
export const IconRegister: Record<string, React.ComponentType> = {
	BsPerson,
};

export function MiniatureExperienceRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const miniatureKey =
		templateConfig?.components?.sectionDescription?.miniature ??
		"MiniDescriptionOne";
	const MiniatureComponent =
		MiniatureRegister[miniatureKey] ?? DefaultMiniature;
	return <MiniatureComponent />;
}
export function IconExperienceRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const iconKey =
		templateConfig?.components?.sectionDescription?.icon ?? "IconDescription";
	const IconComponent = IconRegister[iconKey] ?? DefaultIcon;
	return <IconComponent />;
}
export function DescriptionRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const descriptionKey =
		templateConfig?.components?.sectionDescription?.component ??
		"SectionDescriptionOne";
	const DescriptionComponent =
		DescriptionRegister[descriptionKey] ?? DefaultDescription;
	return <DescriptionComponent />;
}
