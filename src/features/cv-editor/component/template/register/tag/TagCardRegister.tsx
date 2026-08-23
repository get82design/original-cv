import {
	CardTagOne,
	type CardTagOneProps,
} from "../../components/tag/compo/CardTagOne";

export type TagCardProps = CardTagOneProps;

export const TagCardRegister: Record<
	string,
	React.ComponentType<TagCardProps>
> = {
	CardTagOne,
};
