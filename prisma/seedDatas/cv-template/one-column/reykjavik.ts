import { reykjavikTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

export const reykjavik = defineTemplate({
	name: "Reykjavik",
	slug: "reykjavik-noLine-x",
	tokens: reykjavikTokens,
	primaryColor: { name: "cyan", primary: "-500" },
	layout: {
		...sharedLayout,
		listStyle: "none",
		marge: "lg",
        space: "lg",
		titleSection: {
			...sharedLayout.titleSection,
            textTransform: "uppercase",
			textAlign: "left",
		},
	},
    sectionHeader: "HeaderTwo",
	variant: 2,
	modules: {
		description: { title: "À propos", isActive: true, order: 1 },
		experience: { title: "Expériences", isActive: true, order: 2 },
		education: { title: "Formations", isActive: true, order: 3, columns: 2 },
		language: { design: "stars", isActive: true, order: 4, columns: 3 },
		competence: { title: "Compétences", isActive: true, order: 5, columns: 2 },
		strength: { title: "Atouts", isActive: true, order: 6, columns: 2 },
		passion: { title: "Passions", isActive: true, order: 7, columns: 3 },
		socialMedia: { title: "Réseaux", isActive: true, order: 8 },
        skill: { title: "Skills", design: "stars", isActive: false },
	},
});