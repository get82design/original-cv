import { SelectButtonRhf } from "@/components/input/select-button/SelectButton";
import { Tooltip } from "primereact/tooltip";
import { MdInfo } from "react-icons/md";

interface SelectSizeProps {
	watchSelectInput: { sizeSelect: "xs" | "sm" | "md" | "lg" | "xl" };
	select: string;
}

export const SelectSize = ({ watchSelectInput, select }: SelectSizeProps) => {
	const sizeOptions: string[] = ["xs", "sm", "md", "lg", "xl"];
	const sizeTemplate = (option: string) => {
		return <div className="text-xs">{option}</div>;
	};
	return (
		<div className="flex flex-col gap-1">
			<div className="w-full flex gap-2 items-center">
				<p className="font-semibold text-xs">Taille :</p>
				<MdInfo className="infoTextSize text-sm text-primary dark:text-primary-dark" />
				<Tooltip target=".infoTextSize" content={"Taille du texte sélectionné"} />
			</div>
			<SelectButtonRhf
				className="shadow-none panel-modification"
				value={watchSelectInput?.sizeSelect}
				name={select + ".sizeSelect"}
				itemTemplate={sizeTemplate}
				options={sizeOptions}
				pt={{ button: { className: "p-button-sm text-xs py-1 px-2.5 min-h-[2rem]" } }}
			/>
		</div>
	);
};
