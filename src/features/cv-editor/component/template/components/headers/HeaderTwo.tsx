import { useFormContext } from "react-hook-form";
import { FieldNameHeader } from "@/features/cv-editor/utils/fields/fieldNameHeader";
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema";
import { DrivingLicenseCvInput } from "../input-cv/driving-license-input/DrivingLicenseCvInput";
import { EmailInput } from "../input-cv/email-input/EmailCvInput";
import { IntituleCvInput } from "../input-cv/intitule-input/IntituleCvInput";
import { LocationInput } from "../input-cv/location-input/LocationCvInput";
import { NomPrenomInput } from "../input-cv/nom-input/NomPrenomInput";
import { PhoneInput } from "../input-cv/phone-input/PhoneCvInput";
import { HeaderTwoContainer } from "./content/HeaderTwoContainer";

export const HeaderTwo = () => {
	const { watch } = useFormContext();
	const watchDataHeaderTitleSettings: BaseTextSettings = watch(FieldNameHeader.settingsTitle);
	const watchDataHeaderSubTitleSettings: BaseTextSettings = watch(FieldNameHeader.settingsSubTitle);
	return (
		<HeaderTwoContainer
			title={<NomPrenomInput textAlign={watchDataHeaderTitleSettings?.textAlign ?? "center"} />}
			subTitle={
				<IntituleCvInput
					forceWidthFull
					textAlign={watchDataHeaderSubTitleSettings?.textAlign ?? "center"}
				/>
			}
			emailCompo={<EmailInput textAlign="center" />}
			phoneCompo={<PhoneInput textAlign="center" />}
			locationCompo={<LocationInput textAlign="center" />}
			drivingLicenseCompo={<DrivingLicenseCvInput textAlign="center" leadingSeparator />}
		/>
	);
};
