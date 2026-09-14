import { shenzhenTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

export const shenzhen = defineTemplate({
	name: "Shenzhen",
	slug: "shenzhen-line-x",
	tokens: shenzhenTokens,
	primaryColor: { name: "indigo", primary: "-500" },
	sectionHeader: "HeaderThree",
	variant: 2,
	layout: {
		...sharedLayout,
		withPhoto: true,
		stylePhoto: "circle",
		photoSide: "left",
		listStyle: "line",
		titleSection: {
			withIcon: true,
			iconStyle: "flat",
			iconColor: "primaryColor",
			textTransform: "uppercase",
		},
	},
	modules: {
		description: { title: "Présentation", isActive: true, order: 1 },
		experience: { title: "Expériences", isActive: true, order: 2 },
		education: { title: "Formations", isActive: true, order: 3, columns: 1 },
		language: { design: "bars", isActive: true, order: 4, columns: 3 },
		tag: { title: "Skills", design: "tag", isActive: true, order: 5 },
		strength: { title: "Atouts", isActive: true, order: 6, columns: 1 },
		socialMedia: { title: "Réseaux", isActive: true, order: 7 },
	},
});