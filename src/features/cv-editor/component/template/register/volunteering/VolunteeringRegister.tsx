import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";
import { MdOutlineVolunteerActivism } from "react-icons/md";
import { SectionVolunteeringOne } from "../../components/volunteering/SectionVolunteeringOne";
import { MiniVolunteeringOne } from "../../components/volunteering/MiniVolunteeringOne";
import { SectionVolunteeringTwo } from "../../components/volunteering/SectionVolunteeringTwo";

const DefaultVolunteering = SectionVolunteeringOne;
const DefaultMiniature = MiniVolunteeringOne;
const DefaultIcon = MdOutlineVolunteerActivism;

export const VolunteeringRegister: Record<string, React.ComponentType> = {
	SectionVolunteeringOne,
	SectionVolunteeringTwo,
};
export const MiniatureRegister: Record<string, React.ComponentType> = {
	MiniVolunteeringOne,
};
export const IconVolunteeringRegister: Record<string, React.ComponentType> = {
	MdOutlineVolunteerActivism,
};

export function VolunteeringRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const VolunteeringKey =
		templateConfig?.components?.sectionVolunteering?.component ??
		"SectionVolunteeringOne";
	const VolunteeringComponent =
		VolunteeringRegister[VolunteeringKey] ?? DefaultVolunteering;
	return <VolunteeringComponent />;
}
export function MiniatureVolunteeringRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const MiniatureVolunteeringKey =
		templateConfig?.components?.sectionVolunteering?.miniature ??
		"MiniVolunteeringOne";
	const MiniatureVolunteeringComponent =
		MiniatureRegister[MiniatureVolunteeringKey] ?? DefaultMiniature;
	return <MiniatureVolunteeringComponent />;
}
export function IconVolunteeringRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const IconVolunteeringKey =
		templateConfig?.components?.sectionVolunteering?.icon ??
		"MdOutlineVolunteerActivism";
	const IconVolunteeringComponent =
		IconVolunteeringRegister[IconVolunteeringKey] ?? DefaultIcon;
	return <IconVolunteeringComponent />;
}
