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
		description: { title: "À propos", isActive: true },
		experience: { title: "Expériences", isActive: true },
		language: { design: "stars", isActive: true },
		strength: { title: "Atouts", isActive: true, columns: 2 },
		education: { title: "Formations", isActive: true, columns: 2 },
		competence: { title: "Compétences", isActive: true, columns: 2 },
		passion: { title: "Passions", isActive: true, columns: 3 },
		skill: { title: "Skills", design: "stars", isActive: false },
	},
});
