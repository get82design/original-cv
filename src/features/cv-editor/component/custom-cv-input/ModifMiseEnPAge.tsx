import { useFormContext } from "react-hook-form";
import { GeneralMarge } from "./mise-en-page/GeneralMarge";
import { GeneralSpace } from "./mise-en-page/GeneralSpace";
import { TitleSectionTextTranform } from "./mise-en-page/TitleSectionTextTransform";
import { TitleSectionIcon } from "./mise-en-page/TitleSectionIcon";
import { TitleSectionLigne } from "./mise-en-page/TitleSectionLigne";
import { TitleSectionDecorSwitch } from "./mise-en-page/TitleSectionDecorSwitch";
import { GeneralPhoto } from "./mise-en-page/GeneralPhoto";
import { GeneralFont } from "./mise-en-page/GeneralFont";
import { FieldNameLayoutGeneral } from "../../utils/fields/fieldNameLayoutGeneral";
import { GeneralSidebar } from "./mise-en-page/GeneralSidebar";
import { GeneralColor } from "./GeneralColor";

export const ModifMiseEnPage = () => {
	const { watch } = useFormContext();
	const watchMarge = watch(FieldNameLayoutGeneral.marge);
	const watchSpace = watch(FieldNameLayoutGeneral.space);
	const watchWithIcon = watch(FieldNameLayoutGeneral.withIcon);
	const watchIconStyle = watch(FieldNameLayoutGeneral.iconStyle);
	const watchLigneDessous = watch(FieldNameLayoutGeneral.withLigneDessous);
	const watchLigneDessus = watch(FieldNameLayoutGeneral.withLigneDessus);
	const watchTitleSectionTextTransform = watch(
		FieldNameLayoutGeneral.textTransform,
	);
	const watchWithPhoto = watch(FieldNameLayoutGeneral.withPhoto);
	const watchStylePhoto = watch(FieldNameLayoutGeneral.stylePhoto);
	const watchPhotoSide = watch(FieldNameLayoutGeneral.photoSide);
	const watchLockPhotoSide = watch(FieldNameLayoutGeneral.lockPhotoSide);
	return (
		<div className="flex flex-col gap-2 px-1">
			<GeneralColor />
			<GeneralPhoto
				watchWithPhoto={watchWithPhoto}
				watchStylePhoto={watchStylePhoto}
				watchPhotoSide={watchPhotoSide}
				watchLockPhotoSide={watchLockPhotoSide}
			/>
			<GeneralFont />
			<GeneralSidebar />
			<div className="grid grid-cols-2 gap-1 items-start">
				<GeneralMarge watchMarge={watchMarge} />
				<GeneralSpace watchSpace={watchSpace} />
			</div>
			<div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-1 items-start">
				<TitleSectionTextTranform
					watchTitleSectionTextTransform={watchTitleSectionTextTransform}
				/>
				<TitleSectionDecorSwitch watchWithIcon={watchWithIcon} />
			</div>
			{watchWithIcon ? (
				<TitleSectionIcon watchIconStyle={watchIconStyle} />
			) : (
				<TitleSectionLigne
					watchLigneDessus={watchLigneDessus}
					watchLigneDessous={watchLigneDessous}
				/>
			)}
		</div>
	);
};
