import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang="fr">
			<Head>
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
