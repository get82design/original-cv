import { frankfurtTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

export const frankfurt = defineTemplate({
	name: "Frankfurt",
	slug: "frankfurt-line-x",
	tokens: frankfurtTokens,
	primaryColor: { name: "olive", primary: "-700" },
	sectionHeader: "HeaderFive",
	pageLayout: "TwoColumnSideBar",
	variant: 1,
	layout: {
		...sharedLayout,
		columns: 2,
		lockPhotoSide: true,
		headerPlacement: "sidebar",
		withPhoto: true,
		stylePhoto: "circle",
        sidebarTheme: { bgColor: "primaryColor", shadeBgColor: "-100", fg: "black" },
		listStyle: "none",
		titleSection: {
			...sharedLayout.titleSection,
			textTransform: "uppercase",
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
			design: "dots",
			isActive: true,
			order: 1,
			column: 0,
			columns: 1,
		},
		tag: { title: "Skills", design: "tag", isActive: true, order: 2, column: 0 },
		socialMedia: { title: "Réseaux", isActive: true, order: 4, column: 0, columns: 1 },
        passion: { isActive: false, column: 0, columns: 1 },
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
