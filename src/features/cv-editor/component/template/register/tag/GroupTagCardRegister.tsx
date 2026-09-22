import {
	CardGroupTagOne,
	type CardGroupTagOneProps,
} from "../../components/tag/compo/CardGroupTagOne";

export type GroupTagCardProps = CardGroupTagOneProps;

export const GroupTagCardRegister: Record<string, React.ComponentType<GroupTagCardProps>> = {
	CardGroupTagOne,
};
