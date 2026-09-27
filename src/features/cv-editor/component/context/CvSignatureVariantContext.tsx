import { createContext, type PropsWithChildren, useContext, useState } from "react";
import type { CvSignatureVariantId } from "@/features/cv-editor/utils/cvSignatureVariants";

type CvSignatureVariantContextValue = {
	variant: CvSignatureVariantId;
	setVariant: (variant: CvSignatureVariantId) => void;
	/** Mention « Édité sur … » : éditeur / export seulement, pas les vignettes du catalogue. */
	showMention: boolean;
};

const DEFAULT_VARIANT: CvSignatureVariantId = "minimal";

/**
 * Réglage d'export, pas une donnée du CV : volontairement hors formulaire (pas de save, pas de dirty).
 * Défaut hors provider : la galerie de modèles rend aussi `CvSignature` sans éditeur autour.
 */
const CvSignatureVariantContext = createContext<CvSignatureVariantContextValue>({
	variant: DEFAULT_VARIANT,
	setVariant: () => {},
	showMention: false,
});

export const useCvSignatureVariant = () => useContext(CvSignatureVariantContext);

export const CvSignatureVariantProvider = ({ children }: PropsWithChildren) => {
	const [variant, setVariant] = useState<CvSignatureVariantId>(DEFAULT_VARIANT);

	return (
		<CvSignatureVariantContext.Provider value={{ variant, setVariant, showMention: true }}>
			{children}
		</CvSignatureVariantContext.Provider>
	);
};
