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
		description: { title: "Présentation", isActive: true, order: 1 },
		experience: { title: "Expériences", isActive: true, order: 2 },
		education: { title: "Formations", isActive: true, order: 3, columns: 1 },
		language: { design: "bars", isActive: true, order: 4, columns: 3 },
		tag: { title: "Skills", design: "border", isActive: true, order: 5 },
		strength: { title: "Atouts", isActive: true, order: 6, columns: 1 },
		socialMedia: { title: "Réseaux", isActive: true, order: 7 },
	},
});
