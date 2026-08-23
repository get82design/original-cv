import {
	CardGroupCompetenceOne,
	type CardGroupCompetenceOneProps,
} from "../../components/competence/compo/CardGroupCompetenceOne";

export type GroupCompetenceCardProps = CardGroupCompetenceOneProps;

export const GroupCompetenceCardRegister: Record<
	string,
	React.ComponentType<GroupCompetenceCardProps>
> = {
	CardGroupCompetenceOne,
};
