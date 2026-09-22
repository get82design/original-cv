import type { ThemeTokens } from "../../themeTokens";
import * as builders from "../../buildTemplateModules";

type ModuleKey =
	| "description"
	| "experience"
	| "education"
	| "language"
	| "skill"
	| "competence"
	| "tag"
	| "socialMedia"
	| "passion"
	| "project"
	| "expertise"
	| "strength"
	| "philosophy"
	| "formation"
	| "certification"
	| "prize"
	| "publication"
	| "achievement"
	| "volunteering";

const DEFAULT_TITLES: Record<ModuleKey, string> = {
	description: "Profil",
	experience: "Expériences professionnelles",
	education: "Diplomes",
	language: "Langues",
	skill: "Compétences",
	competence: "Compétences",
	tag: "Tags",
	socialMedia: "Réseaux sociaux",
	passion: "Passions",
	project: "Projets",
	expertise: "Expertises",
	strength: "Points forts",
	philosophy: "Philosophie",
	formation: "Formations",
	certification: "Certifications",
	prize: "Prix",
	publication: "Publications",
	achievement: "Réalisations",
	volunteering: "Volontariat",
};

const DEFAULT_ACTIVE: ModuleKey[] = ["description", "experience", "education", "language"];

type BaseOverride = {
	title?: string;
	isActive?: boolean;
	order?: number;
	/** Colonne de page : 0 = gauche/sidebar, 1 = main */
	column?: 0 | 1;
};

type LevelDesign = "stars" | "dots" | "bars";

type TagDesign = "tag" | "border" | "none" | "hashtag";

export type ModuleOverrides = Partial<{
	//   title?: string;
	//   isActive?: boolean;
	//   design?: "tag" | "border" | "none" | "hashtag";
	//   columns?: 1 | 4 | 2 | 3;

	// modules sans design
	description: BaseOverride;
	experience: BaseOverride;
	project: BaseOverride;
	philosophy: BaseOverride;
	publication: BaseOverride;
	achievement: BaseOverride;
	volunteering: BaseOverride;

	// levels
	skill: BaseOverride & { design?: LevelDesign };
	language: BaseOverride & { design?: LevelDesign; columns?: 1 | 2 | 3 | 4 };
	expertise: BaseOverride & { design?: LevelDesign; columns?: 1 | 2 | 3 | 4 };
	// tags
	tag: BaseOverride & { design?: TagDesign };
	// modules avec columns seulement
	education: BaseOverride & { columns?: 1 | 2 | 3 | 4 };
	competence: BaseOverride & { columns?: 1 | 2 | 3 | 4 };
	certification: BaseOverride & { columns?: 1 | 2 | 3 | 4 };
	prize: BaseOverride & { columns?: 1 | 2 | 3 | 4 };
	formation: BaseOverride & { columns?: 1 | 2 | 3 | 4 };
	passion: BaseOverride & { columns?: 1 | 2 | 3 | 4 };
	socialMedia: BaseOverride & { columns?: 1 | 2 | 3 | 4 };
	strength: BaseOverride & { columns?: 1 | 2 | 3 | 4 };
}>;

function capitalize(key: string) {
	return key.charAt(0).toUpperCase() + key.slice(1);
}

type ModuleBuilderName = `build${Capitalize<ModuleKey>}Module`;

export function buildModules(tokens: ThemeTokens, overrides: ModuleOverrides = {}) {
	const keys: ModuleKey[] = [
		"description",
		"experience",
		"education",
		"language",
		"skill",
		"competence",
		"tag",
		"socialMedia",
		"passion",
		"project",
		"expertise",
		"strength",
		"philosophy",
		"formation",
		"certification",
		"prize",
		"publication",
		"achievement",
		"volunteering",
	];
	return keys.map((key, i) => {
		const o = overrides[key] ?? {};
		// `column` = placement page (pas les builders) ; `columns` = grille interne (passé via ...rest)
		const { column, ...rest } = o;
		const built = builders[`build${capitalize(key)}Module` as ModuleBuilderName](tokens, {
			order: o.order ?? i + 1,
			title: o.title ?? DEFAULT_TITLES[key],
			isActive: o.isActive ?? DEFAULT_ACTIVE.includes(key),
			...rest,
		});
		return { ...built, column: column ?? 0 };
	});
}
