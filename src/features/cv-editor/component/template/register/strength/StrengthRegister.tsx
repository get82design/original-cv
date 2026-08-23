import { SectionStrengthOne } from "../../components/strength/SectionStregthOne";
import { MiniStrengthOne } from "../../components/strength/MiniStrengthOne";
import { FaThumbsUp } from "react-icons/fa";
import { SectionStrengthTwo } from "../../components/strength/SectionStregthTwo";
import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";

const DefaultRegister = SectionStrengthOne;
const DefaultMiniature = MiniStrengthOne;
const DefaultIcon = FaThumbsUp;

export const StrengthRegister: Record<string, React.ComponentType> = {
	SectionStrengthOne,
	SectionStrengthTwo,
};
export const MiniatureRegister: Record<string, React.ComponentType> = {
	MiniStrengthOne,
};
export const IconRegister: Record<string, React.ComponentType> = {
	FaThumbsUp,
};

export const StrengthRenderer = ({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) => {
	const strengthKey =
		templateConfig?.components?.sectionStrength?.component ??
		"SectionStrengthOne";
	const StrengthComponent = StrengthRegister[strengthKey] ?? DefaultRegister;
	return <StrengthComponent />;
};
export const MiniatureStrengthRenderer = ({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) => {
	const miniatureKey =
		templateConfig?.components?.sectionStrength?.miniature ?? "MiniStrengthOne";
	const MiniatureComponent =
		MiniatureRegister[miniatureKey] ?? DefaultMiniature;
	return <MiniatureComponent />;
};
export const IconStrengthRenderer = ({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) => {
	const iconKey =
		templateConfig?.components?.sectionStrength?.icon ?? "FaThumbsUp";
	const IconComponent = IconRegister[iconKey] ?? DefaultIcon;
	return <IconComponent />;
};
