import type { SVGProps } from "react";
import { logoTokensForSite, SITE_BRAND_COLOR } from "@/components/brand/logoTokens";
import { OriginalCvMark } from "@/components/brand/OriginalCvMark";
import { useIsDarkMode } from "@/components/brand/useIsDarkMode";

type SiteBrandMarkProps = SVGProps<SVGSVGElement>;

/** Pictogramme du site — mêmes tokens que `SiteBrandLogo` (couleur de marque + light/dark). */
export const SiteBrandMark = ({ className, ...props }: SiteBrandMarkProps) => {
	const isDark = useIsDarkMode();
	const tokens = logoTokensForSite(SITE_BRAND_COLOR, isDark);

	return <OriginalCvMark className={className} tokens={tokens} {...props} />;
};
