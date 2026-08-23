import { HeaderOne } from "../../components/headers/HeaderOne";
import { HeaderTwo } from "../../components/headers/HeaderTwo";
import { HeaderThree } from "../../components/headers/HeaderThree";
import type { TemplateDefaultStyles } from "@/services/schemas/cvTemplate.schema";

// 1. Définis un composant par défaut garanti
const DefaultHeader = HeaderOne;

// 2. Type le registre de façon stricte avec React.ElementType
export const HeaderRegister: Record<string, React.ComponentType> = {
	HeaderOne,
	HeaderTwo,
	HeaderThree,
};

export function HeaderRenderer({
	templateConfig,
}: {
	templateConfig: TemplateDefaultStyles;
}) {
	// 3. Récupère la clé de manière sûre
	const headerKey = templateConfig?.components?.sectionHeader ?? "HeaderOne";
	// 4. Garantis à TypeScript que HeaderComponent N'EST PAS undefined
	const HeaderComponent = HeaderRegister[headerKey] ?? DefaultHeader;
	return <HeaderComponent />;
}
