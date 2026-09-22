import {
	CardStrengthOne,
	type CardStrengthOneProps,
} from "../../components/strength/compo/CardStrengthOne";

export type StrengthCardProps = CardStrengthOneProps;

export const StrengthCardRegister: Record<string, React.ComponentType<StrengthCardProps>> = {
	CardStrengthOne,
};
