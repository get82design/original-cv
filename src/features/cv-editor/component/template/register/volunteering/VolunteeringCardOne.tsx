import {
	CardVolunteeringOne,
	type CardVolunteeringOneProps,
} from "../../components/volunteering/compo/CardVolunteeringOne";

export type VolunteeringCardProps = CardVolunteeringOneProps;

export const VolunteeringCardRegister: Record<
	string,
	React.ComponentType<VolunteeringCardProps>
> = {
	CardVolunteeringOne,
};
