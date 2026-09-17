import { SelectButtonRhf } from "@/components/input/select-button/SelectButton";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";

interface GeneralSpaceProps {
	watchSpace: "sm" | "md" | "lg";
}

export const GeneralSpace = ({ watchSpace }: GeneralSpaceProps) => {
	const spaceOptions: string[] = ["sm", "md", "lg"];
	const spaceTemplate = (option: string) => {
		return <div className="text-xs">{option}</div>;
	};
	return (
		<div className="flex flex-col gap-1">
			<p className="my-0 font-semibold text-xs">Espaces</p>
			<SelectButtonRhf
				className="shadow-none panel-modification"
				value={watchSpace}
				name={FieldNameLayoutGeneral.space}
				itemTemplate={spaceTemplate}
				options={spaceOptions}
				unselectable={false}
				pt={{ button: { className: "p-button-sm text-xs py-1 px-2.5 min-h-[2rem]" } }}
			/>
		</div>
	);
};
