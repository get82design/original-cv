import { defineTemplate } from "../_shared/defineTemplate";
import { classiqueTokens } from "../../themeTokens";
import { sharedLayout } from "../_shared/layouts";

export const classique = defineTemplate({
	name: "Classique",
	slug: "classique-noLine-x",
	tokens: classiqueTokens,
	primaryColor: { name: "red", primary: "-500" },
	sectionHeader: "HeaderFour",
	variant: 1,
	layout: {
		...sharedLayout,
		withPhoto: true,
		photoSide: "right",
		stylePhoto: "circle",
	},
});
