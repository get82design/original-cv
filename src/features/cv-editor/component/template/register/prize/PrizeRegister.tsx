import { PiMedal } from "react-icons/pi";
import { SectionPrizeOne } from "../../components/prize/SectionPrizeOne";
import { MiniPrizeOne } from "../../components/prize/MiniPrizeOne";
import { SectionPrizeTwo } from "../../components/prize/SectionPrizeTwo";
import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";

const DefaultPrize = SectionPrizeOne;
const DefaultMiniature = MiniPrizeOne;
const DefaultIcon = PiMedal;

export const PrizeRegister: Record<string, React.ComponentType> = {
	SectionPrizeOne,
	SectionPrizeTwo,
};
export const MiniatureRegister: Record<string, React.ComponentType> = {
	MiniPrizeOne,
};
export const IconRegister: Record<string, React.ComponentType> = {
	PiMedal,
};

export function PrizeRenderer({ templateConfig }: { templateConfig: TemplateDefaultStyles }) {
	const prizeKey = templateConfig?.components?.sectionPrize?.component ?? "SectionPrizeOne";
	const PrizeComponent = PrizeRegister[prizeKey] ?? DefaultPrize;
	return <PrizeComponent />;
}
export function MiniaturePrizeRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const miniatureKey = templateConfig?.components?.sectionPrize?.miniature ?? "MiniPrizeOne";
	const MiniatureComponent = MiniatureRegister[miniatureKey] ?? DefaultMiniature;
	return <MiniatureComponent />;
}
export function IconPrizeRenderer({ templateConfig }: { templateConfig: TemplateDefaultStyles }) {
	const iconKey = templateConfig?.components?.sectionPrize?.icon ?? "PiMedal";
	const IconComponent = IconRegister[iconKey] ?? DefaultIcon;
	return <IconComponent />;
}
