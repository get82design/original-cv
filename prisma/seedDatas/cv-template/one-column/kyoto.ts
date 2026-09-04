import { kyotoTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

export const kyoto = defineTemplate({
	name: "Kyoto",
	slug: "kyoto-noLine-x",
	tokens: kyotoTokens,
	primaryColor: { name: "red", primary: "-600" },
	layout: {
		...sharedLayout,
		titleSection: {
			...sharedLayout.titleSection,
			withLigneDessous: true,
			textAlign: "center",
			lineWeight: "lg",
		},
	},
	sectionHeader: "HeaderOne",
	variant: 1,
	modules: {
		description: { title: "À propos", isActive: true, order: 1 },
		experience: { title: "Expériences", isActive: true, order: 2 },
		education: { title: "Formations", isActive: true, order: 3, columns: 2 },
		language: { design: "stars", isActive: true, order: 4, columns: 3 },
		tag: { title: "Tags", isActive: true, design: "border", order: 5 },
		strength: { title: "Atouts", isActive: true, order: 6, columns: 2 },
		passion: { title: "Passions", isActive: true, order: 7, columns: 3 },
		competence: { title: "Compétences", isActive: false, columns: 2 },
		skill: { title: "Skills", design: "stars", isActive: false },
	},
});
