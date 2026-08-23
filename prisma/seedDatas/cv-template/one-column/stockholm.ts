import { stockholmTokens } from "../../themeTokens";
import { defineTemplate } from "../_shared/defineTemplate";
import { sharedLayout } from "../_shared/layouts";

export const stockholm = defineTemplate({
    name: "Stockholm",
    slug: "stockholm-noLine-x",
    tokens: stockholmTokens,
    primaryColor: { name: "yellow", primary: "-600" },
    layout: {  
      ...sharedLayout,
      titleSection: {
        ...sharedLayout.titleSection,
        withLigneDessous: true,
        textAlign: "center",
      },
    },
    sectionHeader: "HeaderOne",
    variant: 1,
    modules: {
      description: { title: "À propos", isActive: true },
      experience: { title: "Expériences", isActive: true },
      language: { design: "stars", isActive: true },
      strength: { title: "Atouts", isActive: true, columns: 2 },
      education: { title: "Formations", isActive: true, columns: 2 },
      competence: { title: "Compétences", isActive: true, columns: 2 },
      passion: { title: "Passions", isActive: true, columns: 3 },
      skill: { title: "Skills", design: "stars", isActive: false },
    },
  });