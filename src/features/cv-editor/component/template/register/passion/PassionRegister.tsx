import { BsBalloonHeartFill } from "react-icons/bs";
import { MiniPassionOne } from "../../components/passion/MiniPassionOne";
import { SectionPassionOne } from "../../components/passion/SectionPassionOne";
import { SectionPassionTwo } from "../../components/passion/SectionPassionTwo";
import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";

const DefaultPassion = SectionPassionOne;
const DefaultMiniature = MiniPassionOne;
const DefaultIcon = BsBalloonHeartFill;

export const PassionRegister: Record<string, React.ComponentType> = {
	SectionPassionOne,
	SectionPassionTwo,
};
export const MiniatureRegister: Record<string, React.ComponentType> = {
	MiniPassionOne,
};
export const IconRegister: Record<string, React.ComponentType> = {
	BsBalloonHeartFill,
};

export function MiniaturePassionRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const miniatureKey =
		templateConfig?.components?.sectionPassion?.miniature ?? "MiniPassionOne";
	const MiniatureComponent =
		MiniatureRegister[miniatureKey] ?? DefaultMiniature;
	return <MiniatureComponent />;
}
export function IconPassionRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const iconKey =
		templateConfig?.components?.sectionPassion?.icon ?? "IconPassion";
	const IconComponent = IconRegister[iconKey] ?? DefaultIcon;
	return <IconComponent />;
}
export function PassionRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const passionKey =
		templateConfig?.components?.sectionPassion?.component ??
		"SectionPassionOne";
	const PassionComponent = PassionRegister[passionKey] ?? DefaultPassion;
	return <PassionComponent />;
}
