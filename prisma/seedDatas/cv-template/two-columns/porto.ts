import { portoTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

/** Porto : TwoColumnCenter + HeaderSidebarTwo, col 0 fond blanc. */
export const porto = defineTemplate({
	name: "Porto",
	slug: "porto-line-white-x",
	tokens: portoTokens,
	primaryColor: { name: "purple", primary: "-700" },
	sectionHeader: "HeaderSidebarTwo",
	pageLayout: "TwoColumnCenter",
	variant: 1,
	layout: {
		...sharedLayout,
		columns: 2,
		lockPhotoSide: true,
		headerPlacement: "sidebar",
		withPhoto: true,
		stylePhoto: "circle",
		marge: "sm",
		space: "sm",
		sidebarTheme: { bgColor: "white", fg: "black" },
		listStyle: "none",
		titleSection: {
			...sharedLayout.titleSection,
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
		tag: {
			title: "Skills",
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
