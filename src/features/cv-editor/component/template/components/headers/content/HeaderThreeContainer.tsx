import { ChangeSpaceDocumentApercu } from "@/features/cv-editor/utils/utilsCv/marge";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import type { JSX } from "react";
import { Image } from "primereact/image";

interface HeaderThreeContainerProps {
	modelGeneral: TemplateLayout;
	nomCompo: JSX.Element | undefined;
	prenomCompo: JSX.Element | undefined;
	subTitleCompo: JSX.Element;
	emailCompo: JSX.Element;
	phoneCompo: JSX.Element;
	locationCompo: JSX.Element;
}

export const HeaderThreeContainer = ({
	modelGeneral,
	nomCompo,
	prenomCompo,
	subTitleCompo,
	emailCompo,
	phoneCompo,
	locationCompo,
}: HeaderThreeContainerProps) => {
	return (
		<div
			className={`w-full flex pb-6 gap-4 px-1 ${ChangeSpaceDocumentApercu(modelGeneral.space)}`}
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
			<div className="w-4/5 flex flex-col gap-3 px-4">
				<div className="w-full flex flex-col gap-1">
					{nomCompo}
					{prenomCompo}
					{subTitleCompo}
				</div>
				<div className="w-full flex flex-col gap-0">
					{phoneCompo}
					{emailCompo}
					{locationCompo}
				</div>
			</div>
		</div>
	);
};
