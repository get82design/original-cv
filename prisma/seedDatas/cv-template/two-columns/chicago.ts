import { chicagoTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

export const chicago = defineTemplate({
	name: "Chicago",
	slug: "chicago-noLine-x",
	tokens: chicagoTokens,
	primaryColor: { name: "orange", primary: "-400" },
	sectionHeader: "HeaderFour",
	variant: 1,
	pageLayout: "TwoColumnSideBar",
	layout: {
		...sharedLayout,
		columns: 2,
		withPhoto: true,
		photoSide: "right",
        sidebarSide: "left",
		stylePhoto: "circle",
		listStyle: "none",
		marge: "sm",
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
			columns: 2,
		},
        project: { isActive: true, column: 1 },
		// sidebar (colonne 0)
		language: {
			design: "bars",
			isActive: true,
			order: 1,
			column: 0,
			columns: 1,
		},
		tag: { title: "Skills", design: "border", isActive: true, order: 2, column: 0 },
		socialMedia: { title: "Réseaux", isActive: true, order: 4, column: 0, columns: 1 },
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