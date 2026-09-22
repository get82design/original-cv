import { OriginalCvLogo } from "@/components/brand/OriginalCvLogo";
import { logoTokensForSite, SITE_BRAND_COLOR } from "@/components/brand/logoTokens";
import { useEffect, useState } from "react";

const useIsDarkMode = () => {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const root = document.documentElement;
		const sync = () => setIsDark(root.classList.contains("dark"));
		sync();
		const obs = new MutationObserver(sync);
		obs.observe(root, { attributes: true, attributeFilter: ["class"] });
		return () => obs.disconnect();
	}, []);

	return isDark;
};

/** Logo du site — light/dark, distinct de la signature CV. */
export const SiteBrandLogo = ({ className }: { className?: string }) => {
	const isDark = useIsDarkMode();
	const tokens = logoTokensForSite(SITE_BRAND_COLOR, isDark);

	return <OriginalCvLogo className={className} tokens={tokens} />;
};
