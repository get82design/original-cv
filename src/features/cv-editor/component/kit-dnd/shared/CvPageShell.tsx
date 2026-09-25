import type { CSSProperties, ReactNode } from "react";
import { CvSignature } from "../../brand/CvSignature";
import { CV_PAGE_HEIGHT, CV_PAGE_WIDTH } from "@/features/cv-editor/utils/cvPage";

interface CvPageShellProps {
	children: ReactNode;
	/** Index 0-based — data-cv-page + classe pour capture. */
	pageIndex: number;
	paddingClass: string;
	pagePad: string;
	background: string;
	className?: string;
	style?: CSSProperties;
}

/** Cadre A4 partagé : chrome (fond, accent, signature) + zone contenu. */
export function CvPageShell({
	children,
	pageIndex,
	paddingClass,
	pagePad,
	background,
	className = "",
	style,
}: CvPageShellProps) {
	return (
		<div
			className={`cv-page-document shadow-lg relative bg-white [overflow-anchor:none] ${paddingClass} ${className}`}
			data-cv-page={pageIndex}
			style={{
				width: CV_PAGE_WIDTH,
				height: CV_PAGE_HEIGHT,
				["--page-pad" as string]: pagePad,
				background,
				...style,
			}}
		>
			<CvSignature />
			{children}
		</div>
	);
}
