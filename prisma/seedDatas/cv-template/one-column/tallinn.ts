import { tallinnTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

export const tallinn = defineTemplate({
	name: "Tallinn",
	slug: "tallinn-noLine-x",
	tokens: tallinnTokens,
	primaryColor: { name: "lime", primary: "-500" },
	sectionHeader: "HeaderFour",
	variant: 2,
	layout: {
		...sharedLayout,
		withPhoto: true,
		stylePhoto: "circle",
		listStyle: "none",
		marge: "sm",
		headerPrimaryColor: true,
		titleSection: {
			...sharedLayout.titleSection,
			withLigneDessus: true,
		},
	},
	modules: {
		description: { title: "Présentation", isActive: true, order: 1 },
		experience: { title: "Expériences", isActive: true, order: 2 },
		education: { title: "Formations", isActive: true, order: 3 },
		language: { design: "bars", isActive: true, order: 4, columns: 3 },
		tag: { title: "Skills", design: "tag", isActive: true, order: 5 },
		strength: { title: "Atouts", isActive: true, order: 6 },
		socialMedia: { title: "Réseaux", isActive: true, order: 7, columns: 3 },
	},
});
