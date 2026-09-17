import { SelectButtonRhf } from "@/components/input/select-button/SelectButton";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";

interface GeneralMargeProps {
	watchMarge: "sm" | "md" | "lg";
}

export const GeneralMarge = ({ watchMarge }: GeneralMargeProps) => {
	const margeOptions: string[] = ["sm", "md", "lg"];
	const margeTemplate = (option: string) => {
		return <div className="text-xs">{option}</div>;
	};
	return (
		<div className="flex flex-col gap-1">
			<p className="my-0 font-semibold text-xs">Marges</p>
			<SelectButtonRhf
				className="shadow-none panel-modification"
				value={watchMarge}
				name={FieldNameLayoutGeneral.marge}
				itemTemplate={margeTemplate}
				options={margeOptions}
				unselectable={false}
				pt={{ button: { className: "p-button-sm text-xs py-1 px-2.5 min-h-[2rem]" } }}
			/>
		</div>
	);
};
