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
		description: { title: "Présentation", isActive: true },
		experience: { title: "Expériences", isActive: true },
		language: { design: "bars", isActive: true },
		education: { title: "Formations", isActive: true },
		tag: { title: "Skills", design: "tag", isActive: true },
		strength: { title: "Atouts", isActive: true },
		socialMedia: { title: "Réseaux", isActive: true },
	},
});
