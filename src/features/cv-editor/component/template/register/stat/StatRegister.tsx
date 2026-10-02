import { SectionStatOne } from "../../components/stat/SectionStatOne";
import { MiniStatOne } from "../../components/stat/MiniStatOne";
import { FaChartBar } from "react-icons/fa";
import { SectionStatTwo } from "../../components/stat/SectionStatTwo";
import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";

const DefaultRegister = SectionStatOne;
const DefaultMiniature = MiniStatOne;
const DefaultIcon = FaChartBar;

export const StatRegister: Record<string, React.ComponentType> = {
	SectionStatOne,
	SectionStatTwo,
};
export const MiniatureRegister: Record<string, React.ComponentType> = {
	MiniStatOne,
};
export const IconRegister: Record<string, React.ComponentType> = {
	FaChartBar,
};

export const StatRenderer = ({ templateConfig }: { templateConfig: TemplateDefaultStyles }) => {
	const statKey = templateConfig?.components?.sectionStat?.component ?? "SectionStatOne";
	const StatComponent = StatRegister[statKey] ?? DefaultRegister;
	return <StatComponent />;
};
export const MiniatureStatRenderer = ({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) => {
	const miniatureKey = templateConfig?.components?.sectionStat?.miniature ?? "MiniStatOne";
	const MiniatureComponent = MiniatureRegister[miniatureKey] ?? DefaultMiniature;
	return <MiniatureComponent />;
};
export const IconStatRenderer = ({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) => {
	const iconKey = templateConfig?.components?.sectionStat?.icon ?? "FaChartBar";
	const IconComponent = IconRegister[iconKey] ?? DefaultIcon;
	return <IconComponent />;
};
