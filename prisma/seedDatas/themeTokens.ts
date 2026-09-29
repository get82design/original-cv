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

export const classiqueTokens: ThemeTokens = {
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

// Même structure, valeurs différentes = personnalité du thème
export const moderneTokens: ThemeTokens = {
	...classiqueTokens,
	headerTitle: {
		...classiqueTokens.headerTitle,
		textAlign: "center",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		textAlign: "center",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		sizeModel: "16px",
		weightModel: 600,
		sizeSelect: "md",
	},
	itemTitle: {
		...classiqueTokens.itemTitle,
		sizeModel: "15px",
		weightModel: 500,
	},
	body: {
		...classiqueTokens.body,
		sizeModel: "12px",
		textAlign: "justify",
	},
};

export const minimalTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 700,
		colorSelect: "primaryColor",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "gray",
	},
	headerTitle: {
		...classiqueTokens.headerTitle,
		sizeModel: "18px",
		weightModel: 600,
		textAlign: "center",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		sizeModel: "18px",
		weightModel: 600,
		textAlign: "center",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		sizeModel: "14px",
		weightModel: 600,
		colorSelect: "black",
	},
	itemTitle: {
		...classiqueTokens.itemTitle,
		sizeModel: "14px",
		weightModel: 500,
	},
	meta: {
		...classiqueTokens.meta,
		sizeModel: "12px",
		weightModel: 400,
	},
	body: {
		...classiqueTokens.body,
		sizeModel: "12px",
	},
};

export const stockholmTokens: ThemeTokens = {
	...classiqueTokens,
	headerTitle: {
		...classiqueTokens.headerTitle,
		weightSelect: "lg",
		textAlign: "center",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		weightSelect: "sm",
		textAlign: "center",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		weightSelect: "sm",
		textAlign: "center",
		colorSelect: "black",
	},
};

export const kyotoTokens: ThemeTokens = {
	...classiqueTokens,
	headerTitle: {
		...classiqueTokens.headerTitle,
		weightSelect: "lg",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		weightSelect: "sm",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		colorSelect: "black",
	},
};

export const osloTokens: ThemeTokens = {
	...classiqueTokens,
	headerTitle: {
		...classiqueTokens.headerTitle,
		colorSelect: "primaryColor",
		textAlign: "center",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		weightSelect: "lg",
		sizeSelect: "lg",
		colorSelect: "gray",
		textAlign: "center",
	},
};

export const denverTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		sizeModel: "24px",
		weightModel: 700,
		colorSelect: "primaryColor",
		weightSelect: "lg",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "black",
		weightSelect: "sm",
		sizeSelect: "lg",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		sizeModel: "18px",
		weightModel: 500,
		colorSelect: "gray",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		sizeModel: "14px",
		weightModel: 600,
		colorSelect: "black",
	},
	itemTitle: {
		...classiqueTokens.itemTitle,
		sizeModel: "14px",
		weightModel: 500,
	},
	meta: {
		...classiqueTokens.meta,
		sizeModel: "12px",
		weightModel: 400,
	},
	body: {
		...classiqueTokens.body,
		sizeModel: "14px",
	},
};

export const seattleTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		sizeModel: "24px",
		weightModel: 700,
		colorSelect: "primaryColor",
		weightSelect: "lg",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "black",
		weightSelect: "sm",
		sizeSelect: "lg",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		sizeModel: "18px",
		weightModel: 500,
		colorSelect: "gray",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		sizeModel: "14px",
		weightModel: 600,
		colorSelect: "white",
	},
	itemTitle: {
		...classiqueTokens.itemTitle,
		sizeModel: "14px",
		weightModel: 500,
	},
	meta: {
		...classiqueTokens.meta,
		sizeModel: "12px",
		weightModel: 400,
	},
	body: {
		...classiqueTokens.body,
		sizeModel: "14px",
	},
};

export const seoulTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		sizeModel: "24px",
		weightModel: 700,
		colorSelect: "primaryColor",
		weightSelect: "lg",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "black",
		weightSelect: "sm",
		sizeSelect: "lg",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		sizeModel: "18px",
		weightModel: 500,
		colorSelect: "gray",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		sizeModel: "14px",
		weightModel: 600,
		colorSelect: "primaryColor",
	},
	itemTitle: {
		...classiqueTokens.itemTitle,
		sizeModel: "14px",
		weightModel: 500,
	},
	meta: {
		...classiqueTokens.meta,
		sizeModel: "12px",
		weightModel: 400,
	},
	body: {
		...classiqueTokens.body,
		sizeModel: "14px",
	},
};

export const genevaTokens: ThemeTokens = {
	...classiqueTokens,
	headerTitle: {
		...classiqueTokens.headerTitle,
		weightSelect: "lg",
		textAlign: "left",
		colorSelect: "black",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		weightSelect: "sm",
		textAlign: "left",
		colorSelect: "primaryColor",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		weightSelect: "sm",
		textAlign: "center",
		colorSelect: "black",
	},
};

export const austinTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 700,
		colorSelect: "primaryColor",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "gray",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		textAlign: "right",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		sizeModel: "14px",
		weightModel: 600,
		colorSelect: "gray",
	},
	itemTitle: {
		...classiqueTokens.itemTitle,
		sizeModel: "14px",
		weightModel: 500,
	},
	meta: {
		...classiqueTokens.meta,
		sizeModel: "12px",
		weightModel: 400,
	},
	body: {
		...classiqueTokens.body,
		sizeModel: "12px",
	},
};

export const portlandTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 700,
		colorSelect: "primaryColor",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "gray",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		textAlign: "right",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		sizeModel: "16px",
		weightModel: 600,
		colorSelect: "black",
	},
	itemTitle: {
		...classiqueTokens.itemTitle,
		sizeModel: "14px",
		weightModel: 500,
	},
	meta: {
		...classiqueTokens.meta,
		sizeModel: "12px",
		weightModel: 400,
	},
	body: {
		...classiqueTokens.body,
		sizeModel: "12px",
	},
};

export const tallinnTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 700,
		colorSelect: "primaryColor",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "gray",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		textAlign: "right",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		sizeModel: "14px",
		weightModel: 600,
		colorSelect: "gray",
	},
	itemTitle: {
		...classiqueTokens.itemTitle,
		sizeModel: "14px",
		weightModel: 500,
	},
	meta: {
		...classiqueTokens.meta,
		sizeModel: "12px",
		weightModel: 400,
	},
	body: {
		...classiqueTokens.body,
		sizeModel: "12px",
	},
};

export const zurichTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 700,
		colorSelect: "primaryColor",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "gray",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		textAlign: "right",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		sizeModel: "14px",
		weightModel: 600,
		colorSelect: "gray",
	},
	itemTitle: {
		...classiqueTokens.itemTitle,
		sizeModel: "14px",
		weightModel: 500,
	},
	meta: {
		...classiqueTokens.meta,
		sizeModel: "12px",
		weightModel: 400,
	},
	body: {
		...classiqueTokens.body,
		sizeModel: "12px",
	},
};

export const chicagoTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 700,
		colorSelect: "primaryColor",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "gray",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		textAlign: "right",
	},
};

export const tokyoTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 700,
		colorSelect: "primaryColor",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "gray",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		textAlign: "right",
	},
};

export const lisbonTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 700,
		colorSelect: "primaryColor",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "gray",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		textAlign: "right",
	},
};

export const florenceTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 700,
		colorSelect: "primaryColor",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "gray",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		textAlign: "right",
	},
};

export const helsinkiTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 700,
		colorSelect: "primaryColor",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "gray",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		textAlign: "right",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		sizeModel: "14px",
		weightModel: 600,
		colorSelect: "gray",
	},
	itemTitle: {
		...classiqueTokens.itemTitle,
		sizeModel: "14px",
		weightModel: 500,
	},
	meta: {
		...classiqueTokens.meta,
		sizeModel: "12px",
		weightModel: 400,
	},
	body: {
		...classiqueTokens.body,
		sizeModel: "12px",
	},
};

export const naraTokens: ThemeTokens = {
	...classiqueTokens,
	headerTitle: {
		...classiqueTokens.headerTitle,
		weightSelect: "lg",
		textAlign: "center",
		colorSelect: "black",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		weightSelect: "sm",
		textAlign: "center",
		colorSelect: "primaryColor",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		weightSelect: "sm",
		textAlign: "center",
		colorSelect: "black",
	},
};

export const reykjavikTokens: ThemeTokens = {
	...classiqueTokens,
	headerTitle: {
		...classiqueTokens.headerTitle,
		weightSelect: "lg",
		textAlign: "center",
		colorSelect: "black",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		weightSelect: "sm",
		textAlign: "center",
		colorSelect: "primaryColor",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		weightSelect: "sm",
		textAlign: "left",
		colorSelect: "black",
	},
};

export const krakowTokens: ThemeTokens = {
	...classiqueTokens,
	headerTitle: {
		...classiqueTokens.headerTitle,
		weightSelect: "lg",
		textAlign: "center",
		colorSelect: "black",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		weightSelect: "sm",
		textAlign: "center",
		colorSelect: "primaryColor",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		weightSelect: "sm",
		textAlign: "left",
		colorSelect: "black",
	},
};

export const shenzhenTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		sizeModel: "24px",
		weightModel: 700,
		colorSelect: "primaryColor",
		weightSelect: "lg",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "black",
		weightSelect: "sm",
		sizeSelect: "lg",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		sizeModel: "18px",
		weightModel: 500,
		colorSelect: "gray",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		sizeModel: "14px",
		weightModel: 600,
		colorSelect: "black",
	},
	itemTitle: {
		...classiqueTokens.itemTitle,
		sizeModel: "14px",
		weightModel: 500,
	},
	meta: {
		...classiqueTokens.meta,
		sizeModel: "12px",
		weightModel: 400,
	},
	body: {
		...classiqueTokens.body,
		sizeModel: "14px",
	},
};

export const eindhovenTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 700,
		colorSelect: "primaryColor",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "gray",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		textAlign: "right",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		weightSelect: "sm",
		textAlign: "center",
		colorSelect: "black",
	},
};

export const oxfordTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 700,
		colorSelect: "primaryColor",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "gray",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		textAlign: "right",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		weightSelect: "sm",
		textAlign: "center",
		colorSelect: "black",
	},
};

export const singaporeTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 700,
		colorSelect: "primaryColor",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "gray",
	},
	headerTitle: {
		...classiqueTokens.headerTitle,
		sizeModel: "18px",
		weightModel: 600,
		textAlign: "center",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		sizeModel: "18px",
		weightModel: 600,
		textAlign: "center",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		sizeModel: "14px",
		weightModel: 600,
		colorSelect: "black",
	},
	itemTitle: {
		...classiqueTokens.itemTitle,
		sizeModel: "14px",
		weightModel: 500,
	},
	meta: {
		...classiqueTokens.meta,
		sizeModel: "12px",
		weightModel: 400,
	},
	body: {
		...classiqueTokens.body,
		sizeModel: "12px",
	},
};

export const torontoTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 700,
		colorSelect: "primaryColor",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "gray",
	},
	headerTitle: {
		...classiqueTokens.headerTitle,
		sizeModel: "18px",
		weightModel: 600,
		textAlign: "center",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		sizeModel: "18px",
		weightModel: 600,
		textAlign: "center",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		sizeModel: "14px",
		weightModel: 600,
		colorSelect: "black",
	},
	itemTitle: {
		...classiqueTokens.itemTitle,
		sizeModel: "14px",
		weightModel: 500,
	},
	meta: {
		...classiqueTokens.meta,
		sizeModel: "12px",
		weightModel: 400,
	},
	body: {
		...classiqueTokens.body,
		sizeModel: "12px",
	},
};

// Berlin : header split — photo + coordonnées en sidebar, nom / prénom + intitulé en colonne 1
export const berlinTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		textAlign: "left",
		sizeModel: "26px",
		weightModel: 700,
		colorSelect: "black",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		textAlign: "left",
		sizeModel: "26px",
		weightModel: 400,
		colorSelect: "black",
	},
	headerTitle: {
		...classiqueTokens.headerTitle,
		sizeModel: "26px",
		weightModel: 700,
		colorSelect: "black",
		textAlign: "left",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		sizeModel: "18px",
		weightModel: 600,
		colorSelect: "primaryColor",
		textAlign: "left",
	},
	headerContent: {
		...classiqueTokens.headerContent,
		sizeModel: "12px",
		textAlign: "left",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		sizeModel: "14px",
		weightModel: 600,
		colorSelect: "black",
	},
	itemTitle: {
		...classiqueTokens.itemTitle,
		sizeModel: "14px",
		weightModel: 500,
	},
	meta: {
		...classiqueTokens.meta,
		sizeModel: "12px",
		weightModel: 400,
	},
	body: {
		...classiqueTokens.body,
		sizeModel: "12px",
	},
};

export const frankfurtTokens: ThemeTokens = {
	...classiqueTokens,
	headerNom: {
		...classiqueTokens.headerNom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 700,
		colorSelect: "primaryColor",
	},
	headerPrenom: {
		...classiqueTokens.headerPrenom,
		textAlign: "right",
		sizeModel: "28px",
		weightModel: 500,
		colorSelect: "gray",
	},
	headerTitle: {
		...classiqueTokens.headerTitle,
		sizeModel: "18px",
		weightModel: 600,
		textAlign: "center",
	},
	headerSubTitle: {
		...classiqueTokens.headerSubTitle,
		sizeModel: "18px",
		weightModel: 600,
		textAlign: "center",
	},
	sectionTitle: {
		...classiqueTokens.sectionTitle,
		sizeModel: "14px",
		weightModel: 600,
		colorSelect: "black",
	},
	itemTitle: {
		...classiqueTokens.itemTitle,
		sizeModel: "14px",
		weightModel: 500,
	},
	meta: {
		...classiqueTokens.meta,
		sizeModel: "12px",
		weightModel: 400,
	},
	body: {
		...classiqueTokens.body,
		sizeModel: "12px",
	},
};

/** Vienna — vitrine TwoColumnCenter (2×50 %). */
export const viennaTokens: ThemeTokens = {
	...berlinTokens,
};
