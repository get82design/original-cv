import { useFormContext } from "react-hook-form";
import { PhotoField } from "@/components/photo/PhotoField";
import {
	HeaderSplitTwoMainContainer,
	HeaderSplitTwoSidebarContainer,
} from "@/features/cv-editor/component/template/components/headers/content/HeaderSplitTwoContainer";
import { FieldNameCv } from "@/features/cv-editor/utils/fields/fieldNameCv";
import { FieldNameHeader } from "@/features/cv-editor/utils/fields/fieldNameHeader";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema";
import { DrivingLicenseCvInput } from "../input-cv/driving-license-input/DrivingLicenseCvInput";
import { EmailInput } from "../input-cv/email-input/EmailCvInput";
import { IntituleCvInput } from "../input-cv/intitule-input/IntituleCvInput";
import { LocationInput } from "../input-cv/location-input/LocationCvInput";
import { NomPrenomInput } from "../input-cv/nom-input/NomPrenomInput";
import { PhoneInput } from "../input-cv/phone-input/PhoneCvInput";

/**
 * Header split variante Two (`sectionHeader: "HeaderSplitTwo"` + `headerPlacement: "split"`).
 * Sidebar : photo seule · Main : nom/prénom + intitulé + contacts.
 */
export const HeaderSplitTwoSidebar = () => {
	const { watch } = useFormContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);

	return (
		<HeaderSplitTwoSidebarContainer
			modelGeneral={watchGeneral}
			photo={
				<PhotoField name={FieldNameCv.photo} stylePhoto={watchGeneral?.stylePhoto} size={160} />
			}
		/>
	);
};

export const HeaderSplitTwoMain = () => {
	const { watch } = useFormContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const watchDataHeaderTitleSettings: BaseTextSettings = watch(FieldNameHeader.settingsTitle);
	const watchDataHeaderSubTitleSettings: BaseTextSettings = watch(FieldNameHeader.settingsSubTitle);
	const watchDataHeaderContentSettings: BaseTextSettings = watch(FieldNameHeader.settingsContent);
	const contactAlign = watchDataHeaderContentSettings?.textAlign === "right" ? "right" : "left";

	return (
		<HeaderSplitTwoMainContainer
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
			emailCompo={<EmailInput withIcon textAlign={contactAlign} />}
			phoneCompo={<PhoneInput withIcon textAlign={contactAlign} />}
			locationCompo={<LocationInput withIcon textAlign={contactAlign} />}
			drivingLicenseCompo={<DrivingLicenseCvInput withIcon textAlign={contactAlign} />}
		/>
	);
};
