import { MdLanguage } from "react-icons/md";
import { SectionLanguageOne } from "../../components/language/SectionLanguageOne";
import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";
import { MiniLanguageOne } from "../../components/language/MiniLanguageOne";
import { SectionLanguageTwo } from "../../components/language/SectionLanguageTwo";

const DefaultLanguage = SectionLanguageOne;
const DefaultMiniature = MiniLanguageOne;
const DefaultIcon = MdLanguage;

export const LanguageRegister: Record<string, React.ComponentType> = {
	SectionLanguageOne,
	SectionLanguageTwo,
};
export const MiniatureRegister: Record<string, React.ComponentType> = {
	MiniLanguageOne,
};
export const IconRegister: Record<string, React.ComponentType> = {
	MdLanguage,
};

export function MiniatureLanguageRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const miniatureKey =
		templateConfig?.components?.sectionLanguage?.miniature ?? "MiniLanguageOne";
	const MiniatureComponent =
		MiniatureRegister[miniatureKey] ?? DefaultMiniature;
	return <MiniatureComponent />;
}
export function IconLanguageRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const iconKey =
		templateConfig?.components?.sectionLanguage?.icon ?? "IconLanguage";
	const IconComponent = IconRegister[iconKey] ?? DefaultIcon;
	return <IconComponent />;
}
export function LanguageRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const languageKey =
		templateConfig?.components?.sectionLanguage?.component ??
		"SectionLanguageOne";
	const LanguageComponent = LanguageRegister[languageKey] ?? DefaultLanguage;
	return <LanguageComponent />;
}
