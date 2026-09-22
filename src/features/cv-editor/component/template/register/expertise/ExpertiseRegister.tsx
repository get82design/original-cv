import { SectionExpertiseOne } from "../../components/expertise/SectionExpertiseOne";
import { MiniExpertiseOne } from "../../components/expertise/MiniExpertiseOne";
import { RxMixerVertical } from "react-icons/rx";
import { SectionExpertiseTwo } from "../../components/expertise/SectionExpertiseTwo";
import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";

const DefaultExpertise = SectionExpertiseOne;
const DefaultMiniature = MiniExpertiseOne;
const DefaultIcon = RxMixerVertical;

export const ExpertiseRegister: Record<string, React.ComponentType> = {
	SectionExpertiseOne,
	SectionExpertiseTwo,
};
export const MiniatureRegister: Record<string, React.ComponentType> = {
	MiniExpertiseOne,
};
export const IconRegister: Record<string, React.ComponentType> = {
	RxMixerVertical,
};

export function ExpertiseRenderer({ templateConfig }: { templateConfig: TemplateDefaultStyles }) {
	const ExpertiseKey =
		templateConfig?.components?.sectionExpertise?.component ?? "SectionExpertiseOne";
	const ExpertiseComponent = ExpertiseRegister[ExpertiseKey] ?? DefaultExpertise;
	return <ExpertiseComponent />;
}
export function MiniatureExpertiseRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const miniatureKey =
		templateConfig?.components?.sectionExpertise?.miniature ?? "MiniExpertiseOne";
	const MiniatureComponent = MiniatureRegister[miniatureKey] ?? DefaultMiniature;
	return <MiniatureComponent />;
}
export function IconExpertiseRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const iconKey = templateConfig?.components?.sectionExpertise?.icon ?? "IconExpertise";
	const IconComponent = IconRegister[iconKey] ?? DefaultIcon;
	return <IconComponent />;
}
