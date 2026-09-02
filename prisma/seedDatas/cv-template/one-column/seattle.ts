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
		description: { title: "Présentation" },
		experience: { title: "Expériences" },
		language: { design: "bars" },
		education: { title: "Formations" },
		tag: { title: "Skills", design: "tag" },
		strength: { title: "Atouts" },
		socialMedia: { title: "Réseaux" },
	},
});
