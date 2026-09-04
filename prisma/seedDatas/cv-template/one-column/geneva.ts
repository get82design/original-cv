import { sharedLayout } from "../_shared/layouts";

import { defineTemplate } from "../_shared/defineTemplate";
import { genevaTokens } from "../../themeTokens";

export const geneva = defineTemplate({
	name: "Geneva",
	slug: "geneva-noLine-x",
	tokens: genevaTokens,
	primaryColor: { name: "gray", primary: "-500" },
	layout: {
		...sharedLayout,
		withPhoto: true,
		stylePhoto: "circle",
		titleSection: {
			...sharedLayout.titleSection,
			bgColor: "primaryColor",
			textTransform: "uppercase",
			shadeBgColor: "-200",
			textAlign: "center",
		},
	},
	sectionHeader: "HeaderOne",
	variant: 1,
	modules: {
		description: { title: "À propos", isActive: true, order: 1 },
		experience: { title: "Expériences", isActive: true, order: 2 },
		education: { title: "Formations", isActive: true, order: 3, columns: 2 },
		language: { design: "stars", isActive: true, order: 4, columns: 3 },
		competence: { title: "Compétences", isActive: true, order: 5, columns: 2 },
		strength: { title: "Atouts", isActive: true, order: 6, columns: 2 },
		passion: { title: "Passions", isActive: true, order: 7, columns: 3 },
		skill: { title: "Skills", design: "stars", isActive: false },
	},
});
