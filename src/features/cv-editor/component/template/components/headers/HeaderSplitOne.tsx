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
	HeaderSplitOneMainContainer,
	HeaderSplitOneSidebarContainer,
} from "@/features/cv-editor/component/template/components/headers/content/HeaderSplitOneContainer";

/**
 * Header split variante One (`sectionHeader: "HeaderSplitOne"` + `headerPlacement: "split"`).
 * Sidebar : photo + contacts · Main : nom/prénom + intitulé.
 */
export const HeaderSplitOneSidebar = () => {
	const { watch } = useFormContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const watchDataHeaderContentSettings: BaseTextSettings = watch(FieldNameHeader.settingsContent);
	const contactAlign = watchDataHeaderContentSettings?.textAlign === "right" ? "right" : "left";

	return (
		<HeaderSplitOneSidebarContainer
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

export const HeaderSplitOneMain = () => {
	const { watch } = useFormContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const watchDataHeaderTitleSettings: BaseTextSettings = watch(FieldNameHeader.settingsTitle);
	const watchDataHeaderSubTitleSettings: BaseTextSettings = watch(FieldNameHeader.settingsSubTitle);

	return (
		<HeaderSplitOneMainContainer
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
