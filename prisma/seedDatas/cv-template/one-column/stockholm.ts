import { stockholmTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

export const stockholm = defineTemplate({
	name: "Stockholm",
	slug: "stockholm-noLine-x",
	tokens: stockholmTokens,
	primaryColor: { name: "yellow", primary: "-600" },
	layout: {
		...sharedLayout,
		titleSection: {
			...sharedLayout.titleSection,
			withLigneDessous: true,
			textAlign: "center",
		},
	},
	sectionHeader: "HeaderOne",
	variant: 1,
	modules: {
		description: { title: "À propos", isActive: true, order: 1 },
		experience: { title: "Expériences", isActive: true, order: 2 },
		language: { design: "stars", isActive: true, order: 3, columns: 3 },
		education: { title: "Formations", isActive: true, order: 4, columns: 2 },
		strength: { title: "Atouts", isActive: true, order: 5, columns: 2 },
		competence: { title: "Compétences", isActive: true, order: 6, columns: 2 },
		passion: { title: "Passions", isActive: true, order: 7, columns: 3 },
		skill: { title: "Skills", design: "stars", isActive: false, order: 8 },
	},
});
