import { seattleTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

export const seattle = defineTemplate({
	name: "Seattle",
	slug: "seattle-noLine-x",
	tokens: seattleTokens,
	primaryColor: { name: "gray", primary: "-500" },
	sectionHeader: "HeaderThree",
	variant: 2,
	layout: {
		...sharedLayout,
		withPhoto: true,
		stylePhoto: "flat",
		listStyle: "none",
		titleSection: {
			withIcon: true,
			iconStyle: "flat",
			iconColor: "white",
			textTransform: "uppercase",
		},
		pageAccent: { type: "leftBand", width: "sm" },
	},
	modules: {
		description: { title: "Présentation", isActive: true, order: 1 },
		experience: { title: "Expériences", isActive: true, order: 2 },
		education: { title: "Formations", isActive: true, order: 3, columns: 2 },
		language: { design: "bars", isActive: true, order: 4, columns: 3 },
		strength: { title: "Atouts", isActive: true, order: 5, columns: 2 },
		tag: { title: "Skills", design: "tag", isActive: true, order: 6 },
		passion: { title: "Passions", isActive: true, order: 7, columns: 3 },
		socialMedia: { title: "Réseaux", isActive: true, order: 8, columns: 3 },
	},
});
