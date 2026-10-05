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
import { HeaderThreeContainer } from "./content/HeaderThreeContainer";
import { getHeaderChrome } from "./utils/headerLayout";

export const HeaderThree = () => {
	const { watch } = useFormContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const { setSelectModifInput } = useCreateCvContext();
	const watchModelHeaderNom = watch(FieldNameHeader.settingsNom);
	const watchModelHeaderPrenom = watch(FieldNameHeader.settingsPrenom);
	const chrome = getHeaderChrome(watchGeneral);

	return (
		<HeaderThreeContainer
			modelGeneral={watchGeneral}
			chrome={chrome}
			nomCompo={
				<InputTextCv
					placeholder="Prenom"
					className="w-full"
					name={FieldNameHeader.prenom}
					onClick={() => setSelectModifInput(FieldNameHeader.settingsPrenom)}
					textColor={watchModelHeaderPrenom?.colorSelect}
					textAlign={chrome.textAlign}
					dataInput={{
						changeSize: "4px",
						model: watchModelHeaderPrenom,
					}}
					forceWidthFull={true}
				/>
			}
			prenomCompo={
				<InputTextCv
					className="-mt-4 -mb-1 w-full"
					placeholder="Nom"
					name={FieldNameHeader.nom}
					onClick={() => setSelectModifInput(FieldNameHeader.settingsNom)}
					textColor={watchModelHeaderNom?.colorSelect}
					textAlign={chrome.textAlign}
					dataInput={{
						changeSize: "4px",
						model: watchModelHeaderNom,
					}}
					forceWidthFull={true}
				/>
			}
			subTitleCompo={<IntituleCvInput forceWidthFull textAlign={chrome.textAlign} />}
			emailCompo={<EmailInput withIcon textAlign={chrome.textAlign} />}
			phoneCompo={<PhoneInput withIcon textAlign={chrome.textAlign} />}
			locationCompo={<LocationInput withIcon textAlign={chrome.textAlign} />}
			drivingLicenseCompo={<DrivingLicenseCvInput withIcon textAlign={chrome.textAlign} />}
			photo={
				<PhotoField name={FieldNameCv.photo} stylePhoto={watchGeneral?.stylePhoto} size={160} />
			}
		/>
	);
};
