import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameHeader } from "@/features/cv-editor/utils/fields/fieldNameHeader";
import { useInputCvColor } from "@/features/cv-editor/utils/utilsCv/color";
import { GetAlignementHeader } from "@/features/cv-editor/utils/utilsCv/marge";
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { MdPhone } from "react-icons/md";

interface PhoneInputProps {
	withIcon?: boolean;
	/** Override hex sans # (ex. "000000"). Sinon = couleur du texte (fg colonne inclus). */
	colorIcon?: string;
	textAlign?: "left" | "center" | "right";
}

export const PhoneInput = ({ withIcon, colorIcon, textAlign = "left" }: PhoneInputProps) => {
	const { watch } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();
	const iconAfter = textAlign === "right";
	const watchModelHeaderContent: BaseTextSettings = watch(FieldNameHeader.settingsContent);
	const textCss = useInputCvColor(watchModelHeaderContent?.colorSelect ?? "black");
	const iconColor = colorIcon ? `#${colorIcon}` : textCss ? `var(--${textCss})` : undefined;

	const icon = withIcon ? <MdPhone style={{ color: iconColor }} /> : null;

	return (
		<div className={`flex ${GetAlignementHeader(textAlign)} gap-2 items-center`}>
			{!iconAfter && icon}
			<InputTextCv
				placeholder="Téléphone"
				name={FieldNameHeader.phone}
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
			/>
			{iconAfter && icon}
		</div>
	);
};
