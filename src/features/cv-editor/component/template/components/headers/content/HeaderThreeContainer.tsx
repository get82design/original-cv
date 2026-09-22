import { ChangeSpaceDocumentApercu } from "@/features/cv-editor/utils/utilsCv/marge";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import type { JSX } from "react";
import { Image } from "primereact/image";
import type { HeaderChrome } from "../utils/headerLayout";

interface HeaderThreeContainerProps {
	modelGeneral: TemplateLayout;
	chrome: HeaderChrome;
	nomCompo: JSX.Element | undefined;
	prenomCompo: JSX.Element | undefined;
	subTitleCompo: JSX.Element;
	emailCompo: JSX.Element;
	phoneCompo: JSX.Element;
	locationCompo: JSX.Element;
}

export const HeaderThreeContainer = ({
	modelGeneral,
	chrome,
	nomCompo,
	prenomCompo,
	subTitleCompo,
	emailCompo,
	phoneCompo,
	locationCompo,
}: HeaderThreeContainerProps) => {
	return (
		<div
			className={`w-full flex pb-6 gap-4 px-1 ${chrome.rowClass} ${ChangeSpaceDocumentApercu(modelGeneral.space)}`}
		>
			{modelGeneral.withPhoto && (
				<div className="w-1/5 flex justify-center py-2 pr-4">
					<Image
						alt=""
						src="/assets/img/User-avatar.svg.png"
						width="160"
						height="160"
						imageClassName={
							modelGeneral.stylePhoto && modelGeneral.stylePhoto === "circle"
								? "rounded-full"
								: "rounded"
						}
					/>
				</div>
			)}
			<div className={`w-4/5 flex flex-col gap-3 px-4 ${chrome.textAlignClass}`}>
				<div className={`w-full flex flex-col gap-1 ${chrome.textAlignClass}`}>
					{nomCompo}
					{prenomCompo}
					{subTitleCompo}
				</div>
				<div className={`w-full flex flex-col gap-0 ${chrome.textAlignClass}`}>
					{phoneCompo}
					{emailCompo}
					{locationCompo}
				</div>
			</div>
		</div>
	);
};
