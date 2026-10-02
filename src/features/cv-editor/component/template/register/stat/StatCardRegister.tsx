import { CardStatOne, type CardStatOneProps } from "../../components/stat/compo/CardStatOne";

export type StatCardProps = CardStatOneProps;

export const StatCardRegister: Record<string, React.ComponentType<StatCardProps>> = {
	CardStatOne,
};
