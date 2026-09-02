import { minimalTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";

export const minimal = defineTemplate({
	name: "Minimal",
	slug: "minimal-line-x",
	tokens: minimalTokens,
	primaryColor: { name: "lime", primary: "-500" },
	sectionHeader: "HeaderFour",
	variant: 2,
	layout: {
		withPhoto: true,
		stylePhoto: "circle",
		listStyle: "line",
		titleSection: {
			withIcon: true,
			iconStyle: "flat",
			iconColor: "primaryColor",
			textTransform: "uppercase",
		},
	},
	modules: {
		description: { title: "Présentation", isActive: false },
		experience: { title: "Expériences" },
		language: { design: "bars" },
		skill: { title: "Skills", design: "bars", isActive: true },
		strength: { title: "Atouts" },
		formation: { title: "Formation" },
	},
});
