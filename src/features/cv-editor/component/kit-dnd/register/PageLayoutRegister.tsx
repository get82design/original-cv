import {
	OneColumnModel,
	type OneColumnModelProps,
} from "../one-column-model/OneColumnModel";
import { TwoColumnSideBar } from "../two-columns-model/TwoColumnSideBar";

export const PageLayoutRegister: Record<
	string,
	React.ComponentType<OneColumnModelProps>
> = {
	OneColumnModel,
	TwoColumnSideBar,
};
