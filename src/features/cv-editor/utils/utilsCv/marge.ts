export const ChangePaddingDocument = () => {
	const { watch } = useFormContext();
	const watchMarge = watch("layoutGeneral.layout.marge");
	if (watchMarge === "sm") {
		return "p-8";
	}
	if (watchMarge === "md") {
		return "p-12";
	}
	if (watchMarge === "lg") {
		return "p-16";
	}
	return "p-8";
};

/**
 * Padding des colonnes 2-col.
 * Si header en `top`, pas de `pt` : le bandeau a déjà la marge haute, sinon double espace.
 */
export function columnPaddingForHeaderPlacement(
	paddingDoc: string,
	headerPlacement: "top" | "sidebar" | "split",
): string {
	if (headerPlacement !== "top") return paddingDoc;
	const withoutTop: Record<string, string> = {
		"p-8": "px-8 pb-8 pt-0",
		"p-12": "px-12 pb-12 pt-0",
		"p-16": "px-16 pb-16 pt-0",
	};
	return withoutTop[paddingDoc] ?? paddingDoc;
}

import type { ElmSize } from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";

// export const ChangePaddingDocumentApercu = (marge: ElmSize) => {
//     if (marge === 'sm') {
//       return 'p-8'
//     }
//     if (marge === 'md') {
//       return 'p-12'
//     }
//     if (marge === 'lg') {
//       return 'p-16'
//     }
//     return 'p-8'
// }

export const ChangeSpaceDocument = () => {
	const { watch } = useFormContext();
	const watchSpace = watch("layoutGeneral.layout.space");
	if (watchSpace === "sm") {
		return "py-0";
	}
	if (watchSpace === "md") {
		return "py-1";
	}
	if (watchSpace === "lg") {
		return "py-2";
	}
	return "py-1";
};

export const ChangeSpaceDocumentApercu = (space: ElmSize) => {
	if (space === "sm") {
		return "py-0";
	}
	if (space === "md") {
		return "py-1";
	}
	if (space === "lg") {
		return "py-2";
	}
	return "py-1";
};

export const GetAlignementHeader = (textAlign: "left" | "center" | "right") => {
	return textAlign === "center"
		? "justify-center"
		: textAlign === "right"
			? "justify-end"
			: "justify-start";
};
