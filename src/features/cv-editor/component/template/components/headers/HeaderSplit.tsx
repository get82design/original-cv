import { useFormContext } from "react-hook-form";
import { PhotoField } from "@/components/photo/PhotoField";
import { FieldNameCv } from "@/features/cv-editor/utils/fields/fieldNameCv";
import { FieldNameHeader } from "@/features/cv-editor/utils/fields/fieldNameHeader";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema";
import { EmailInput } from "../input-cv/email-input/EmailCvInput";
import { IntituleCvInput } from "../input-cv/intitule-input/IntituleCvInput";
import { LocationInput } from "../input-cv/location-input/LocationCvInput";
import { NomPrenomInput } from "../input-cv/nom-input/NomPrenomInput";
import { PhoneInput } from "../input-cv/phone-input/PhoneCvInput";
import {
	HeaderSplitMainContainer,
	HeaderSplitSidebarContainer,
} from "./content/HeaderSplitContainer";

/**
 * Header réparti sur les deux colonnes (`headerPlacement: "split"`).
 * Composition unique partagée par tous les templates (V1) : les deux slots
 * sont rendus en tête de colonne, page 1.
 */
export const HeaderSplitSidebar = () => {
	const { watch } = useFormContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const watchDataHeaderContentSettings: BaseTextSettings = watch(FieldNameHeader.settingsContent);
	const contactAlign = watchDataHeaderContentSettings?.textAlign === "right" ? "right" : "left";

	return (
		<HeaderSplitSidebarContainer
			modelGeneral={watchGeneral}
			photo={
				<PhotoField name={FieldNameCv.photo} stylePhoto={watchGeneral?.stylePhoto} size={140} />
			}
			emailCompo={<EmailInput withIcon textAlign={contactAlign} />}
			phoneCompo={<PhoneInput withIcon textAlign={contactAlign} />}
			locationCompo={<LocationInput withIcon textAlign={contactAlign} />}
		/>
	);
};

export const HeaderSplitMain = () => {
	const { watch } = useFormContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const watchDataHeaderTitleSettings: BaseTextSettings = watch(FieldNameHeader.settingsTitle);
	const watchDataHeaderSubTitleSettings: BaseTextSettings = watch(FieldNameHeader.settingsSubTitle);

	return (
		<HeaderSplitMainContainer
			modelGeneral={watchGeneral}
			titleCompo={
				<NomPrenomInput
					forceWidthFull
					textAlign={watchDataHeaderTitleSettings?.textAlign ?? "left"}
				/>
			}
			subTitleCompo={
				<IntituleCvInput
					forceWidthFull
					textAlign={watchDataHeaderSubTitleSettings?.textAlign ?? "left"}
				/>
			}
		/>
	);
};
