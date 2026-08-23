import { MdArticle } from "react-icons/md";
import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";
import { SectionPublicationOne } from "../../components/publication/SectionPublicationOne";
import { SectionPublicationTwo } from "../../components/publication/SectionPublicationTwo";
import { MiniPublicationOne } from "../../components/publication/MiniPublicationOne";

// 1. Définis un composant par défaut garanti
const DefaultPublication = SectionPublicationOne;
const DefaultMiniature = MiniPublicationOne;
const DefaultIcon = MdArticle;

export const PublicationRegister: Record<string, React.ComponentType> = {
	SectionPublicationOne,
	SectionPublicationTwo,
};
export const MiniatureRegister: Record<string, React.ComponentType> = {
	MiniPublicationOne,
};
export const IconRegister: Record<string, React.ComponentType> = {
	MdArticle,
};

export function MiniaturePublicationRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const miniatureKey =
		templateConfig?.components?.sectionPublication?.miniature ??
		"MiniPublicationOne";
	const MiniatureComponent =
		MiniatureRegister[miniatureKey] ?? DefaultMiniature;
	return <MiniatureComponent />;
}
export function IconPublicationRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const iconKey =
		templateConfig?.components?.sectionPublication?.icon ?? "IconPublication";
	const IconComponent = IconRegister[iconKey] ?? DefaultIcon;
	return <IconComponent />;
}
export function PublicationRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const PublicationKey =
		templateConfig?.components?.sectionPublication?.component ??
		"SectionPublicationOne";
	const PublicationComponent =
		PublicationRegister[PublicationKey] ?? DefaultPublication;
	return <PublicationComponent />;
}
