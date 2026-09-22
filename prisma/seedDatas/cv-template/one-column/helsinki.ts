import { helsinkiTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

export const helsinki = defineTemplate({
	name: "Helsinki",
	slug: "helsinki-noLine-x",
	tokens: helsinkiTokens,
	primaryColor: { name: "emerald", primary: "-600" },
	sectionHeader: "HeaderOne",
	variant: 2,
	layout: {
		...sharedLayout,
		withPhoto: true,
		stylePhoto: "circle",
		listStyle: "none",
		marge: "lg",
		space: "lg",
		titleSection: {
			...sharedLayout.titleSection,
			withLigneDessous: true,
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
		passion: { title: "Passions", isActive: true, order: 8 },
	},
});
