import { zurichTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

export const zurich = defineTemplate({
	name: "Zurich",
	slug: "zurich-noLine-x",
	tokens: zurichTokens,
	primaryColor: { name: "red", primary: "-600" },
	sectionHeader: "HeaderFour",
	variant: 1,
	layout: {
		...sharedLayout,
		withPhoto: true,
		stylePhoto: "circle",
		photoSide: "right",
		listStyle: "none",
		marge: "sm",
		space: "sm",
		titleSection: {
			...sharedLayout.titleSection,
			withLigneDessous: true,
		},
		headerPrimaryColor: true,
	},
	modules: {
		description: { title: "Présentation", isActive: true, order: 1 },
		experience: { title: "Expériences", isActive: true, order: 2 },
		education: { title: "Formations", isActive: true, order: 3, columns: 2 },
		language: { design: "bars", isActive: true, order: 4, columns: 3 },
		tag: { title: "Skills", design: "tag", isActive: true, order: 5 },
		strength: { title: "Atouts", isActive: true, order: 6, columns: 2 },
		socialMedia: { title: "Réseaux", isActive: true, order: 7, columns: 3 },
	},
});
