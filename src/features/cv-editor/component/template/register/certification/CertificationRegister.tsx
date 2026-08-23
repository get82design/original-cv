import { MiniCertificationOne } from "../../components/certification/MiniCertificationOne";
import { SectionCertificationOne } from "../../components/certification/SectionCertificationOne";
import { SectionCertificationTwo } from "../../components/certification/SectionCertificationTwo";
import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";
import { PiCertificate } from "react-icons/pi";

const DefaultCertification = SectionCertificationOne;
const DefaultMiniature = MiniCertificationOne;
const DefaultIcon = PiCertificate;

export const CertificationRegister: Record<string, React.ComponentType> = {
	SectionCertificationOne,
	SectionCertificationTwo,
};
export const MiniatureRegister: Record<string, React.ComponentType> = {
	MiniCertificationOne,
};
export const IconRegister: Record<string, React.ComponentType> = {
	PiCertificate,
};

export function MiniatureCertificationRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const miniatureKey =
		templateConfig?.components?.sectionCertification?.miniature ??
		"MiniCertificationOne";
	const MiniatureComponent =
		MiniatureRegister[miniatureKey] ?? DefaultMiniature;
	return <MiniatureComponent />;
}
export function IconCertificationRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const iconKey =
		templateConfig?.components?.sectionCertification?.icon ??
		"IconCertification";
	const IconComponent = IconRegister[iconKey] ?? DefaultIcon;
	return <IconComponent />;
}
export function CertificationRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	const CertificationKey =
		templateConfig?.components?.sectionCertification?.component ??
		"SectionCertificationOne";
	const CertificationComponent =
		CertificationRegister[CertificationKey] ?? DefaultCertification;
	return <CertificationComponent />;
}
