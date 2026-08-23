import {
	CardFormationOne,
	type CardFormationOneProps,
} from "../../components/formation/compo/CardFormationOne";

export type FormationCardProps = CardFormationOneProps;

export const FormationCardRegister: Record<
	string,
	React.ComponentType<FormationCardProps>
> = {
	CardFormationOne,
};
