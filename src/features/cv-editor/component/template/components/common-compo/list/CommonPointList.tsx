import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";

interface PointListProps {
	withoutLigne?: boolean;
	withTopMarge?: boolean;
	withIconMarge?: boolean;
	general: TemplateLayout;
}

export const CommonPointList = ({
	withoutLigne,
	withTopMarge,
	withIconMarge,
	general,
}: PointListProps) => {
	const watchWithIcon = general.titleSection.withIcon;
	const watchListStyle = general.listStyle;
	const watchIconStyle = general.titleSection.iconStyle;
	return (
		watchWithIcon &&
		watchListStyle !== "none" && (
			<div
				className={`absolute point-list-apercu h-2 w-2 bg-gray-600 ${
					withTopMarge
						? "top-5"
						: withIconMarge
							? "top-3"
							: withoutLigne
								? "top-2"
								: "top-1.5"
				} ${watchIconStyle === "rounded" ? "rounded-lg" : ""}`}
				style={{
					left: withoutLigne ? "-11px" : "-23px",
					transform: "rotate(45deg)",
				}}
			></div>
		)
	);
};
