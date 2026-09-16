import { SelectButtonRhf } from "@/components/input/select-button/SelectButton";
import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";

interface TitleIconOption {
	name: string;
	value: string;
}
interface GeneralPhotoProps {
	watchWithPhoto: boolean;
	watchStylePhoto: "circle" | "flat";
	watchPhotoSide: "left" | "right";
	watchLockPhotoSide: boolean;
}

export const GeneralPhoto = ({
	watchWithPhoto,
	watchStylePhoto,
	watchPhotoSide,
	watchLockPhotoSide,
}: GeneralPhotoProps) => {
	const photoOptions = [
		{ value: "flat", name: "Carré" },
		{ value: "circle", name: "Rond" },
	];
	const photoSideOptions = [
		{ value: "left", name: "Gauche" },
		{ value: "right", name: "Droite" },
	];
	const photoTemplate = (option: TitleIconOption) => {
		return <div className="text-sm">{option.name}</div>;
	};
	return (
		(watchWithPhoto || watchWithPhoto === false) && !watchLockPhotoSide && (
			<div className="flex flex-col gap-1">
				<p className="my-0 font-semibold text-xs">Photo</p>
				<div className="flex gap-2 items-center justify-between general-photo">
					<ToggleAfficherCacher name="layoutGeneral.layout.withPhoto" />
					{watchWithPhoto && (
						<SelectButtonRhf
							className="shadow-none"
							value={watchStylePhoto}
							name={FieldNameLayoutGeneral.stylePhoto}
							itemTemplate={photoTemplate}
							optionValue="value"
							options={photoOptions}
							unselectable={false}
						/>
					)}
					{watchPhotoSide && (
						<SelectButtonRhf
							className="shadow-none"
							value={watchPhotoSide}
							name={FieldNameLayoutGeneral.photoSide}
							itemTemplate={photoTemplate}
							optionValue="value"
							options={photoSideOptions}
							unselectable={false}					
						/>
					)}
				</div>
			</div>
		)
	);
};
