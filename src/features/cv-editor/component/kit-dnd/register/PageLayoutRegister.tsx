import { OneColumnModel, type OneColumnModelProps } from "../one-column-model/OneColumnModel";
import { TwoColumnCenter } from "../two-columns-model/TwoColumnCenter";
import { TwoColumnSideBar } from "../two-columns-model/TwoColumnSideBar";

export const PageLayoutRegister: Record<string, React.ComponentType<OneColumnModelProps>> = {
	OneColumnModel,
	TwoColumnSideBar,
	TwoColumnCenter,
};
