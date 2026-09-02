import { GetPrimaryColor } from "@/features/cv-editor/utils/utilsCv/color";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import type { JSX } from "react";
import { useFormContext } from "react-hook-form";

interface HeaderContentProps {
	modelGeneral: TemplateLayout;
	nomCompo: JSX.Element | undefined;
	prenomCompo: JSX.Element | undefined;
	subTitleCompo: JSX.Element;
	emailCompo: JSX.Element;
	phoneCompo: JSX.Element;
	locationCompo: JSX.Element;
	photo: JSX.Element;
}

export const HeaderFourContainer = ({
	modelGeneral,
	nomCompo,
	prenomCompo,
	subTitleCompo,
	emailCompo,
	phoneCompo,
	locationCompo,
	photo,
}: HeaderContentProps) => {
	const { watch } = useFormContext();
	const headerPrimaryColor = watch("layoutGeneral.layout.headerPrimaryColor");
	const primaryColor = GetPrimaryColor();

	return (
		<div className="flex flex-col gap-2">
			<div
				style={{
					backgroundColor: headerPrimaryColor
						? `var(--${primaryColor})`
						: "var(--gray-700)",
				}}
				className={`w-full h-6`}
			></div>
			<div className="w-full flex justify-end gap-2">
				<div className="w-full flex flex-col gap-0">
					<div className="flex justify-end items-end gap-2">
						{nomCompo}
						{prenomCompo}
					</div>
					{subTitleCompo}
					<div className="w-full flex flex-col gap-0">
						{emailCompo}
						{phoneCompo}
						{locationCompo}
					</div>
				</div>
				{modelGeneral?.withPhoto && photo}
			</div>
		</div>
	);
};
