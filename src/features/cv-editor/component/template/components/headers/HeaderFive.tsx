import { useFormContext } from "react-hook-form";
import { HeaderFiveContainer } from "./content/HeaderFiveContainer";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { FieldNameCv } from "@/features/cv-editor/utils/fields/fieldNameCv";
import { IntituleCvInput } from "../input-cv/intitule-input/IntituleCvInput";
import { EmailInput } from "../input-cv/email-input/EmailCvInput";
import { PhoneInput } from "../input-cv/phone-input/PhoneCvInput";
import { LocationInput } from "../input-cv/location-input/LocationCvInput";
import { NomPrenomInput } from "../input-cv/nom-input/NomPrenomInput";
import { FieldNameHeader } from "@/features/cv-editor/utils/fields/fieldNameHeader";
import { PhotoField } from "@/components/photo/PhotoField";

export function HeaderFive() {
	const { watch } = useFormContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const watchDataHeaderTitleSettings = watch(FieldNameHeader.title);
	const watchDataHeaderSubTitleSettings = watch(FieldNameHeader.subTitle);

	return (
		<HeaderFiveContainer
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
			photo={
				<PhotoField
					name={FieldNameCv.photo}
					stylePhoto={watchGeneral?.stylePhoto}
					size={150}
				/>
			}
		/>
	);
}
