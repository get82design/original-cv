import {
	CardCompetenceOne,
	type CardCompetenceOneProps,
} from "../../components/competence/compo/CardCompetenceOne";

export type CompetenceCardProps = CardCompetenceOneProps;

export const CompetenceCardRegister: Record<string, React.ComponentType<CompetenceCardProps>> = {
	CardCompetenceOne,
};
