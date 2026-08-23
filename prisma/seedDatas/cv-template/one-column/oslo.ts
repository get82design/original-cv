import { sharedLayout } from "../_shared/layouts";
import { defineTemplate } from "../_shared/defineTemplate";
import { osloTokens } from "../../themeTokens";

export const oslo = defineTemplate({
    name: "Oslo",
    slug: "oslo-noLine-x",
    tokens: osloTokens,
    primaryColor: { name: "teal", primary: "-600" },
    layout: {
        ...sharedLayout,
    },
    sectionHeader: "HeaderTwo",
    variant: 1,
    modules: {
        description: { title: "À propos", isActive: true },
        experience: { title: "Expériences", isActive: true },
        education: { title: "Formations", isActive: true, columns: 2 },
        language: { design: "stars", isActive: true },
        tag: { title: "Compétences", isActive: true, design: "border" },
        strength: { title: "Atouts", isActive: true, columns: 2 },
        socialMedia: { title: "Réseaux sociaux", isActive: true, columns: 3 },
    },
});