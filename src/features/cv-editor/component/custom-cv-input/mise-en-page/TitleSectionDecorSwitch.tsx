import { SelectButtonRhf } from "@/components/input/select-button/SelectButton";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { useFormContext } from "react-hook-form";

interface TitleSectionDecorSwitchProps {
	watchWithIcon: boolean;
}

interface DecorOption {
	name: string;
	value: boolean;
}

export const TitleSectionDecorSwitch = ({ watchWithIcon }: TitleSectionDecorSwitchProps) => {
	const { setValue } = useFormContext();
	const decorOptions: DecorOption[] = [
		{ name: "Icônes", value: true },
		{ name: "Lignes", value: false },
	];
	const decorTemplate = (option: DecorOption) => {
		return <div className="text-xs">{option.name}</div>;
	};

	return (
		<div className="flex flex-col gap-1">
			<p className="my-0 font-semibold text-xs">Décor</p>
			<SelectButtonRhf
				className="shadow-none panel-modification"
				value={watchWithIcon}
				name={FieldNameLayoutGeneral.withIcon}
				itemTemplate={decorTemplate}
				optionLabel="name"
				optionValue="value"
				options={decorOptions}
				unselectable={false}
				pt={{ button: { className: "p-button-sm text-xs py-1 px-2.5 min-h-[2rem]" } }}
				onChange={(e) => {
					const next = e.value as boolean;
					setValue(FieldNameLayoutGeneral.withIcon, next, {
						shouldDirty: true,
					});
					if (next) {
						setValue(FieldNameLayoutGeneral.withLigneDessus, false, {
							shouldDirty: true,
						});
						setValue(FieldNameLayoutGeneral.withLigneDessous, false, {
							shouldDirty: true,
						});
					} else {
						setValue(FieldNameLayoutGeneral.withLigneDessous, true, {
							shouldDirty: true,
						});
					}
				}}
			/>
		</div>
	);
};
