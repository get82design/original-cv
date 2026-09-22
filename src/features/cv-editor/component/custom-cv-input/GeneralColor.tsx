import { MdInfo } from "react-icons/md";
import { useModelAndColorContext } from "@/features/cv-editor/component/context/ModelAndColorContext";
import { Tooltip } from "primereact/tooltip";
import type { Color } from "@utils/trpc.types";
import { RadioColorRhf } from "@/components/input/radio/RadioColorRhf";
import { FieldNameLayoutGeneral } from "../../utils/fields/fieldNameLayoutGeneral";

export const GeneralColor = () => {
	const { colors } = useModelAndColorContext();
	return (
		<div className="flex flex-col gap-1">
			<div className="flex gap-1 items-center">
				<p className="my-0 font-semibold text-xs">Couleur du thème</p>
				<MdInfo className="infoColorPrincipale text-sm text-muted-color" />
				<Tooltip target=".infoColorPrincipale" content="Couleur principale de votre CV" />
			</div>
			<div className="flex flex-wrap gap-1 items-center">
				{colors
					?.filter((c) => c.name !== "black")
					.map((color: Color, index) => (
						<RadioColorRhf
							index={index}
							general
							key={color.name}
							name={FieldNameLayoutGeneral.primaryColor}
							color={"--" + color.name + color.primary}
							value={color}
							swatchSize="sm"
						/>
					))}
			</div>
		</div>
	);
};
