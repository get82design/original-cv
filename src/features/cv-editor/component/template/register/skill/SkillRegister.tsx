import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";
import { MdTag } from "react-icons/md";
import { MiniSkillOne } from "../../components/skill/MiniSkillOne";
import { SectionSkillOne } from "../../components/skill/SectionSkillOne";
import { SectionSkillTwo } from "../../components/skill/SectionSkillTwo";

const DefaultSkill = SectionSkillOne;
const DefaultMiniature = MiniSkillOne;
const DefaultIcon = MdTag;

export const SkillRegister: Record<string, React.ComponentType> = {
	SectionSkillOne,
	SectionSkillTwo,
};
export const MiniatureRegister: Record<string, React.ComponentType> = {
	MiniSkillOne,
};
export const IconRegister: Record<string, React.ComponentType> = {
	MdTag,
};

export function MiniatureSkillRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const miniatureKey = templateConfig?.components?.sectionSkill?.miniature ?? "MiniSkillOne";
	const MiniatureComponent = MiniatureRegister[miniatureKey] ?? DefaultMiniature;
	return <MiniatureComponent />;
}
export function IconSkillRenderer({ templateConfig }: { templateConfig: TemplateDefaultStyles }) {
	const iconKey = templateConfig?.components?.sectionSkill?.icon ?? "MdTag";
	const IconComponent = IconRegister[iconKey] ?? DefaultIcon;
	return <IconComponent />;
}
export function SkillRenderer({ templateConfig }: { templateConfig: TemplateDefaultStyles }) {
	const skillKey = templateConfig?.components?.sectionSkill?.component ?? "SectionSkillOne";
	const SkillComponent = SkillRegister[skillKey] ?? DefaultSkill;
	return <SkillComponent />;
}
