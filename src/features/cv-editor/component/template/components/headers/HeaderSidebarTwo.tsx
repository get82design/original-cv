import { useFormContext } from "react-hook-form";
import { PhotoField } from "@/components/photo/PhotoField";
import { FieldNameCv } from "@/features/cv-editor/utils/fields/fieldNameCv";
import { FieldNameHeader } from "@/features/cv-editor/utils/fields/fieldNameHeader";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { DrivingLicenseCvInput } from "../input-cv/driving-license-input/DrivingLicenseCvInput";
import { EmailInput } from "../input-cv/email-input/EmailCvInput";
import { IntituleCvInput } from "../input-cv/intitule-input/IntituleCvInput";
import { LocationInput } from "../input-cv/location-input/LocationCvInput";
import { NomPrenomInput } from "../input-cv/nom-input/NomPrenomInput";
import { PhoneInput } from "../input-cv/phone-input/PhoneCvInput";
import { HeaderSidebarTwoContainer } from "./content/HeaderSidebarTwoContainer";

export function HeaderSidebarTwo() {
	const { watch } = useFormContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const watchDataHeaderTitleSettings = watch(FieldNameHeader.title);
	const watchDataHeaderSubTitleSettings = watch(FieldNameHeader.subTitle);

	return (
		<HeaderSidebarTwoContainer
			modelGeneral={watchGeneral}
			titleCompo={
				<NomPrenomInput
					forceWidthFull
					textAlign={watchDataHeaderTitleSettings?.textAlign ?? "center"}
				/>
			}
			subTitleCompo={
				<IntituleCvInput
					forceWidthFull
					textAlign={watchDataHeaderSubTitleSettings?.textAlign ?? "center"}
				/>
			}
			emailCompo={<EmailInput withIcon />}
			phoneCompo={<PhoneInput withIcon />}
			locationCompo={<LocationInput withIcon />}
			drivingLicenseCompo={<DrivingLicenseCvInput withIcon />}
			photo={
				<PhotoField name={FieldNameCv.photo} stylePhoto={watchGeneral?.stylePhoto} size={150} />
			}
		/>
	);
}
