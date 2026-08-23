import {
	CardCertificationOne,
	type CardCertificationOneProps,
} from "../../components/certification/compo/CardCertificationOne";

export type CertificationCardProps = CardCertificationOneProps;

export const CertificationCardRegister: Record<
	string,
	React.ComponentType<CertificationCardProps>
> = {
	CardCertificationOne,
};
