import { sharedLayout } from "./layouts";
import { buildComponents } from "./components";
import { buildModules, type ModuleOverrides } from "./modules";
import { buildHeader } from "../../buildTemplateModules";
import type { ThemeTokens } from "../../themeTokens";
import type { createCvTemplateSchema, TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import type z from "zod";

type SeedTemplate = z.input<typeof createCvTemplateSchema>;

type PageLayout =
	| "OneColumnModel"
	| "OneColumnWithLeftBar"
	| "TwoColumnCenter"
	| "TwoColumnSideBar";

export function defineTemplate(opts: {
	name: string;
	slug: string;
	tokens: ThemeTokens;
	primaryColor: { name: string; primary: string };
	sectionHeader:
		| "HeaderOne"
		| "HeaderTwo"
		| "HeaderThree"
		| "HeaderFour"
		| "HeaderFive"
		| "HeaderSplitOne";
	/** `1` = Section*One ; `2` = Section*Two — réservé aux OneColumnModel (jamais 2 cols). */
	variant: 1 | 2;
	pageLayout?: PageLayout;
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
				titleSection: {
					...sharedLayout.titleSection,
					...opts.layout?.titleSection,
				},
				typography: { ...sharedLayout.typography, ...opts.layout?.typography },
			},
			header: buildHeader(opts.tokens),
			modules: buildModules(opts.tokens, opts.modules),
		},
		defaultStyles: {
			primaryColor: opts.primaryColor,
			slugTemplate: opts.slug,
			components: buildComponents({
				...(opts.pageLayout ? { pageLayout: opts.pageLayout } : {}),
				sectionHeader: opts.sectionHeader,
				variant: opts.variant,
			}),
		},
	};
}
