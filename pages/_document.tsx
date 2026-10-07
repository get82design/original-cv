import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang="fr">
			<Head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
				<link rel="icon" href="/favicon.ico" sizes="any" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: script thème FOUC, contenu statique
					dangerouslySetInnerHTML={{
						__html: `
              (function () {
                try {
                  var theme = localStorage.getItem("theme");
                  var dark =
                    theme === "dark" ||
                    (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
                  if (dark) document.documentElement.classList.add("dark");
                } catch (e) {}
              })();
            `,
					}}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
