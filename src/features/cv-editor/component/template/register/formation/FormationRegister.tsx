import { MiniFormationOne } from "../../components/formation/MiniFormationOne";
import { SectionFormationOne } from "../../components/formation/SectionFormationOne";
import { GiLevelTwo } from "react-icons/gi";
import { SectionFormationTwo } from "../../components/formation/SectionFormationTwo";
import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";

const DefaultFormation = SectionFormationOne;
const DefaultMiniature = MiniFormationOne;
const DefaultIcon = GiLevelTwo;

export const FormationRegister: Record<string, React.ComponentType> = {
	SectionFormationOne,
	SectionFormationTwo,
};
export const MiniatureRegister: Record<string, React.ComponentType> = {
	MiniFormationOne,
};
export const IconRegister: Record<string, React.ComponentType> = {
	GiLevelTwo,
};

export function MiniatureFormationRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const miniatureKey =
		templateConfig?.components?.sectionFormation?.miniature ?? "MiniFormationOne";
	const MiniatureComponent = MiniatureRegister[miniatureKey] ?? DefaultMiniature;
	return <MiniatureComponent />;
}
export function IconFormationRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const iconKey = templateConfig?.components?.sectionFormation?.icon ?? "IconFormation";
	const IconComponent = IconRegister[iconKey] ?? DefaultIcon;
	return <IconComponent />;
}
export function FormationRenderer({ templateConfig }: { templateConfig: TemplateDefaultStyles }) {
	const FormationKey =
		templateConfig?.components?.sectionFormation?.component ?? "SectionFormationOne";
	const FormationComponent = FormationRegister[FormationKey] ?? DefaultFormation;
	return <FormationComponent />;
}
