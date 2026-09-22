import type { ReactNode } from "react";

type TemplateCatalogBadgesProps = {
	isFeatured?: boolean;
	isPremium?: boolean;
	locked?: boolean;
	/** compact = icônes + texte court (cartes petites) */
	size?: "sm" | "md";
	className?: string;
};

const sizeCls = {
	sm: "gap-0.5 text-[10px] px-1.5 py-0.5",
	md: "gap-1 text-[11px] px-2 py-1",
} as const;

function BadgePill({
	children,
	tone,
	size,
}: {
	children: ReactNode;
	tone: "spotlight" | "premium" | "locked";
	size: "sm" | "md";
}) {
	const tones = {
		spotlight:
			"border-amber-400/40 bg-gradient-to-r from-amber-500/95 to-orange-500/90 text-white shadow-sm shadow-amber-900/20",
		premium:
			"border-violet-400/30 bg-gradient-to-r from-violet-600/95 to-indigo-600/90 text-white shadow-sm shadow-violet-950/25",
		locked: "border-zinc-400/30 bg-zinc-900/85 text-zinc-100 shadow-sm backdrop-blur-sm",
	} as const;

	return (
		<span
			className={`inline-flex items-center rounded-full border font-semibold tracking-wide uppercase ${sizeCls[size]} ${tones[tone]}`}
		>
			{children}
		</span>
	);
}

/**
 * Badges catalogue produit (À la une / Premium / Verrouillé).
 */
export function TemplateCatalogBadges({
	isFeatured = false,
	isPremium = false,
	locked = false,
	size = "md",
	className = "",
}: TemplateCatalogBadgesProps) {
	if (!isFeatured && !isPremium) return null;

	return (
		<div
			className={`pointer-events-none flex flex-col items-end gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 ${className}`}
		>
			{isFeatured ? (
				<BadgePill tone="spotlight" size={size}>
					<i className="pi pi-star-fill text-[0.7em]" aria-hidden />À la une
				</BadgePill>
			) : null}
			{isPremium ? (
				locked ? (
					<BadgePill tone="locked" size={size}>
						<i className="pi pi-lock text-[0.7em]" aria-hidden />
						Premium
					</BadgePill>
				) : (
					<BadgePill tone="premium" size={size}>
						<i className="pi pi-bolt text-[0.7em]" aria-hidden />
						Premium
					</BadgePill>
				)
			) : null}
		</div>
	);
}
