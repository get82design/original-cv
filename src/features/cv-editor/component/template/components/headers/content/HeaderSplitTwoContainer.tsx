import type { JSX } from "react";
import { ChangeSpaceDocumentApercu } from "@/features/cv-editor/utils/utilsCv/marge";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";

interface HeaderSplitTwoSidebarContainerProps {
	modelGeneral: TemplateLayout;
	photo: JSX.Element;
}

/** Slot sidebar de HeaderSplitTwo : photo seule. */
export const HeaderSplitTwoSidebarContainer = ({
	modelGeneral,
	photo,
}: HeaderSplitTwoSidebarContainerProps) => {
	return (
		<div
			className={`w-full flex flex-col items-center pb-4 ${ChangeSpaceDocumentApercu(
				modelGeneral?.space,
			)}`}
		>
			{modelGeneral?.withPhoto && photo}
		</div>
	);
};

interface HeaderSplitTwoMainContainerProps {
	modelGeneral: TemplateLayout;
	titleCompo: JSX.Element;
	subTitleCompo: JSX.Element;
	emailCompo: JSX.Element;
	phoneCompo: JSX.Element;
	locationCompo: JSX.Element;
	drivingLicenseCompo: JSX.Element;
}

/** Slot colonne principale de HeaderSplitTwo : identité, trait, puis contacts. */
export const HeaderSplitTwoMainContainer = ({
	modelGeneral,
	titleCompo,
	subTitleCompo,
	emailCompo,
	phoneCompo,
	locationCompo,
	drivingLicenseCompo,
}: HeaderSplitTwoMainContainerProps) => {
	return (
		<div
			className={`w-full flex flex-col gap-0 pb-4 ${ChangeSpaceDocumentApercu(modelGeneral?.space)}`}
		>
			<div className="w-full" style={{ fontFamily: "var(--cv-font-headerTitle)" }}>
				{titleCompo}
			</div>
			<div className="w-full" style={{ fontFamily: "var(--cv-font-headerSubTitle)" }}>
				{subTitleCompo}
			</div>
			<div className="w-full bg-gray-400" style={{ height: "1px" }} />
			<div className="w-full flex flex-wrap gap-x-4 gap-y-0.5 mt-2">
				{emailCompo}
				{phoneCompo}
				{locationCompo}
				{drivingLicenseCompo}
			</div>
		</div>
	);
};
