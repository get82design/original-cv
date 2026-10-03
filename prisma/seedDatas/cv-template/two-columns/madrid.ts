import { madridTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

/**
 * Madrid : TwoColumnCenter + HeaderFour — bandeau gris (`headerPrimaryColor: false`).
 */
export const madrid = defineTemplate({
	name: "Madrid",
	slug: "madrid-noLine-x",
	tokens: madridTokens,
	primaryColor: { name: "green", primary: "-600" },
	sectionHeader: "HeaderFour",
	pageLayout: "TwoColumnCenter",
	variant: 1,
	layout: {
		...sharedLayout,
		columns: 2,
		headerPlacement: "top",
		withPhoto: true,
		photoSide: "right",
		stylePhoto: "circle",
		listStyle: "none",
		marge: "sm",
		headerPrimaryColor: false,
		titleSection: {
			...sharedLayout.titleSection,
			withLigneDessus: true,
		},
	},
	modules: {
		description: { title: "Présentation", isActive: true, order: 1, column: 0 },
		experience: { title: "Expériences", isActive: true, order: 1, column: 1 },
		education: {
			title: "Formations",
			isActive: true,
			order: 2,
			column: 1,
			columns: 1,
		},
		strength: {
			title: "Atouts",
			isActive: true,
			order: 3,
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
			order: 2,
			column: 0,
			columns: 1,
		},
		tag: {
			title: "Skills",
			design: "border",
			isActive: true,
			order: 3,
			column: 0,
		},
		socialMedia: {
			title: "Réseaux",
			isActive: true,
			order: 4,
			column: 0,
			columns: 1,
		},
		passion: { isActive: false, column: 0, columns: 1 },
		prize: { isActive: false, column: 0, columns: 1 },
		expertise: { isActive: false, column: 0, columns: 1 },
	},
});
