import { tokyoTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

export const tokyo = defineTemplate({
	name: "Tokyo",
	slug: "tokyo-noLine-x",
	tokens: tokyoTokens,
	primaryColor: { name: "yellow", primary: "-600" },
	sectionHeader: "HeaderFour",
	variant: 1,
	pageLayout: "TwoColumnSideBar",
	layout: {
		...sharedLayout,
		columns: 2,
		withPhoto: true,
		photoSide: "left",
		sidebarSide: "left",
		stylePhoto: "circle",
		listStyle: "none",
		marge: "md",
		space: "md",
		headerPrimaryColor: true,
		titleSection: {
			...sharedLayout.titleSection,
		},
	},
	modules: {
		// main (colonne 1)
		description: { title: "Présentation", isActive: true, order: 1, column: 1 },
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
		// sidebar (colonne 0)
		language: {
			design: "stars",
			isActive: true,
			order: 1,
			column: 0,
			columns: 1,
		},
		tag: {
			title: "Skills",
			design: "tag",
			isActive: true,
			order: 2,
			column: 0,
		},
		socialMedia: {
			title: "Réseaux",
			isActive: true,
			order: 4,
			column: 0,
			columns: 1,
		},
		passion: { isActive: true, column: 0, columns: 1 },
		volunteering: { isActive: false, column: 1 },
		philosophy: { isActive: false, column: 1 },
		certification: { isActive: false, column: 1 },
		formation: { isActive: false, column: 1 },
		achievement: { isActive: false, column: 1 },
		publication: { isActive: false, column: 1 },
		prize: { isActive: false, column: 0, columns: 1 },
		expertise: { isActive: false, column: 0, columns: 1 },
	},
});
