import { seoulTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

export const seoul = defineTemplate({
	name: "Seoul",
	slug: "seoul-noLine-x",
	tokens: seoulTokens,
	primaryColor: { name: "sky", primary: "-500" },
	sectionHeader: "HeaderThree",
	variant: 2,
	layout: {
		...sharedLayout,
		withPhoto: true,
		stylePhoto: "circle",
		listStyle: "none",
		titleSection: {
			withIcon: true,
			iconStyle: "flat",
			iconColor: "white",
			textTransform: "uppercase",
		},
		pageAccent: { type: "leftBand", width: "sm", shade: "-100" },
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
