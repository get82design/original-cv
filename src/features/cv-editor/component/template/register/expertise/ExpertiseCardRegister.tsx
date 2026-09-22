import {
	CardExpertiseOne,
	type CardExpertiseOneProps,
} from "../../components/expertise/compo/CardExpertiseOne";

export type ExpertiseCardProps = CardExpertiseOneProps;

export const ExpertiseCardRegister: Record<string, React.ComponentType<ExpertiseCardProps>> = {
	CardExpertiseOne,
};
