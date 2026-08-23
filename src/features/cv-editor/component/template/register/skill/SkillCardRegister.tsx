import {
	CardSkillOne,
	type CardSkillOneProps,
} from "../../components/skill/compo/CardSkillOne";

export type SkillCardProps = CardSkillOneProps;

export const SkillCardRegister: Record<
	string,
	React.ComponentType<SkillCardProps>
> = {
	CardSkillOne,
};
