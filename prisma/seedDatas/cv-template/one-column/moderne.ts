import { moderneTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";

export const moderne = defineTemplate({
	name: "Moderne",
	slug: "moderne-noLine-x", // ou "moderne-noLine-x" si tu veux l’ancien
	tokens: moderneTokens,
	primaryColor: { name: "sky", primary: "-500" }, // original ; tu as mis "blue"
	sectionHeader: "HeaderTwo",
	variant: 1,
	layout: {
		typography: {
			fontFamily: "inter",
			roles: {
				body: "inter",
				headerTitle: "playfair",
				headerSubTitle: "inter",
				sectionTitle: "lora",
			},
		},
		titleSection: {
			withLigneDessous: true,
		},
	},
	modules: {
		description: { title: "À propos" },
		experience: { title: "Expériences" },
		language: { design: "stars", isActive: false },
		skill: { title: "Skills", design: "stars", isActive: true },
		socialMedia: { isActive: true },
		project: { isActive: true },
		strength: { title: "Atouts" },
		formation: { title: "Formation" },
	},
});
