import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { SelectButton } from "primereact/selectbutton";
import { Tooltip } from "primereact/tooltip";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { MdInfo } from "react-icons/md";

interface TitleSectionLigneProps {
	watchLigneDessus: boolean;
	watchLigneDessous: boolean;
}

export const TitleSectionLigne = ({
	watchLigneDessus,
	watchLigneDessous,
}: TitleSectionLigneProps) => {
	const { setValue } = useFormContext();
	const [iconStyle, setIconStyle] = useState<"Aucun" | "Dessus" | "Dessous" | "Les 2">();
	const iconOptions = ["Aucun", "Dessus", "Dessous", "Les 2"];
	useEffect(() => {
		if (watchLigneDessous && watchLigneDessus) {
			setIconStyle("Les 2");
		}
		if (watchLigneDessous && !watchLigneDessus) {
			setIconStyle("Dessous");
		}
		if (!watchLigneDessous && watchLigneDessus) {
			setIconStyle("Dessus");
		}
		if (!watchLigneDessous && !watchLigneDessus) {
			setIconStyle("Aucun");
		}
	}, [watchLigneDessus, watchLigneDessous]);
	useEffect(() => {
		switch (iconStyle) {
			case "Aucun":
				setValue(FieldNameLayoutGeneral.withLigneDessous, false);
				setValue(FieldNameLayoutGeneral.withLigneDessus, false);
				break;
			case "Dessus":
				setValue(FieldNameLayoutGeneral.withLigneDessous, false);
				setValue(FieldNameLayoutGeneral.withLigneDessus, true);
				break;
			case "Dessous":
				setValue(FieldNameLayoutGeneral.withLigneDessous, true);
				setValue(FieldNameLayoutGeneral.withLigneDessus, false);
				break;
			case "Les 2":
				setValue(FieldNameLayoutGeneral.withLigneDessous, true);
				setValue(FieldNameLayoutGeneral.withLigneDessus, true);
				break;
			default:
				break;
		}
	}, [iconStyle]);
	const titleTransformTemplate = (option: string) => {
		return <div className="text-xs">{option}</div>;
	};
	return (
		<div className="flex flex-col gap-1">
			<div className="flex gap-1 items-center">
				<p className="my-0 font-semibold text-xs">Lignes</p>
				<MdInfo className="infoIconTitleSection text-sm text-muted-color" />
				<Tooltip target=".infoIconTitleSection" content={"Modifier les lignes des titres"} />
			</div>
			<SelectButton
				className="shadow-none text-xs panel-modification"
				value={iconStyle}
				onChange={(e) => setIconStyle(e.value)}
				options={iconOptions}
				unselectable={false}
				itemTemplate={titleTransformTemplate}
				pt={{ button: { className: "p-button-sm text-xs py-1 px-2.5 min-h-[2rem]" } }}
			/>
		</div>
	);
};
