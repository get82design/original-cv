import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import type { HeaderChrome } from "../utils/headerLayout";
import type { JSX } from "react";

interface HeaderFiveContainerProps {
	modelGeneral: TemplateLayout;
	titleCompo: JSX.Element;
	subTitleCompo: JSX.Element;
	emailCompo: JSX.Element;
	phoneCompo: JSX.Element;
	locationCompo: JSX.Element;
	photo: JSX.Element;
}

export function HeaderFiveContainer({
	modelGeneral,
	titleCompo,
	subTitleCompo,
	emailCompo,
	phoneCompo,
	locationCompo,
	photo,
}: HeaderFiveContainerProps) {
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
			</div>
		</div>
	);
}
