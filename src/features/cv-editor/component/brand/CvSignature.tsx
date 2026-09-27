import { OriginalCvLogo } from "@/components/brand/OriginalCvLogo";
import { logoTokensForCv } from "@/components/brand/logoTokens";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { cvSignatureStyle } from "@/features/cv-editor/utils/cvSignatureVariants";
import type { Color } from "@utils/trpc.types";
import { useFormContext } from "react-hook-form";
import { useCvSignatureVariant } from "../context/CvSignatureVariantContext";

export const SIGNATURE_MENTION = "Édité sur originalcv.fr";

/** Signature bas de page CV — toujours version print (indépendante du dark mode site). */
export const CvSignature = () => {
	const { watch } = useFormContext();
	const primary = watch(FieldNameLayoutGeneral.primaryColor) as Color | null | undefined;
	const tokens = logoTokensForCv(primary);
	const { variant, showMention } = useCvSignatureVariant();
	const style = cvSignatureStyle(variant, primary);

	return (
		// Décor inclus : `captureCvPreview` retire tout ce bloc pour l'export payant.
		<div data-cv-signature className="absolute inset-x-0 bottom-0 z-10 pointer-events-none">
			{style.decoration === "band" && (
				<div
					className="absolute inset-x-0 bottom-0"
					style={{ height: style.decorationHeight, background: style.tintLight }}
				/>
			)}
			{style.decoration === "corners" && (
				// preserveAspectRatio none : les triangles s'étirent sur toute la largeur de page.
				<svg
					className="absolute inset-x-0 bottom-0 w-full"
					height={style.decorationHeight}
					viewBox="0 0 100 32"
					preserveAspectRatio="none"
					aria-hidden="true"
				>
					{/* fill en style inline : `var()` dans un attribut SVG n'est pas fiable partout. */}
					<polygon points="0,32 0,0 34,32" style={{ fill: style.tintDeep }} />
					<polygon points="100,32 100,0 62,32" style={{ fill: style.tintLight }} />
				</svg>
			)}
			<div
				className="absolute inset-x-0 flex items-center justify-end gap-3 px-7"
				style={{ bottom: style.rowBottom, height: style.rowHeight, color: style.textColor }}
			>
				{showMention && (
					<span className="mr-auto text-[11px] font-medium tracking-wide">{SIGNATURE_MENTION}</span>
				)}
				<OriginalCvLogo className="h-7 w-auto" tokens={tokens} />
			</div>
		</div>
	);
};
