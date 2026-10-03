import { sharedLayout } from "../_shared/layouts";
import { defineTemplate } from "../_shared/defineTemplate";
import { osloTokens } from "../../themeTokens";

export const oslo = defineTemplate({
	name: "Oslo",
	slug: "oslo-noLine-x",
	tokens: osloTokens,
	primaryColor: { name: "teal", primary: "-600" },
	layout: {
		...sharedLayout,
	},
	sectionHeader: "HeaderTwo",
	variant: 1,
	modules: {
		description: { title: "À propos", isActive: true, order: 1 },
		experience: { title: "Expériences", isActive: true, order: 2 },
		education: { title: "Formations", isActive: true, order: 3, columns: 2 },
		language: { design: "stars", isActive: true, order: 4, columns: 3 },
		tag: { title: "Compétences", isActive: true, design: "border", order: 5 },
		strength: { title: "Atouts", isActive: true, order: 6, columns: 2 },
		socialMedia: { title: "Réseaux sociaux", isActive: false },
	},
});
