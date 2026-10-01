import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { SelectButton } from "primereact/selectbutton";
import { Tooltip } from "primereact/tooltip";
import { useFormContext } from "react-hook-form";
import { MdInfo } from "react-icons/md";

interface TitleSectionLigneProps {
	watchLigneDessus: boolean;
	watchLigneDessous: boolean;
}

type LigneOption = "Aucun" | "Dessus" | "Dessous" | "Les 2";

function lignesToOption(dessus: boolean, dessous: boolean): LigneOption {
	if (dessus && dessous) return "Les 2";
	if (dessus) return "Dessus";
	if (dessous) return "Dessous";
	return "Aucun";
}

/** Une seule source de vérité : les champs RHF — pas de sync bidirectionnel useEffect. */
export const TitleSectionLigne = ({
	watchLigneDessus,
	watchLigneDessous,
}: TitleSectionLigneProps) => {
	const { setValue } = useFormContext();
	const iconStyle = lignesToOption(watchLigneDessus, watchLigneDessous);
	const iconOptions: LigneOption[] = ["Aucun", "Dessus", "Dessous", "Les 2"];

	const onChange = (value: LigneOption | null) => {
		if (!value) return;
		switch (value) {
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
		}
	};

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
				onChange={(e) => onChange(e.value as LigneOption | null)}
				options={iconOptions}
				unselectable={false}
				itemTemplate={titleTransformTemplate}
				pt={{ button: { className: "p-button-sm text-xs py-1 px-2.5 min-h-[2rem]" } }}
			/>
		</div>
	);
};
