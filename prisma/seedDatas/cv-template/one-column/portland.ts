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
		photoSide: "right",
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
		description: { title: "Présentation", isActive: true, order: 1 },
		experience: { title: "Expériences", isActive: true, order: 2 },
		education: { title: "Formations", isActive: true, order: 3, columns: 2 },
		language: { design: "bars", isActive: true, order: 4, columns: 3 },
		tag: { title: "Skills", design: "tag", isActive: true, order: 5 },
		strength: { title: "Atouts", isActive: true, order: 6 },
		socialMedia: { title: "Réseaux", isActive: false },
	},
});
