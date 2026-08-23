import { useFormContext } from "react-hook-form";
import { GeneralMarge } from "./mise-en-page/GeneralMarge";
import { GeneralSpace } from "./mise-en-page/GeneralSpace";
import { TitleSectionTextTranform } from "./mise-en-page/TitleSectionTextTransform";
import { TitleSectionIcon } from "./mise-en-page/TitleSectionIcon";
import { TitleSectionLigne } from "./mise-en-page/TitleSectionLigne";
import { GeneralPhoto } from "./mise-en-page/GeneralPhoto";
import { GeneralFont } from "./mise-en-page/GeneralFont";

export const ModifMiseEnPage = () => {
	const { watch } = useFormContext();
	const watchMarge = watch("layoutGeneral.layout.marge");
	const watchSpace = watch("layoutGeneral.layout.space");
	// const primaryColor = PrimaryTextColorStyle()
	const watchWithIcon = watch("layoutGeneral.layout.titleSection.withIcon");
	const watchIconStyle = watch("layoutGeneral.layout.titleSection.iconStyle");
	const watchLigneDessous = watch(
		"layoutGeneral.layout.titleSection.withLigneDessous",
	);
	const watchLigneDessus = watch(
		"layoutGeneral.layout.titleSection.withLigneDessus",
	);
	const watchTitleSectionTextTransform = watch(
		"layoutGeneral.layout.titleSection.textTransform",
	);
	const watchWithPhoto = watch("layoutGeneral.layout.withPhoto");
	const watchStylePhoto = watch("layoutGeneral.layout.stylePhoto");
	return (
		<div className="flex flex-col gap-3">
			<GeneralFont />

			<div className="grid grid-cols-2 gap-8 items-start">
				<GeneralMarge watchMarge={watchMarge} />
				<GeneralSpace watchSpace={watchSpace} />
			</div>
			{/* <div>
					<GeneralFont />
					<GeneralMarge watchMarge={watchMarge} />
					<GeneralSpace watchSpace={watchSpace} />
				</div>
				<div>
					<GeneralPhoto
						watchWithPhoto={watchWithPhoto}
						watchStylePhoto={watchStylePhoto}
					/>
					<TitleSectionTextTranform
						watchTitleSectionTextTransform={watchTitleSectionTextTransform}
					/>
				</div>
			</div> */}
			{/* <div className="flex justify-center gap-8">
				<GeneralMarge watchMarge={watchMarge} />
				<GeneralSpace watchSpace={watchSpace} />
			</div> */}
			<TitleSectionTextTranform
				watchTitleSectionTextTransform={watchTitleSectionTextTransform}
			/>
			{watchWithIcon ? (
				<TitleSectionIcon watchIconStyle={watchIconStyle} />
			) : watchLigneDessus ||
				watchLigneDessus === false ||
				watchLigneDessous ||
				watchLigneDessous === false ? (
				<TitleSectionLigne
					watchLigneDessus={watchLigneDessus}
					watchLigneDessous={watchLigneDessous}
				/>
			) : null}
			<GeneralPhoto
				watchWithPhoto={watchWithPhoto}
				watchStylePhoto={watchStylePhoto}
			/>
		</div>
	);
};
