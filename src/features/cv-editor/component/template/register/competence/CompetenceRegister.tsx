import { MdBookmarkAdd } from "react-icons/md";
import { MiniCompetenceOne } from "../../components/competence/MiniCompetenceOne";
import { SectionCompetenceOne } from "../../components/competence/SectionCompetenceOne";
import { SectionCompetenceTwo } from "../../components/competence/SectionCompetenceTwo";
import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";

const DefaultCompetence = SectionCompetenceOne;
const DefaultMiniature = MiniCompetenceOne;
const DefaultIcon = MdBookmarkAdd;

export const CompetenceRegister: Record<string, React.ComponentType> = {
	SectionCompetenceOne,
	SectionCompetenceTwo,
};
export const MiniatureRegister: Record<string, React.ComponentType> = {
	MiniCompetenceOne,
};
export const IconRegister: Record<string, React.ComponentType> = {
	MdBookmarkAdd,
};

export function CompetenceRenderer({ templateConfig }: { templateConfig: TemplateDefaultStyles }) {
	const competenceKey =
		templateConfig?.components?.sectionCompetence?.component ?? "SectionCompetenceOne";
	const CompetenceComponent = CompetenceRegister[competenceKey] ?? DefaultCompetence;
	return <CompetenceComponent />;
}
export function MiniatureCompetenceRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const miniatureKey =
		templateConfig?.components?.sectionCompetence?.miniature ?? "MiniCompetenceOne";
	const MiniatureComponent = MiniatureRegister[miniatureKey] ?? DefaultMiniature;
	return <MiniatureComponent />;
}
export function IconCompetenceRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const iconKey = templateConfig?.components?.sectionCompetence?.icon ?? "MdBookmarkAdd";
	const IconComponent = IconRegister[iconKey] ?? DefaultIcon;
	return <IconComponent />;
}
