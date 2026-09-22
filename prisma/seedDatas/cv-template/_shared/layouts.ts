import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";

export const sharedLayout = {
	columns: 1,
	marge: "md",
	space: "md",
	withPhoto: false,
	stylePhoto: "flat",
	titleSection: {
		textTransform: "capitalize",
		withIcon: false,
		iconStyle: "flat",
		withLigneDessous: false,
		withLigneDessus: false,
		lineWeight: "sm",
		bottomSpaceLine: "sm",
		topSpaceLine: "sm",
		textAlign: "left",
	},
	typography: {
		fontFamily: "inter",
		roles: {
			body: "inter",
			headerTitle: "inter",
			headerSubTitle: "inter",
			sectionTitle: "inter",
		},
	},
	listStyle: "none",
} satisfies TemplateLayout;
