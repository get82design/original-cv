import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema";

export const useChangeTextFormat = (dataInput: {
	model: BaseTextSettings;
	changeSize: "1px" | "2px" | "4px";
}) => {
	let size: string = dataInput.model?.sizeModel;
	let weight: number = dataInput.model?.weightModel;

	const getSize = () => {
		if (dataInput.model?.sizeSelect === "xs") {
			size = `calc(${dataInput.model?.sizeModel} - 2 * ${dataInput.changeSize})`;
		}
		if (dataInput.model?.sizeSelect === "sm") {
			size = `calc(${dataInput.model?.sizeModel} - ${dataInput.changeSize})`;
		}
		if (dataInput.model?.sizeSelect === "lg") {
			size = `calc(${dataInput.model?.sizeModel} + ${dataInput.changeSize})`;
		}
		if (dataInput.model?.sizeSelect === "xl") {
			size = `calc(${dataInput.model?.sizeModel} + 2 * ${dataInput.changeSize})`;
		}
		return size;
	};

	const getWeight = () => {
		if (dataInput.model?.weightSelect === "xs") {
			weight = dataInput.model?.weightModel - 200;
		}
		if (dataInput.model?.weightSelect === "sm") {
			weight = dataInput.model?.weightModel - 100;
		}
		if (dataInput.model?.weightSelect === "lg") {
			weight = dataInput.model?.weightModel + 100;
		}
		if (dataInput.model?.weightSelect === "xl") {
			weight = dataInput.model?.weightModel + 200;
		}
		// return fontweight.find((font) => font.value === weight).name;
		return weight;
	};

	return { getSize, getWeight };
};

export function getCvTypographyVars(typography?: {
	fontFamily?: FontSlug;
	roles?: Partial<
		Record<"body" | "headerTitle" | "headerSubTitle" | "sectionTitle" | "accent", FontSlug>
	>;
}) {
	const toVar = (slug: FontSlug) => `var(${FONT_CATALOG[slug].cssVar})`;
	const userFont = typography?.fontFamily ?? "inter";
	const roles = typography?.roles ?? {};
	const templateBody = roles.body ?? userFont;

	const resolve = (role?: FontSlug) => toVar(role && role !== templateBody ? role : userFont);

	return {
		"--cv-font-body": toVar(userFont),
		"--cv-font-headerTitle": resolve(roles.headerTitle),
		"--cv-font-headerSubTitle": resolve(roles.headerSubTitle),
		"--cv-font-sectionTitle": resolve(roles.sectionTitle),
		"--cv-font-accent": resolve(roles.accent ?? roles.headerTitle),
	};
}

export const FONT_CATALOG = {
	inter: { label: "Inter", cssVar: "--font-inter" },
	playfair: { label: "Playfair Display", cssVar: "--font-playfair" },
	lora: { label: "Lora", cssVar: "--font-lora" },
	sourceSans: { label: "Source Sans Pro", cssVar: "--font-sourceSans" },
} as const;

export type FontSlug = keyof typeof FONT_CATALOG;
