import { OriginalCvLogo } from "@/components/brand/OriginalCvLogo";
import { logoTokensForCv } from "@/components/brand/logoTokens";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import type { Color } from "@utils/trpc.types";
import { useFormContext } from "react-hook-form";

/** Signature bas de page CV — toujours version print (indépendante du dark mode site). */
export const CvSignature = () => {
	const { watch } = useFormContext();
	const primary = watch(FieldNameLayoutGeneral.primaryColor) as
		| Color
		| null
		| undefined;
	const tokens = logoTokensForCv(primary);

	return (
		<div
			data-cv-signature
			className="absolute bottom-3 right-7 z-10 pointer-events-none"
		>
			<OriginalCvLogo className="h-7 w-auto" tokens={tokens} />
		</div>
	);
};
