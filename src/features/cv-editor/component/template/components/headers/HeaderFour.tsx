import { useFormContext } from "react-hook-form";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import { PhotoField } from "@/components/photo/PhotoField";
import { FieldNameCv } from "@/features/cv-editor/utils/fields/fieldNameCv";
import { FieldNameHeader } from "@/features/cv-editor/utils/fields/fieldNameHeader";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { useCreateCvContext } from "../../../context/CreateCvContext";
import { DrivingLicenseCvInput } from "../input-cv/driving-license-input/DrivingLicenseCvInput";
import { EmailInput } from "../input-cv/email-input/EmailCvInput";
import { IntituleCvInput } from "../input-cv/intitule-input/IntituleCvInput";
import { LocationInput } from "../input-cv/location-input/LocationCvInput";
import { PhoneInput } from "../input-cv/phone-input/PhoneCvInput";
import { HeaderFourContainer } from "./content/HeaderFourContainer";
import { getHeaderChrome } from "./utils/headerLayout";

export const HeaderFour = () => {
	const { setSelectModifInput } = useCreateCvContext();
	const { watch } = useFormContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const watchModelHeaderNom = watch(FieldNameHeader.settingsNom);
	const watchModelHeaderPrenom = watch(FieldNameHeader.settingsPrenom);
	const chrome = getHeaderChrome(watchGeneral);

	return (
		<HeaderFourContainer
			modelGeneral={watchGeneral}
			chrome={chrome}
			nomCompo={
				<InputTextCv
					placeholder="Prenom"
					className="w-auto"
					name={FieldNameHeader.prenom}
					onClick={() => setSelectModifInput(FieldNameHeader.settingsPrenom)}
					textColor={watchModelHeaderPrenom?.colorSelect}
					textAlign={chrome.textAlign}
					dataInput={{
						changeSize: "4px",
						model: watchModelHeaderPrenom,
					}}
				/>
			}
			prenomCompo={
				<InputTextCv
					className="w-auto"
					placeholder="Nom"
					name={FieldNameHeader.nom}
					onClick={() => setSelectModifInput(FieldNameHeader.settingsNom)}
					textColor={watchModelHeaderNom?.colorSelect}
					textAlign={chrome.textAlign}
					dataInput={{
						changeSize: "4px",
						model: watchModelHeaderNom,
					}}
				/>
			}
			subTitleCompo={<IntituleCvInput forceWidthFull textAlign={chrome.textAlign} />}
			emailCompo={<EmailInput textAlign={chrome.textAlign} />}
			phoneCompo={<PhoneInput textAlign={chrome.textAlign} />}
			locationCompo={<LocationInput textAlign={chrome.textAlign} />}
			drivingLicenseCompo={<DrivingLicenseCvInput textAlign={chrome.textAlign} />}
			photo={
				<PhotoField name={FieldNameCv.photo} stylePhoto={watchGeneral?.stylePhoto} size={150} />
			}
		/>
	);
};
