import {
	OneColumnModel,
	type OneColumnModelProps,
} from "../one-column-model/OneColumnModel";

const DefaultPageLayout = OneColumnModel;

export const PageLayoutRegister: Record<
	string,
	React.ComponentType<OneColumnModelProps>
> = {
	OneColumnModel,
};
