import {
	CardPublicationOne,
	type CardPublicationOneProps,
} from "../../components/publication/compo/CardPublicationOne";

export type PublicationCardProps = CardPublicationOneProps;

export const PublicationCardRegister: Record<string, React.ComponentType<PublicationCardProps>> = {
	CardPublicationOne,
};
