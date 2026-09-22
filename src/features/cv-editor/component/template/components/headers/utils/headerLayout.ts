import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";

export type HeaderTextAlign = "left" | "center" | "right";

export type HeaderChrome = {
	photoSide: "left" | "right";
	/** Classes flex pour la rangée photo + contenu */
	rowClass: string;
	/** Classes Tailwind sur le bloc texte (flex align) */
	textAlignClass: string;
	/** Prop textAlign des inputs (InputTextCv, EmailInput, …) */
	textAlign: HeaderTextAlign;
	/** Alignements contacts — HeaderOne (grille 3 cols) */
	contacts: {
		email: HeaderTextAlign;
		phone: HeaderTextAlign;
		location: HeaderTextAlign;
	};
};

export function getHeaderChrome(layout: TemplateLayout | undefined): HeaderChrome {
	const side = layout?.photoSide ?? "left";
	const textAlign: HeaderTextAlign = side === "right" ? "right" : "left";

	return {
		photoSide: side,
		rowClass: side === "right" ? "flex-row-reverse" : "flex-row",
		textAlignClass: side === "right" ? "text-right items-end" : "text-left items-start",
		textAlign,
		contacts:
			side === "right"
				? { email: "right", phone: "center", location: "left" }
				: { email: "left", phone: "center", location: "right" },
	};
}
