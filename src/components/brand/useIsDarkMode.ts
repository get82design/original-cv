import { useEffect, useState } from "react";

/** Suit la classe `dark` sur `<html>` (thème du site). */
export const useIsDarkMode = () => {
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
