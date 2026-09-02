import { austinTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

export const austin = defineTemplate({
	name: "Austin",
	slug: "austin-noLine-x",
	tokens: austinTokens,
	primaryColor: { name: "lime", primary: "-500" },
	sectionHeader: "HeaderFour",
	variant: 2,
	layout: {
		...sharedLayout,
		withPhoto: true,
		stylePhoto: "circle",
		listStyle: "none",
		marge: "sm",
		titleSection: {
			...sharedLayout.titleSection,
			withLigneDessus: true,
		},
	},
	modules: {
		description: { title: "Présentation", isActive: true },
		experience: { title: "Expériences", isActive: true },
		language: { design: "bars", isActive: true },
		education: { title: "Formations", isActive: true },
		tag: { title: "Skills", design: "tag", isActive: true },
		strength: { title: "Atouts", isActive: true },
		socialMedia: { title: "Réseaux", isActive: true },
	},
});
