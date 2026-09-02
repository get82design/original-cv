import { portlandTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

export const portland = defineTemplate({
	name: "Portland",
	slug: "portland-noLine-x",
	tokens: portlandTokens,
	primaryColor: { name: "sky", primary: "-500" },
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
	},
	modules: {
		description: { title: "Présentation", isActive: true },
		experience: { title: "Expériences", isActive: true },
		language: { design: "bars", isActive: true },
		education: { title: "Formations", isActive: true, columns: 2 },
		tag: { title: "Skills", design: "tag", isActive: true },
		strength: { title: "Atouts", isActive: true },
		socialMedia: { title: "Réseaux", isActive: true },
	},
});
