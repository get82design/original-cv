import { eindhovenTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

export const eindhoven = defineTemplate({
	name: "Eindhoven",
	slug: "eindhoven-line-x",
	tokens: eindhovenTokens,
	primaryColor: { name: "gray", primary: "-500" },
	sectionHeader: "HeaderFour",
	variant: 1,
	layout: {
		...sharedLayout,
		withPhoto: true,
		stylePhoto: "circle",
		photoSide: "left",
		listStyle: "line",
		titleSection: {
			...sharedLayout.titleSection,
			bgColor: "primaryColor",
			textTransform: "uppercase",
			shadeBgColor: "-200",
			textAlign: "center",
		},
	},
	modules: {
		description: { title: "À propos", isActive: true, order: 1 },
		experience: { title: "Expériences", isActive: true, order: 2 },
		education: { title: "Formations", isActive: true, order: 3, columns: 2 },
		language: { design: "stars", isActive: true, order: 4, columns: 3 },
		competence: { title: "Compétences", isActive: true, order: 5, columns: 2 },
		strength: { title: "Atouts", isActive: true, order: 6, columns: 2 },
		passion: { title: "Passions", isActive: false, columns: 3 },
		skill: { title: "Skills", design: "stars", isActive: false },
	},
});
