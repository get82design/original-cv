import type { JSX } from "react";
import { ChangeSpaceDocumentApercu } from "@/features/cv-editor/utils/utilsCv/marge";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";

interface HeaderSplitOneSidebarContainerProps {
	modelGeneral: TemplateLayout;
	photo: JSX.Element;
	emailCompo: JSX.Element;
	phoneCompo: JSX.Element;
	locationCompo: JSX.Element;
}

/** Slot sidebar de HeaderSplitOne : photo + coordonnées. */
export const HeaderSplitOneSidebarContainer = ({
	modelGeneral,
	photo,
	emailCompo,
	phoneCompo,
	locationCompo,
}: HeaderSplitOneSidebarContainerProps) => {
	return (
		<div
			className={`w-full flex flex-col items-center gap-3 pb-4 ${ChangeSpaceDocumentApercu(
				modelGeneral?.space,
			)}`}
		>
			{modelGeneral?.withPhoto && photo}
			{/* Contacts empilés : le libellé email peut être long, une rangée déborderait */}
			<div className="w-full flex flex-col gap-0.5">
				{emailCompo}
				{phoneCompo}
				{locationCompo}
			</div>
		</div>
	);
};

interface HeaderSplitOneMainContainerProps {
	modelGeneral: TemplateLayout;
	titleCompo: JSX.Element;
	subTitleCompo: JSX.Element;
}

/** Slot colonne principale de HeaderSplitOne : nom / prénom puis intitulé. */
export const HeaderSplitOneMainContainer = ({
	modelGeneral,
	titleCompo,
	subTitleCompo,
}: HeaderSplitOneMainContainerProps) => {
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
		</div>
	);
};
