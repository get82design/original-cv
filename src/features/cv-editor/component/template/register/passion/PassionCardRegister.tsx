import {
	CardPassionOne,
	type CardPassionOneProps,
} from "../../components/passion/compo/CardPassionOne";

export type PassionCardProps = CardPassionOneProps;

export const PassionCardRegister: Record<string, React.ComponentType<PassionCardProps>> = {
	CardPassionOne,
};
