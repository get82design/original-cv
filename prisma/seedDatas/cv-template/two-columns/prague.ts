import { pragueTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

/**
 * Prague : TwoColumnCenter + HeaderTwo (titre centré, sans photo).
 */
export const prague = defineTemplate({
	name: "Prague",
	slug: "prague-noLine-x",
	tokens: pragueTokens,
	primaryColor: { name: "blue", primary: "-600" },
	sectionHeader: "HeaderTwo",
	pageLayout: "TwoColumnCenter",
	variant: 1,
	layout: {
		...sharedLayout,
		columns: 2,
		headerPlacement: "top",
		marge: "sm",
		space: "sm",
		withPhoto: false,
		listStyle: "none",
		titleSection: {
			...sharedLayout.titleSection,
			textTransform: "uppercase",
			textAlign: "left",
		},
	},
	modules: {
		description: { title: "À propos", isActive: true, order: 1, column: 1 },
		experience: { title: "Expériences", isActive: true, order: 2, column: 1 },
		education: {
			title: "Formations",
			isActive: true,
			order: 3,
			column: 1,
			columns: 1,
		},
		strength: {
			title: "Atouts",
			isActive: true,
			order: 4,
			column: 1,
			columns: 1,
		},
		project: { isActive: false, column: 1 },
		volunteering: { isActive: false, column: 1 },
		philosophy: { isActive: false, column: 1 },
		certification: { isActive: false, column: 1 },
		formation: { isActive: false, column: 1 },
		achievement: { isActive: false, column: 1 },
		publication: { isActive: false, column: 1 },
		language: {
			design: "stars",
			isActive: true,
			order: 1,
			column: 0,
			columns: 1,
		},
		tag: {
			title: "Compétences",
			design: "border",
			isActive: true,
			order: 2,
			column: 0,
		},
		socialMedia: {
			title: "Réseaux",
			isActive: true,
			order: 3,
			column: 0,
			columns: 1,
		},
		passion: { isActive: false, column: 0, columns: 1 },
		prize: { isActive: false, column: 0, columns: 1 },
		expertise: { isActive: false, column: 0, columns: 1 },
	},
});
