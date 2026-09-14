import { NomPrenomInput } from "../input-cv/nom-input/NomPrenomInput"
import { IntituleCvInput } from "../input-cv/intitule-input/IntituleCvInput"
import { EmailInput } from "../input-cv/email-input/EmailCvInput"
import { PhoneInput } from "../input-cv/phone-input/PhoneCvInput"
import { LocationInput } from "../input-cv/location-input/LocationCvInput"
import { HeaderTwoContainer } from "./content/HeaderTwoContainer"
import { useFormContext } from "react-hook-form"
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema"
import { FieldNameHeader } from "@/features/cv-editor/utils/fields/fieldNameHeader"

export const HeaderTwo = () => {
	const { watch } = useFormContext();
	const watchDataHeaderTitleSettings: BaseTextSettings = watch(
		FieldNameHeader.settingsTitle
	  )
	const watchDataHeaderSubTitleSettings: BaseTextSettings = watch(
		FieldNameHeader.settingsSubTitle
	  )
    return (
      <HeaderTwoContainer
        title={<NomPrenomInput textAlign={watchDataHeaderTitleSettings?.textAlign ?? "center"} />}
        subTitle={<IntituleCvInput forceWidthFull textAlign={watchDataHeaderSubTitleSettings?.textAlign ?? "center"} />}
        emailCompo={<EmailInput textAlign="center" />}
        phoneCompo={<PhoneInput textAlign="center" />}
        locationCompo={<LocationInput textAlign="center" />}
      />
    )
  }