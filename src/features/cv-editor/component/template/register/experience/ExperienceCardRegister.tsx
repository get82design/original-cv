import {
	CardExperienceOne,
	type CardExperienceOneProps,
} from "../../components/experience/compo/CardExperienceOne";

export type ExperienceCardProps = CardExperienceOneProps;

export const ExperienceCardRegister: Record<
	string,
	React.ComponentType<ExperienceCardProps>
> = {
	CardExperienceOne,
};
