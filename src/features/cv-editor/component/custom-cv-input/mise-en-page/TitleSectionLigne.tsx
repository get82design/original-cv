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
	// const primaryColor = PrimaryTextColorStyle()
	const { setValue } = useFormContext();
	const [iconStyle, setIconStyle] = useState<
		"Aucun" | "Dessus" | "Dessous" | "Les 2"
	>();
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
		return <div className="text-sm">{option}</div>;
	};
	return (
		<div className="flex gap-8 items-center">
			<div className="flex gap-2 items-center">
				<p className="my-0 font-semibold text-sm">Lignes</p>
				<MdInfo className="infoIconTitleSection" /*style={primaryColor}*/ />
				<Tooltip
					target=".infoIconTitleSection"
					content={"Modifier l'icone des titres"}
				/>
			</div>
			<SelectButton
				className="shadow-none text-sm panel-modification"
				value={iconStyle}
				onChange={(e) => setIconStyle(e.value)}
				options={iconOptions}
				unselectable={false}
				itemTemplate={titleTransformTemplate}
			/>
		</div>
	);
};
