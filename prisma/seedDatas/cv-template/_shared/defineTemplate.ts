import { sharedLayout } from "./layouts";
import { buildComponents } from "./components";
import { buildModules, type ModuleOverrides } from "./modules";
import { buildHeader } from "../../buildTemplateModules";
import type { ThemeTokens } from "../../themeTokens";
import type { createCvTemplateSchema, TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import type z from "zod";

type SeedTemplate = z.input<typeof createCvTemplateSchema>;

export function defineTemplate(opts: {
  name: string;
  slug: string;
  tokens: ThemeTokens;
  primaryColor: { name: string; primary: string };
  sectionHeader: "HeaderOne" | "HeaderTwo" | "HeaderThree";
  variant: 1 | 2;
  layout?: Omit<Partial<TemplateLayout>, "titleSection" | "typography"> & {
    titleSection?: Partial<TemplateLayout["titleSection"]>;
    typography?: Partial<TemplateLayout["typography"]>;
  };
  modules?: ModuleOverrides;
}): SeedTemplate {
  return {
    name: opts.name,
    structure: {
      layout: {
        ...sharedLayout,
        ...opts.layout,
        titleSection: { ...sharedLayout.titleSection, ...opts.layout?.titleSection },
        typography: { ...sharedLayout.typography, ...opts.layout?.typography },
      },
      header: buildHeader(opts.tokens),
      modules: buildModules(opts.tokens, opts.modules),
    },
    defaultStyles: {
      primaryColor: opts.primaryColor,
      slugTemplate: opts.slug,
      components: buildComponents({
        sectionHeader: opts.sectionHeader,
        variant: opts.variant,
      }),
    },
  };
}