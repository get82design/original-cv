import { SelectButtonRhf } from "@/components/input/select-button/SelectButton";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { Tooltip } from "primereact/tooltip";
import { MdInfo } from "react-icons/md";

interface GeneralMargeProps {
	watchMarge: "sm" | "md" | "lg";
}

export const GeneralMarge = ({ watchMarge }: GeneralMargeProps) => {
	// const primaryColor = PrimaryTextColorStyle()
	const margeOptions: string[] = ["sm", "md", "lg"];
	const margeTemplate = (option: string) => {
		return <div className="text-sm">{option}</div>;
	};
	return (
		<div className="flex gap-2 items-center justify-between">
			<p className="my-0 font-semibold text-xs">Marges</p>
			<SelectButtonRhf
				className="shadow-none panel-modification"
				value={watchMarge}
				name={FieldNameLayoutGeneral.marge}
				itemTemplate={margeTemplate}
				options={margeOptions}
				unselectable={false}
			/>
		</div>
	);
};
