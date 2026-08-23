import {
	CardPrizeOne,
	type CardPrizeOneProps,
} from "../../components/prize/compo/CardPrizeOne";

export type PrizeCardProps = CardPrizeOneProps;

export const PrizeCardRegister: Record<
	string,
	React.ComponentType<PrizeCardProps>
> = {
	CardPrizeOne,
};
