import { NomPrenomInput } from "../input-cv/nom-input/NomPrenomInput"
import { IntituleCvInput } from "../input-cv/intitule-input/IntituleCvInput"
import { EmailInput } from "../input-cv/email-input/EmailCvInput"
import { PhoneInput } from "../input-cv/phone-input/PhoneCvInput"
import { LocationInput } from "../input-cv/location-input/LocationCvInput"
import { HeaderTwoContainer } from "./content/HeaderTwoContainer"

export const HeaderTwo = () => {
    return (
      <HeaderTwoContainer
        title={<NomPrenomInput />}
        subTitle={<IntituleCvInput forceWidthFull />}
        emailCompo={<EmailInput textAlign="center" />}
        phoneCompo={<PhoneInput textAlign="center" />}
        locationCompo={<LocationInput textAlign="center" />}
      />
    )
  }