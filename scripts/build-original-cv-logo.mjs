import fs from "node:fs";

const path = "public/assets/img/originalCV.svg";
let svg = fs.readFileSync(path, "utf8");

const newStyle =
	"<style>.cls-1,.cls-3,.cls-8{fill:var(--logo-bg,#fff);}.cls-1{stroke:var(--logo-ink,#1d1d1b);stroke-width:2px;}.cls-1,.cls-4,.cls-5,.cls-6,.cls-7,.cls-8{stroke-miterlimit:10;}.cls-2,.cls-7{fill:var(--logo-light,#28996d);}.cls-4,.cls-5,.cls-6{fill:var(--logo-deep,#187551);}.cls-4,.cls-5,.cls-6,.cls-7,.cls-8{stroke:var(--logo-deep,#135740);}</style>";

svg = svg.replace(/<style>[\s\S]*?<\/style>/, newStyle);
fs.writeFileSync(path, svg);

const inner = svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
const styleMatch = inner.match(/<style>([\s\S]*?)<\/style>/);
if (!styleMatch) throw new Error("style not found");
const styleCss = styleMatch[1];
const withoutStyle = inner
	.replace(/<defs>\s*<style>[\s\S]*?<\/style>\s*<\/defs>/, "")
	.replace(/<style>[\s\S]*?<\/style>/, "")
	.replace(/\bclass=/g, "className=");

const tsx = `import type { CSSProperties, SVGProps } from "react";

const LOGO_CSS = ${JSON.stringify(styleCss)};

export type OriginalCvLogoTokens = {
	light?: string;
	deep?: string;
	bg?: string;
	ink?: string;
};

type OriginalCvLogoProps = SVGProps<SVGSVGElement> & {
	tokens?: OriginalCvLogoTokens;
};

/** Logo OriginalCV — tokens --logo-light / --logo-deep / --logo-bg / --logo-ink. */
export const OriginalCvLogo = ({
	tokens,
	style,
	className,
	...props
}: OriginalCvLogoProps) => {
	const tokenStyle = {
		...(tokens?.light ? { ["--logo-light"]: tokens.light } : {}),
		...(tokens?.deep ? { ["--logo-deep"]: tokens.deep } : {}),
		...(tokens?.bg ? { ["--logo-bg"]: tokens.bg } : {}),
		...(tokens?.ink ? { ["--logo-ink"]: tokens.ink } : {}),
	} as CSSProperties;

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 641 215.56"
			className={className}
			style={{ ...tokenStyle, ...style }}
			aria-label="OriginalCV"
			role="img"
			{...props}
		>
			<defs>
				<style dangerouslySetInnerHTML={{ __html: LOGO_CSS }} />
			</defs>
			${withoutStyle}
		</svg>
	);
};
`;

fs.mkdirSync("src/components/brand", { recursive: true });
fs.writeFileSync("src/components/brand/OriginalCvLogo.tsx", tsx);
console.log("written ok");
