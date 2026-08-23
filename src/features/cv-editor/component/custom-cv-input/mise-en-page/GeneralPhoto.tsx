import { SelectButtonRhf } from "@/components/input/select-button/SelectButton";
import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { Tooltip } from "primereact/tooltip";
import { MdInfo } from "react-icons/md";

interface TitleIconOption {
	name: string;
	value: string;
}
interface GeneralPhotoProps {
	watchWithPhoto: boolean;
	watchStylePhoto: "circle" | "flat";
}

export const GeneralPhoto = ({
	watchWithPhoto,
	watchStylePhoto,
}: GeneralPhotoProps) => {
	const photoOptions = [
		{ value: "flat", name: "Carré" },
		{ value: "circle", name: "Rond" },
	];
	const photoTemplate = (option: TitleIconOption) => {
		return <div className="text-sm">{option.name}</div>;
	};
	return (
		(watchWithPhoto || watchWithPhoto === false) && (
			<div className="flex gap-8 items-center general-photo">
				<p className="my-0 font-semibold text-sm">Photo</p>
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
			</div>
		)
	);
};
