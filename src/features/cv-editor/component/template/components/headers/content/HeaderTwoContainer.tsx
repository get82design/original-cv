import {
	ChangeSpaceDocument,
	ChangeSpaceDocumentApercu,
} from "@/features/cv-editor/utils/utilsCv/marge";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import type { JSX } from "react";

interface HeaderTwoContainerProps {
	modelGeneral?: TemplateLayout;
	title: JSX.Element;
	subTitle: JSX.Element;
	emailCompo: JSX.Element;
	phoneCompo: JSX.Element;
	locationCompo: JSX.Element;
}

export const HeaderTwoContainer = ({
	modelGeneral,
	title,
	subTitle,
	emailCompo,
	phoneCompo,
	locationCompo,
}: HeaderTwoContainerProps) => {
	return (
		<div
			className={`w-full flex items-center flex-col pb-6 gap-1 px-1 ${
				modelGeneral
					? ChangeSpaceDocumentApercu(modelGeneral.space)
					: ChangeSpaceDocument()
			}`}
		>
			<div
				className="border py-1 px-4 relative inline-block"
				style={{ fontFamily: "var(--cv-font-headerTitle)" }}
			>
				{title}
			</div>
			<span className="w-full" style={{ fontFamily: "var(--cv-font-headerSubTitle)" }}>
				{subTitle}
			</span>
			<div className="w-full flex justify-center gap-3 mt-3">
				{emailCompo}
				<p>|</p>
				{phoneCompo}
				<p>|</p>
				{locationCompo}
			</div>
		</div>
	);
};
