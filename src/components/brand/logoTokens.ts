/** Famille Tailwind + shade pour teinter le logo. */
export type LogoColorRef = {
	name: string;
	primary?: string | null;
};

export type LogoTokens = {
	light: string;
	deep: string;
	bg: string;
	ink: string;
};

/** Couleur de marque du site — change `name` (teal, cyan, emerald…). */
export const SITE_BRAND_COLOR: LogoColorRef = {
	name: "teal",
	primary: "-600",
};

const tintPair = (primary: LogoColorRef | null | undefined) => {
	if (!primary?.name || primary.name === "black") {
		return {
			light: "var(--gray-300)",
			deep: "var(--gray-700)",
		};
	}
	return {
		light: `var(--${primary.name}-300)`,
		deep: `var(--${primary.name}${primary.primary || "-600"})`,
	};
};

/** Signature CV / export : toujours version print (fond blanc). */
export const logoTokensForCv = (
	primary: LogoColorRef | null | undefined,
): LogoTokens => {
	const { light, deep } = tintPair(primary);
	return {
		light,
		deep,
		bg: "var(--white)",
		ink: "#1d1d1b",
	};
};

/**
 * Logo site : suit le thème.
 * Dark = noir/blanc inversés ; deep un cran plus foncé pour le contraste (ex. -600 → -700).
 */
export const logoTokensForSite = (
	primary: LogoColorRef = SITE_BRAND_COLOR,
	isDark = false,
): LogoTokens => {
	const { light, deep } = tintPair(primary);

	if (!isDark) {
		return {
			light,
			deep,
			bg: "var(--white)",
			ink: "#1d1d1b",
		};
	}

	const shade = Number.parseInt(
		(primary.primary || "-600").replace("-", ""),
		10,
	);
	const deepDown = Number.isFinite(shade)
		? `-${Math.min(950, shade + 100)}`
		: "-700";
	const name = primary.name && primary.name !== "black" ? primary.name : "gray";

	return {
		light,
		deep:
			name === "gray"
				? "var(--gray-800)"
				: `var(--${name}${deepDown})`,
		bg: "var(--black)",
		ink: "var(--white)",
	};
};
