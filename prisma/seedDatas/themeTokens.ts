import {
	headerFiveTokenDefaults,
	headerFourTokenDefaults,
	headerOneTokenDefaults,
	headerSplitOneTokenDefaults,
	headerThreeTokenDefaults,
	headerTwoTokenDefaults,
	mergeTokenOverrides,
} from "./headerTokenDefaults";

type TextStyle = {
	sizeModel: string;
	weightModel: number;
	colorSelect: "primaryColor" | "gray" | "black" | "white";
	sizeSelect: "xs" | "sm" | "md" | "lg" | "xl";
	weightSelect: "xs" | "sm" | "md" | "lg" | "xl";
	withPrimaryColor: boolean;
	textAlign?: "left" | "center" | "right" | "justify";
};

export type ThemeTokens = {
	headerTitle: TextStyle;
	headerSubTitle: TextStyle;
	headerContent: TextStyle;
	headerNom: TextStyle;
	headerPrenom: TextStyle;
	sectionTitle: TextStyle;
	itemTitle: TextStyle;
	meta: TextStyle; // company, dates, ville…
	body: TextStyle; // description, missions
};

/** Champs optionnels par rôle — uniquement ce qui change vs `defaultTokens`. */
export type ThemeTokenOverrides = {
	[K in keyof ThemeTokens]?: Partial<TextStyle>;
};

/** Défaut typographique — base de tous les thèmes. */
export const defaultTokens: ThemeTokens = {
	headerTitle: {
		sizeModel: "28px",
		weightModel: 700,
		colorSelect: "primaryColor",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	headerSubTitle: {
		sizeModel: "20px",
		weightModel: 600,
		colorSelect: "gray",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
		textAlign: "left",
	},
	headerContent: {
		sizeModel: "13px",
		weightModel: 400,
		colorSelect: "black",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: false,
		textAlign: "left",
	},
	headerNom: {
		sizeModel: "16px",
		weightModel: 600,
		colorSelect: "black",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
	},
	headerPrenom: {
		sizeModel: "16px",
		weightModel: 600,
		colorSelect: "black",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
	},
	sectionTitle: {
		sizeModel: "18px",
		weightModel: 700,
		colorSelect: "primaryColor",
		sizeSelect: "lg",
		weightSelect: "lg",
		withPrimaryColor: true,
		textAlign: "left",
	},
	itemTitle: {
		sizeModel: "16px",
		weightModel: 600,
		colorSelect: "black",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
	},
	meta: {
		sizeModel: "14px",
		weightModel: 500,
		colorSelect: "black",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: true,
	},
	body: {
		sizeModel: "13px",
		weightModel: 400,
		colorSelect: "black",
		sizeSelect: "md",
		weightSelect: "md",
		withPrimaryColor: false,
		textAlign: "left",
	},
};

/**
 * Deep-merge partiel sur `defaultTokens`.
 * Convention seed : n’écrire que les deltas ; le reste est hérité du défaut.
 * Empiler un preset header : `defineTokens(mergeTokenOverrides(headerXTokenDefaults, { … }))`.
 */
export function defineTokens(overrides: ThemeTokenOverrides = {}): ThemeTokens {
	const keys = Object.keys(defaultTokens) as (keyof ThemeTokens)[];
	const out = {} as ThemeTokens;
	for (const key of keys) {
		out[key] = { ...defaultTokens[key], ...overrides[key] };
	}
	return out;
}

/** Corps dense récurrent (Austin, Singapore, Berlin…). */
const denseBody: ThemeTokenOverrides = {
	sectionTitle: { sizeModel: "14px", weightModel: 600, colorSelect: "black" },
	itemTitle: { sizeModel: "14px", weightModel: 500 },
	meta: { sizeModel: "12px", weightModel: 400 },
	body: { sizeModel: "12px" },
};

/** Famille Denver (HeaderThree) — corps un cran plus grand. */
const denverBody: ThemeTokenOverrides = {
	sectionTitle: { sizeModel: "14px", weightModel: 600, colorSelect: "black" },
	itemTitle: { sizeModel: "14px", weightModel: 500 },
	meta: { sizeModel: "12px", weightModel: 400 },
	body: { sizeModel: "14px" },
};

// ---------------------------------------------------------------------------
// Thèmes = preset header (aligné sectionHeader) + deltas template.
// ---------------------------------------------------------------------------

/** Stockholm — HeaderOne + centrage. */
export const stockholmTokens = defineTokens(
	mergeTokenOverrides(headerOneTokenDefaults, {
		headerTitle: { textAlign: "center" },
		headerSubTitle: { textAlign: "center" },
		sectionTitle: {
			weightSelect: "sm",
			textAlign: "center",
			colorSelect: "black",
		},
	}),
);

/** Kyoto — HeaderOne pur + sections noires. */
export const kyotoTokens = defineTokens(
	mergeTokenOverrides(headerOneTokenDefaults, {
		sectionTitle: { colorSelect: "black" },
	}),
);

/**
 * Oslo — HeaderTwo catalogue, mais typo historique différente du preset :
 * on repart du preset puis on rétablit weightTitle md + sous-titre affirmé.
 */
export const osloTokens = defineTokens(
	mergeTokenOverrides(headerTwoTokenDefaults, {
		headerTitle: { colorSelect: "primaryColor", weightSelect: "md" },
		headerSubTitle: {
			weightSelect: "lg",
			sizeSelect: "lg",
			colorSelect: "gray",
		},
	}),
);

/** Denver — HeaderThree + corps. */
export const denverTokens = defineTokens(
	mergeTokenOverrides(headerThreeTokenDefaults, denverBody),
);

/** Seattle — HeaderSplitOne (comme Berlin, sans fond col 0). */
export const seattleTokens = defineTokens(
	mergeTokenOverrides(headerSplitOneTokenDefaults, denseBody),
);

/** Seoul — HeaderThree ; sections primary. */
export const seoulTokens = defineTokens(
	mergeTokenOverrides(headerThreeTokenDefaults, denverBody, {
		sectionTitle: { colorSelect: "primaryColor" },
	}),
);

/** Geneva — HeaderOne + couleurs contrastées. */
export const genevaTokens = defineTokens(
	mergeTokenOverrides(headerOneTokenDefaults, {
		headerTitle: { colorSelect: "black" },
		headerSubTitle: { colorSelect: "primaryColor" },
		sectionTitle: {
			weightSelect: "sm",
			textAlign: "center",
			colorSelect: "black",
		},
	}),
);

/** Austin — HeaderFour + sections grises / corps dense. */
export const austinTokens = defineTokens(
	mergeTokenOverrides(headerFourTokenDefaults, denseBody, {
		sectionTitle: { colorSelect: "gray" },
	}),
);

/** Portland — HeaderFour + sections noires un peu plus grandes. */
export const portlandTokens = defineTokens(
	mergeTokenOverrides(headerFourTokenDefaults, denseBody, {
		sectionTitle: { sizeModel: "16px", colorSelect: "black" },
	}),
);

/** Tallinn — HeaderFour + sections grises / corps dense. */
export const tallinnTokens = defineTokens(
	mergeTokenOverrides(headerFourTokenDefaults, denseBody, {
		sectionTitle: { colorSelect: "gray" },
	}),
);

/** Zurich — même famille que Tallinn / Austin. */
export const zurichTokens = defineTokens(
	mergeTokenOverrides(headerFourTokenDefaults, denseBody, {
		sectionTitle: { colorSelect: "gray" },
	}),
);

/** Chicago — HeaderFour pur. */
export const chicagoTokens = defineTokens(
	mergeTokenOverrides(headerFourTokenDefaults),
);

/** Tokyo — HeaderFour pur. */
export const tokyoTokens = defineTokens(
	mergeTokenOverrides(headerFourTokenDefaults),
);

/** Lisbon — HeaderThree (aligné sectionHeader). */
export const lisbonTokens = defineTokens(
	mergeTokenOverrides(headerThreeTokenDefaults),
);

/** Florence — HeaderOne (aligné sectionHeader). */
export const florenceTokens = defineTokens(
	mergeTokenOverrides(headerOneTokenDefaults),
);

/** Helsinki — HeaderOne + corps dense / sections grises. */
export const helsinkiTokens = defineTokens(
	mergeTokenOverrides(headerOneTokenDefaults, denseBody, {
		sectionTitle: { colorSelect: "gray" },
	}),
);

/** Nara — HeaderTwo + sections centrées. */
export const naraTokens = defineTokens(
	mergeTokenOverrides(headerTwoTokenDefaults, {
		sectionTitle: {
			weightSelect: "sm",
			textAlign: "center",
			colorSelect: "black",
		},
	}),
);

/** Reykjavik — HeaderTwo ; sections à gauche. */
export const reykjavikTokens = defineTokens(
	mergeTokenOverrides(headerTwoTokenDefaults, {
		sectionTitle: { weightSelect: "sm", textAlign: "left", colorSelect: "black" },
	}),
);

/** Krakow — même famille que Reykjavik. */
export const krakowTokens = defineTokens(
	mergeTokenOverrides(headerTwoTokenDefaults, {
		sectionTitle: { weightSelect: "sm", textAlign: "left", colorSelect: "black" },
	}),
);

/** Shenzhen — HeaderThree + corps Denver. */
export const shenzhenTokens = defineTokens(
	mergeTokenOverrides(headerThreeTokenDefaults, denverBody),
);

/** Eindhoven — HeaderFour + sections centrées. */
export const eindhovenTokens = defineTokens(
	mergeTokenOverrides(headerFourTokenDefaults, {
		sectionTitle: {
			weightSelect: "sm",
			textAlign: "center",
			colorSelect: "black",
		},
	}),
);

/** Oxford — même famille qu’Eindhoven. */
export const oxfordTokens = defineTokens(
	mergeTokenOverrides(headerFourTokenDefaults, {
		sectionTitle: {
			weightSelect: "sm",
			textAlign: "center",
			colorSelect: "black",
		},
	}),
);

/** Singapore — HeaderFive + corps dense. */
export const singaporeTokens = defineTokens(
	mergeTokenOverrides(headerFiveTokenDefaults, denseBody),
);

/** Toronto — HeaderFive + corps dense. */
export const torontoTokens = defineTokens(
	mergeTokenOverrides(headerFiveTokenDefaults, denseBody),
);

/** Berlin — HeaderSplitOne + corps dense. */
export const berlinTokens = defineTokens(
	mergeTokenOverrides(headerSplitOneTokenDefaults, denseBody),
);

/** Hamburg — HeaderSplitOne + corps dense (sidebar sombre type Toronto). */
export const hamburgTokens = defineTokens(
	mergeTokenOverrides(headerSplitOneTokenDefaults, denseBody),
);

/** Frankfurt — HeaderFive + corps dense. */
export const frankfurtTokens = defineTokens(
	mergeTokenOverrides(headerFiveTokenDefaults, denseBody),
);

/** Vienna — HeaderOne (vitrine TwoColumnCenter). */
export const viennaTokens = defineTokens(
	mergeTokenOverrides(headerOneTokenDefaults),
);
