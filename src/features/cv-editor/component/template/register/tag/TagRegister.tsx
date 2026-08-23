import { MdTag } from "react-icons/md";
import { MiniTagOne } from "../../components/tag/MiniTagOne";
import { SectionTagOne } from "../../components/tag/SectionTagOne";
import { SectionTagTwo } from "../../components/tag/SectionTagTwo";
import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";

const DefaultRegister = SectionTagOne;
const DefaultMiniature = MiniTagOne;
const DefaultIcon = MdTag;

export const TagRegister: Record<string, React.ComponentType> = {
	SectionTagOne,
	SectionTagTwo,
};
export const MiniatureRegister: Record<string, React.ComponentType> = {
	MiniTagOne,
};
export const IconTagRegister: Record<string, React.ComponentType> = {
	MdTag,
};

export const TagRenderer = ({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) => {
	const tagKey =
		templateConfig?.components?.sectionTag?.component ?? "SectionTagOne";
	const TagComponent = TagRegister[tagKey] ?? DefaultRegister;
	return <TagComponent />;
};
export const MiniatureTagRenderer = ({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) => {
	const miniatureKey =
		templateConfig?.components?.sectionTag?.miniature ?? "MiniTagOne";
	const MiniatureComponent =
		MiniatureRegister[miniatureKey] ?? DefaultMiniature;
	return <MiniatureComponent />;
};
export const IconTagRenderer = ({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) => {
	const iconKey = templateConfig?.components?.sectionTag?.icon ?? "MdTag";
	const IconComponent = IconTagRegister[iconKey] ?? DefaultIcon;
	return <IconComponent />;
};
