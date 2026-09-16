import { SelectButtonRhf } from "@/components/input/select-button/SelectButton";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { Tooltip } from "primereact/tooltip";
import { MdInfo } from "react-icons/md";

interface TitleSectionIconProps {
	watchIconStyle: "icon" | "flat" | "rounded";
}
interface TitleIconOption {
	name: string;
	value: string;
}

export const TitleSectionIcon = ({ watchIconStyle }: TitleSectionIconProps) => {
	const iconOptions: TitleIconOption[] = [
		{ value: "icon", name: "Simple" },
		{ value: "flat", name: "Carré" },
		{ value: "rounded", name: "Rond" },
	];
	const iconTemplate = (option: TitleIconOption) => {
		return <div className="text-sm">{option.name}</div>;
	};

	return (
		<div className="flex flex-col gap-1">
			<div className="flex gap-1 items-center">
				<p className="my-0 font-semibold text-xs">Icones</p>
				<MdInfo className="infoIconTitleSectionStyle text-sm text-muted-color" />
				<Tooltip
					target=".infoIconTitleSectionStyle"
					content={"Modifier l'icone des titres"}
				/>
			</div>
			<SelectButtonRhf
				className="shadow-none panel-modification"
				value={watchIconStyle}
				name={FieldNameLayoutGeneral.iconStyle}
				itemTemplate={iconTemplate}
				optionValue="value"
				options={iconOptions}
				unselectable={false}
			/>
		</div>
	);
};
