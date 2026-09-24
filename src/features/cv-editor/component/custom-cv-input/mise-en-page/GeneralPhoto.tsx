import { SelectButtonRhf } from "@/components/input/select-button/SelectButton";
import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import type { StylePhoto } from "@/services/schemas/cvTemplate.schema";

interface TitleIconOption {
	name: string;
	value: string;
}
interface GeneralPhotoProps {
	watchWithPhoto: boolean;
	watchStylePhoto: StylePhoto;
	watchPhotoSide: "left" | "right";
	watchLockPhotoSide: boolean;
}

const compactButtonPt = {
	button: {
		className:
			"p-button-sm text-xs py-0 px-2.5 h-8 min-h-[2rem] inline-flex items-center justify-center",
	},
};

export const GeneralPhoto = ({
	watchWithPhoto,
	watchStylePhoto,
	watchPhotoSide,
	watchLockPhotoSide,
}: GeneralPhotoProps) => {
	const photoOptions = [
		{ value: "flat", name: "Carré" },
		{ value: "rounded", name: "Arrondi" },
		{ value: "circle", name: "Rond" },
	];
	const photoSideOptions = [
		{ value: "left", name: "Gauche" },
		{ value: "right", name: "Droite" },
	];
	const photoTemplate = (option: TitleIconOption) => {
		return <div className="text-xs">{option.name}</div>;
	};
	return (
		(watchWithPhoto || watchWithPhoto === false) && (
			<div className="flex flex-col gap-1">
				<p className="my-0 font-semibold text-xs">Photo</p>
				<div className="flex gap-1 items-center general-photo">
					<ToggleAfficherCacher name="layoutGeneral.layout.withPhoto" compact />
					{watchWithPhoto && (
						<SelectButtonRhf
							className="shadow-none"
							value={watchStylePhoto}
							name={FieldNameLayoutGeneral.stylePhoto}
							itemTemplate={photoTemplate}
							optionValue="value"
							options={photoOptions}
							unselectable={false}
							pt={compactButtonPt}
						/>
					)}
					{watchWithPhoto && watchPhotoSide && !watchLockPhotoSide && (
						<SelectButtonRhf
							className="shadow-none"
							value={watchPhotoSide}
							name={FieldNameLayoutGeneral.photoSide}
							itemTemplate={photoTemplate}
							optionValue="value"
							options={photoSideOptions}
							unselectable={false}
							pt={compactButtonPt}
						/>
					)}
				</div>
			</div>
		)
	);
};
