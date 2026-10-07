import { logoTokensForSite, SITE_BRAND_COLOR } from "@/components/brand/logoTokens";
import { OriginalCvLogo } from "@/components/brand/OriginalCvLogo";
import { useIsDarkMode } from "@/components/brand/useIsDarkMode";

/** Logo du site — light/dark, distinct de la signature CV. */
export const SiteBrandLogo = ({ className }: { className?: string }) => {
	const isDark = useIsDarkMode();
	const tokens = logoTokensForSite(SITE_BRAND_COLOR, isDark);

	return <OriginalCvLogo className={className} tokens={tokens} />;
};
