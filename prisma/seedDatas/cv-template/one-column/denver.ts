import { denverTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

export const denver = defineTemplate({
	name: "Denver",
	slug: "denver-line-x",
	tokens: denverTokens,
	primaryColor: { name: "violet", primary: "-400" },
	sectionHeader: "HeaderThree",
	variant: 2,
	layout: {
		...sharedLayout,
		withPhoto: true,
		stylePhoto: "circle",
		listStyle: "line",
		titleSection: {
			withIcon: true,
			iconStyle: "flat",
			iconColor: "primaryColor",
			textTransform: "uppercase",
		},
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
