import { useFormContext } from "react-hook-form";
import { PhotoField } from "@/components/photo/PhotoField";
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
import { HeaderOneContainer } from "./content/HeaderOneContainer";
import { getHeaderChrome } from "./utils/headerLayout";

export const HeaderOne = () => {
	const { watch } = useFormContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const chrome = getHeaderChrome(watchGeneral);
	const watchDataHeaderTitleSettings: BaseTextSettings = watch(FieldNameHeader.settingsTitle);

	const titleAlign =
		chrome.photoSide === "right" ? "right" : (watchDataHeaderTitleSettings?.textAlign ?? "left");

	return (
		<HeaderOneContainer
			modelGeneral={watchGeneral}
			chrome={chrome}
			titleCompo={<NomPrenomInput forceWidthFull textAlign={titleAlign} />}
			subTitleCompo={<IntituleCvInput forceWidthFull textAlign={titleAlign} />}
			emailCompo={<EmailInput textAlign={chrome.contacts.email} />}
			phoneCompo={<PhoneInput textAlign={chrome.contacts.phone} />}
			locationCompo={<LocationInput textAlign={chrome.contacts.location} />}
			drivingLicenseCompo={
				<DrivingLicenseCvInput textAlign={chrome.photoSide === "right" ? "left" : "right"} />
			}
			photo={
				<PhotoField name={FieldNameCv.photo} stylePhoto={watchGeneral?.stylePhoto} size={110} />
			}
		/>
	);
};
