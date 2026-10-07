import { genoaTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

/** Genoa : TwoColumnCenter + HeaderSidebarOne — sans fond col 0. */
export const genoa = defineTemplate({
	name: "Genoa",
	slug: "genoa-five-nobg-x",
	tokens: genoaTokens,
	primaryColor: { name: "zinc", primary: "-600" },
	sectionHeader: "HeaderSidebarOne",
	pageLayout: "TwoColumnCenter",
	variant: 1,
	layout: {
		...sharedLayout,
		columns: 2,
		lockPhotoSide: true,
		headerPlacement: "sidebar",
		withPhoto: true,
		stylePhoto: "circle",
		listStyle: "none",
		titleSection: {
			...sharedLayout.titleSection,
			withIcon: true,
			iconStyle: "flat",
			iconColor: "primaryColor",
			textTransform: "uppercase",
		},
	},
	modules: {
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
		volunteering: { isActive: false, column: 1 },
		philosophy: { isActive: false, column: 1 },
		certification: { isActive: false, column: 1 },
		formation: { isActive: false, column: 1 },
		achievement: { isActive: false, column: 1 },
		publication: { isActive: false, column: 1 },
		language: {
			design: "bars",
			isActive: true,
			order: 1,
			column: 0,
			columns: 1,
		},
		tag: { title: "Skills", design: "border", isActive: true, order: 2, column: 0 },
		socialMedia: { title: "Réseaux", isActive: true, order: 3, column: 0, columns: 1 },
		passion: { isActive: false, column: 0, columns: 1 },
		prize: { isActive: false, column: 0, columns: 1 },
		expertise: { isActive: false, column: 0, columns: 1 },
	},
});
