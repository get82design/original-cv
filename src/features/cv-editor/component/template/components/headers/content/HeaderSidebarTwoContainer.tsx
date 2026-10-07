import type { JSX } from "react";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";

interface HeaderSidebarTwoContainerProps {
	modelGeneral: TemplateLayout;
	titleCompo: JSX.Element;
	subTitleCompo: JSX.Element;
	emailCompo: JSX.Element;
	phoneCompo: JSX.Element;
	locationCompo: JSX.Element;
	drivingLicenseCompo: JSX.Element;
	photo: JSX.Element;
}

/** Comme HeaderSidebarOne, avec le nom entre la photo et l’intitulé. */
export function HeaderSidebarTwoContainer({
	modelGeneral,
	titleCompo,
	subTitleCompo,
	emailCompo,
	phoneCompo,
	locationCompo,
	drivingLicenseCompo,
	photo,
}: HeaderSidebarTwoContainerProps) {
	return (
		<div className="flex flex-col justify-center items-center gap-6 p-4">
			{modelGeneral?.withPhoto && photo}
			{titleCompo}
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
