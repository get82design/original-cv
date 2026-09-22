import {
	CardProjectOne,
	type CardProjectOneProps,
} from "../../components/project/compo/CardProjectOne";

export type ProjectCardProps = CardProjectOneProps;

export const ProjectCardRegister: Record<string, React.ComponentType<ProjectCardProps>> = {
	CardProjectOne,
};
