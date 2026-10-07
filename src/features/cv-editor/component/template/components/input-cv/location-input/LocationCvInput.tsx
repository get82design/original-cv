import { useFormContext } from "react-hook-form";
import { MdLocationPin } from "react-icons/md";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameHeader } from "@/features/cv-editor/utils/fields/fieldNameHeader";
import { useInputCvColor } from "@/features/cv-editor/utils/utilsCv/color";
import { GetAlignementHeader } from "@/features/cv-editor/utils/utilsCv/marge";
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema";

interface LocationInputProps {
	withIcon?: boolean;
	/** Override hex sans # (ex. "000000"). Sinon = couleur du texte (fg colonne inclus). */
	colorIcon?: string;
	textAlign?: "left" | "center" | "right";
	/** Largeur au contenu, pour une ligne de contacts (HeaderTwo). */
	inline?: boolean;
}

export const LocationInput = ({
	withIcon,
	colorIcon,
	textAlign = "left",
	inline = false,
}: LocationInputProps) => {
	const { watch } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();
	const iconAfter = textAlign === "right";
	const watchModelHeaderContent: BaseTextSettings = watch(FieldNameHeader.settingsContent);
	const textCss = useInputCvColor(watchModelHeaderContent?.colorSelect ?? "black");
	const iconColor = colorIcon ? `#${colorIcon}` : textCss ? `var(--${textCss})` : undefined;

	const icon = withIcon ? <MdLocationPin style={{ color: iconColor }} /> : null;

	return (
		<div
			className={`${inline ? "w-auto shrink-0" : "w-full"} flex ${GetAlignementHeader(textAlign)} gap-2 items-center`}
		>
			{!iconAfter && icon}
			<InputTextCv
				placeholder="Location"
				name={FieldNameHeader.location}
				onClick={() => {
					setSelectModifInput(FieldNameHeader.settingsContent);
					setSelectInputForm("");
				}}
				textColor={watchModelHeaderContent?.colorSelect}
				textAlign={textAlign}
				dataInput={{
					changeSize: "1px",
					model: watchModelHeaderContent,
				}}
				forceWidthFull={!inline}
			/>
			{iconAfter && icon}
		</div>
	);
};
