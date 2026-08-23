import { defineTemplate } from "../_shared/defineTemplate";
import { classiqueTokens } from "../../themeTokens";


export const classique = defineTemplate({
  name: "Classique",
  slug: "classique-noLine-x",
  tokens: classiqueTokens,
  primaryColor: { name: "red", primary: "-500" },
  sectionHeader: "HeaderOne",
  variant: 1,
});