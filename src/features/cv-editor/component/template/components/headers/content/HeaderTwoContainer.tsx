import type { JSX } from "react";
import {
	ChangeSpaceDocument,
	ChangeSpaceDocumentApercu,
} from "@/features/cv-editor/utils/utilsCv/marge";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";

interface HeaderTwoContainerProps {
	modelGeneral?: TemplateLayout;
	title: JSX.Element;
	subTitle: JSX.Element;
	emailCompo: JSX.Element;
	phoneCompo: JSX.Element;
	locationCompo: JSX.Element;
	drivingLicenseCompo: JSX.Element;
}

export const HeaderTwoContainer = ({
	modelGeneral,
	title,
	subTitle,
	emailCompo,
	phoneCompo,
	locationCompo,
	drivingLicenseCompo,
}: HeaderTwoContainerProps) => {
	return (
		<div
			className={`w-full flex items-center flex-col pb-6 gap-1 px-1 ${
				modelGeneral ? ChangeSpaceDocumentApercu(modelGeneral.space) : ChangeSpaceDocument()
			}`}
		>
			<div className="w-full grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
				<div />
				<div className="border py-1 px-4" style={{ fontFamily: "var(--cv-font-headerTitle)" }}>
					{title}
				</div>
				<div className="flex justify-end min-w-0">{drivingLicenseCompo}</div>
			</div>
			<span className="w-full" style={{ fontFamily: "var(--cv-font-headerSubTitle)" }}>
				{subTitle}
			</span>
			<div className="w-full flex flex-wrap justify-center items-center gap-x-3 gap-y-1 mt-3">
				{emailCompo}
				<p className="m-0 shrink-0">|</p>
				{phoneCompo}
				<p className="m-0 shrink-0">|</p>
				{locationCompo}
			</div>
		</div>
	);
};
