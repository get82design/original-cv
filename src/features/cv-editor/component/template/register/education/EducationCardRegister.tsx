import {
	CardEducationOne,
	type CardEducationOneProps,
} from "../../components/education/compo/CardEducationOne";

export type EducationCardProps = CardEducationOneProps;

export const EducationCardRegister: Record<string, React.ComponentType<EducationCardProps>> = {
	CardEducationOne,
};
