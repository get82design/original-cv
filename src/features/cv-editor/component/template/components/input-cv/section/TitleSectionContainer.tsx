import { useModelAndColorContext } from "@/features/cv-editor/component/context/ModelAndColorContext";
import { GetPrimaryColor, GetPrimaryColorApercu } from "@/features/cv-editor/utils/utilsCv/color";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import type { Color } from "@utils/trpc.types";
import { cloneElement, type JSX } from "react";

interface TitleSectionContainerProps {
	icon: JSX.Element | undefined;
	inputOutput: JSX.Element;
	general: TemplateLayout;
	modelName: string | undefined;
	primaryColor?: Color;
}

export const TitleSectionContainer = ({
	icon,
	inputOutput,
	general,
	modelName,
	primaryColor,
}: TitleSectionContainerProps) => {
	const primaryColorValue = primaryColor ? GetPrimaryColorApercu(primaryColor) : GetPrimaryColor();
	const { colors } = useModelAndColorContext();
	const watchLigneDessus = general.titleSection.withLigneDessus;
	const watchLigneDessous = general.titleSection.withLigneDessous;
	const watchWithIcon = general.titleSection.withIcon;
	const watchIconStyle = general.titleSection.iconStyle;
	const watchIconColor = general.titleSection.iconColor ?? "primaryColor";
	const watchLineWeight = general.titleSection.lineWeight;
	const bg = general.titleSection.bgColor;
	const shadeBg = general.titleSection.shadeBgColor;

	const [_name, info1, _info2] = modelName?.split("-") ?? [];

	const accent = general.pageAccent; // ou watch("layoutGeneral.layout.pageAccent")
	const onBand = accent?.type === "leftBand";

	const resolveColorToken = (colorName: string | undefined) => {
		if (colorName === "white" || colorName === "black") return colorName;
		if (!colorName || colorName === "primaryColor") {
			return primaryColorValue;
		}
		const found = colors?.find((color) => color.name === colorName);
		return found ? `${found.name}${found.primary ?? ""}` : primaryColorValue;
	};

	const baseToken = resolveColorToken(bg); // "gray-500" si bgColor = "primaryColor"
	const hue = baseToken.split("-")[0]; // "gray"
	const cssToken =
		bg && shadeBg && hue !== "white" && hue !== "black"
			? `${hue}${shadeBg}` // "gray" + "-100" → "gray-100"
			: baseToken;

	// Style "icon" : couleur de l’icône = iconColor
	// Styles flat/rounded : fond = primary, icône sombre pour le contraste
	const isChip = watchIconStyle !== "icon";
	const iconFgToken = !isChip
		? onBand
			? "white"
			: resolveColorToken(watchIconColor)
		: onBand
			? primaryColorValue
			: "white";

	const iconBg = !isChip
		? "transparent"
		: onBand
			? "var(--white)"
			: primaryColorValue
				? `var(--${primaryColorValue})`
				: "transparent";

	const iconBorderRadius =
		watchIconStyle === "flat" ? "15%" : watchIconStyle === "rounded" ? "50%" : "0";

	const iconColorCss = iconFgToken ? `var(--${iconFgToken})` : undefined;

	const coloredIcon =
		icon &&
		cloneElement(icon, {
			style: {
				...(icon.props?.style ?? {}),
				color: iconColorCss,
				width: icon.props?.style?.width ?? "16px",
				height: icon.props?.style?.height ?? "16px",
			},
		});

	return (
		<>
			{watchLigneDessus && (
				<div
					style={{
						backgroundColor: primaryColorValue ? `var(--${primaryColorValue})` : undefined,
						opacity: "1",
						height: watchLineWeight === "sm" ? "1px" : watchLineWeight === "md" ? "3px" : "5px",
					}}
					className="w-full"
				></div>
			)}
			<div
				className="w-full flex gap-2 items-center title-section-correctif"
				style={{
					fontFamily: "var(--cv-font-sectionTitle)",
					backgroundColor: bg ? `var(--${cssToken})` : undefined,
					padding: bg ? "2px 8px" : undefined, // sinon le fond est collé au texte, peu visible
				}}
			>
				{watchWithIcon && coloredIcon && (
					<div
						className="flex justify-center items-center mt-1"
						style={{
							width: "24px",
							height: "24px",
							backgroundColor: iconBg,
							borderRadius: iconBorderRadius,
							padding: "4px",
							color: iconColorCss,
						}}
					>
						{coloredIcon}
					</div>
				)}
				{inputOutput}
			</div>
			{watchLigneDessous && (
				<div
					style={{
						backgroundColor: primaryColorValue ? `var(--${primaryColorValue})` : undefined,
						opacity: "1",
						height: watchLineWeight === "sm" ? "1px" : watchLineWeight === "md" ? "3px" : "5px",
					}}
					className={`w-full ${watchLigneDessus || info1 === "line" ? "" : "-mt-1"} mb-0.5`}
				></div>
			)}
		</>
	);
};
