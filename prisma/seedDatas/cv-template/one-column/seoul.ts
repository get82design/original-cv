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
		lockPhotoSide: true,
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
		description: { title: "Présentation", isActive: true, order: 1 },
		education: { title: "Formations", isActive: true, order: 2 },
		experience: { title: "Expériences", isActive: true, order: 3 },
		language: { design: "bars", isActive: true, order: 4, columns: 3 },
		tag: { title: "Skills", design: "tag", isActive: true, order: 5 },
		strength: { title: "Atouts", isActive: true, order: 6 },
		socialMedia: { title: "Réseaux", isActive: false },
	},
});
