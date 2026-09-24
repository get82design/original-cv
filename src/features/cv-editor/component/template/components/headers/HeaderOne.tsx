import { useFormContext } from "react-hook-form";
import { NomPrenomInput } from "../input-cv/nom-input/NomPrenomInput";
import { IntituleCvInput } from "../input-cv/intitule-input/IntituleCvInput";
import { EmailInput } from "../input-cv/email-input/EmailCvInput";
import { PhoneInput } from "../input-cv/phone-input/PhoneCvInput";
import { LocationInput } from "../input-cv/location-input/LocationCvInput";
import { HeaderOneContainer } from "./content/HeaderOneContainer";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { FieldNameCv } from "@/features/cv-editor/utils/fields/fieldNameCv";
import { getHeaderChrome } from "./utils/headerLayout";
import { FieldNameHeader } from "@/features/cv-editor/utils/fields/fieldNameHeader";
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema";
import { PhotoField } from "@/components/photo/PhotoField";

export const HeaderOne = () => {
	const { watch } = useFormContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const chrome = getHeaderChrome(watchGeneral);
	const watchDataHeaderTitleSettings: BaseTextSettings = watch(
		FieldNameHeader.settingsTitle,
	);

	const titleAlign =
		chrome.photoSide === "right"
			? "right"
			: (watchDataHeaderTitleSettings?.textAlign ?? "left");

	return (
		<HeaderOneContainer
			modelGeneral={watchGeneral}
			chrome={chrome}
			titleCompo={<NomPrenomInput forceWidthFull textAlign={titleAlign} />}
			subTitleCompo={<IntituleCvInput forceWidthFull textAlign={titleAlign} />}
			emailCompo={<EmailInput textAlign={chrome.contacts.email} />}
			phoneCompo={<PhoneInput textAlign={chrome.contacts.phone} />}
			locationCompo={<LocationInput textAlign={chrome.contacts.location} />}
			photo={
				<PhotoField
					name={FieldNameCv.photo}
					stylePhoto={watchGeneral?.stylePhoto}
					size={110}
				/>
			}
		/>
	);
};
