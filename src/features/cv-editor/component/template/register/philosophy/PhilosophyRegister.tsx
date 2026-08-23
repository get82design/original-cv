import { MdFormatQuote } from "react-icons/md";
import { SectionPhilosophyOne } from "../../components/philosophy/SectionPhilosophyOne";
import { MiniPhilosophyOne } from "../../components/philosophy/MiniPhilosophyOne";
import { SectionPhilosophyTwo } from "../../components/philosophy/SectionPhilosophyTwo";
import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";

const DefaultPhilosophy = SectionPhilosophyOne;
const DefaultMiniature = MiniPhilosophyOne;
const DefaultIcon = MdFormatQuote;

export const PhilosophyRegister: Record<string, React.ComponentType> = {
	SectionPhilosophyOne,
	SectionPhilosophyTwo,
};
export const MiniatureRegister: Record<string, React.ComponentType> = {
	MiniPhilosophyOne,
};
export const IconRegister: Record<string, React.ComponentType> = {
	MdFormatQuote,
};

export function MiniaturePhilosophyRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const miniatureKey =
		templateConfig?.components?.sectionPhilosophy?.miniature ??
		"MiniPhilosophyOne";
	const MiniatureComponent =
		MiniatureRegister[miniatureKey] ?? DefaultMiniature;
	return <MiniatureComponent />;
}
export function IconPhilosophyRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const iconKey =
		templateConfig?.components?.sectionPhilosophy?.icon ?? "IconPhilosophy";
	const IconComponent = IconRegister[iconKey] ?? DefaultIcon;
	return <IconComponent />;
}
export function PhilosophyRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const PhilosophyKey =
		templateConfig?.components?.sectionPhilosophy?.component ??
		"SectionPhilosophyOne";
	const PhilosophyComponent =
		PhilosophyRegister[PhilosophyKey] ?? DefaultPhilosophy;
	return <PhilosophyComponent />;
}
