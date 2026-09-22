import {
	CardGroupSkillOne,
	type CardGroupSkillOneProps,
} from "../../components/skill/compo/CardGroupSkillOne";

export type GroupSkillCardProps = CardGroupSkillOneProps;

export const GroupSkillCardRegister: Record<string, React.ComponentType<GroupSkillCardProps>> = {
	CardGroupSkillOne,
};
