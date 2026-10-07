import type { JSX } from "react";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";

interface HeaderSidebarOneContainerProps {
	modelGeneral: TemplateLayout;
	titleCompo: JSX.Element;
	subTitleCompo: JSX.Element;
	emailCompo: JSX.Element;
	phoneCompo: JSX.Element;
	locationCompo: JSX.Element;
	drivingLicenseCompo: JSX.Element;
	photo: JSX.Element;
}

export function HeaderSidebarOneContainer({
	modelGeneral,
	titleCompo,
	subTitleCompo,
	emailCompo,
	phoneCompo,
	locationCompo,
	drivingLicenseCompo,
	photo,
}: HeaderSidebarOneContainerProps) {
	return (
		<div className="flex flex-col justify-center items-center gap-6 p-4">
			{titleCompo}
			{modelGeneral?.withPhoto && photo}
			{subTitleCompo}
			<div className="w-full bg-gray-400" style={{ height: "1px" }} />
			<div className="w-full flex flex-col gap-1">
				{emailCompo}
				{phoneCompo}
				{locationCompo}
				{drivingLicenseCompo}
			</div>
		</div>
	);
}
