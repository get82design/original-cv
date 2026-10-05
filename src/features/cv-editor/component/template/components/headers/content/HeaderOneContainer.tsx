import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import type { JSX } from "react";
import { ChangeSpaceDocumentApercu } from "../../../../../utils/utilsCv/marge";
import type { HeaderChrome } from "../utils/headerLayout";

interface HeaderContentProps {
	modelGeneral: TemplateLayout;
	titleCompo: JSX.Element;
	subTitleCompo: JSX.Element;
	emailCompo: JSX.Element;
	phoneCompo: JSX.Element;
	locationCompo: JSX.Element;
	drivingLicenseCompo: JSX.Element;
	photo: JSX.Element;
	chrome: HeaderChrome;
}

export const HeaderOneContainer = ({
	modelGeneral,
	chrome,
	titleCompo,
	subTitleCompo,
	emailCompo,
	phoneCompo,
	locationCompo,
	drivingLicenseCompo,
	photo,
}: HeaderContentProps) => {
	return (
		<div
			className={`w-full flex flex-col gap-1 px-1 ${ChangeSpaceDocumentApercu(modelGeneral?.space)}`}
		>
			<div className={`w-full flex gap-4 ${chrome.rowClass}`}>
				{modelGeneral?.withPhoto && photo}
				<div className={`header-content w-full flex flex-col gap-0 ${chrome.textAlignClass}`}>
					<div className="w-full flex justify-between items-start gap-3">
						<div className="min-w-0 flex-1">{titleCompo}</div>
						<div className="shrink-0 max-w-[48%] self-start mt-2">{drivingLicenseCompo}</div>
					</div>
					<div className="-mt-2 w-full">{subTitleCompo}</div>
					<div className="w-full grid grid-cols-3 mt-3">
						{emailCompo}
						{phoneCompo}
						{locationCompo}
					</div>
				</div>
			</div>
			<div className="w-full bg-gray-400" style={{ height: "1px" }} />
		</div>
	);
};
