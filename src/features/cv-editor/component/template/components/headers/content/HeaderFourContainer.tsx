import type { JSX } from "react";
import { useFormContext } from "react-hook-form";
import { GetPrimaryColor } from "@/features/cv-editor/utils/utilsCv/color";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import type { HeaderChrome } from "../utils/headerLayout";

interface HeaderContentProps {
	modelGeneral: TemplateLayout;
	chrome: HeaderChrome;
	nomCompo: JSX.Element | undefined;
	prenomCompo: JSX.Element | undefined;
	subTitleCompo: JSX.Element;
	emailCompo: JSX.Element;
	phoneCompo: JSX.Element;
	locationCompo: JSX.Element;
	drivingLicenseCompo: JSX.Element;
	photo: JSX.Element;
}

export const HeaderFourContainer = ({
	modelGeneral,
	chrome,
	nomCompo,
	prenomCompo,
	subTitleCompo,
	emailCompo,
	phoneCompo,
	locationCompo,
	drivingLicenseCompo,
	photo,
}: HeaderContentProps) => {
	const { watch } = useFormContext();
	const headerPrimaryColor = watch("layoutGeneral.layout.headerPrimaryColor");
	const primaryColor = GetPrimaryColor();

	const nameRowClass =
		chrome.photoSide === "right"
			? "flex flex-wrap justify-end items-end gap-2 min-w-0"
			: "flex flex-wrap justify-start items-end gap-2 min-w-0";

	return (
		<div className="flex flex-col gap-2">
			<div
				style={{
					backgroundColor: headerPrimaryColor ? `var(--${primaryColor})` : "var(--gray-700)",
				}}
				className={`w-full h-6`}
			/>
			{/* photo à droite = flex-row (texte puis photo) ; à gauche = reverse */}
			<div
				className={`w-full min-w-0 flex items-start gap-2 ${
					chrome.photoSide === "right" ? "flex-row" : "flex-row-reverse"
				}`}
			>
				<div className={`min-w-0 flex-1 flex flex-col gap-0 ${chrome.textAlignClass}`}>
					<div className={nameRowClass}>
						{nomCompo}
						{prenomCompo}
					</div>
					{subTitleCompo}
					<div className={`w-full flex flex-col gap-0 ${chrome.textAlignClass}`}>
						{emailCompo}
						{phoneCompo}
						{locationCompo}
						{drivingLicenseCompo}
					</div>
				</div>
				{modelGeneral?.withPhoto && <div className="shrink-0">{photo}</div>}
			</div>
		</div>
	);
};
