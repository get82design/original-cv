import type { JSX } from "react";
import { ChangeSpaceDocumentApercu } from "@/features/cv-editor/utils/utilsCv/marge";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";

interface HeaderSplitSidebarContainerProps {
	modelGeneral: TemplateLayout;
	photo: JSX.Element;
	emailCompo: JSX.Element;
	phoneCompo: JSX.Element;
	locationCompo: JSX.Element;
}

/** Slot sidebar du header split : photo + coordonnées. */
export const HeaderSplitSidebarContainer = ({
	modelGeneral,
	photo,
	emailCompo,
	phoneCompo,
	locationCompo,
}: HeaderSplitSidebarContainerProps) => {
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

interface HeaderSplitMainContainerProps {
	modelGeneral: TemplateLayout;
	titleCompo: JSX.Element;
	subTitleCompo: JSX.Element;
}

/** Slot colonne principale du header split : nom / prénom puis intitulé. */
export const HeaderSplitMainContainer = ({
	modelGeneral,
	titleCompo,
	subTitleCompo,
}: HeaderSplitMainContainerProps) => {
	return (
		<div
			className={`w-full flex flex-col gap-0 pb-4 ${ChangeSpaceDocumentApercu(modelGeneral?.space)}`}
		>
			<div
				className="w-full"
				style={{ fontFamily: "var(--cv-font-headerTitle)" }}
			>
				{titleCompo}
			</div>
			<div
				className="w-full"
				style={{ fontFamily: "var(--cv-font-headerSubTitle)" }}
			>
				{subTitleCompo}
			</div>
			<div className="w-full bg-gray-400" style={{ height: "1px" }} />
		</div>
	);
};
