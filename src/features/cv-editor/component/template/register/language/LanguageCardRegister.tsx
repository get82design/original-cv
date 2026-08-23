import {
	CardLanguageOne,
	type CardLanguageOneProps,
} from "../../components/language/compo/CardLanguageOne";

export type LanguageCardProps = CardLanguageOneProps;

export const LanguageCardRegister: Record<
	string,
	React.ComponentType<LanguageCardProps>
> = {
	CardLanguageOne,
};
