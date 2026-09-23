import { useFormContext } from "react-hook-form";
import { EmailInput } from "../input-cv/email-input/EmailCvInput";
import { IntituleCvInput } from "../input-cv/intitule-input/IntituleCvInput";
import { LocationInput } from "../input-cv/location-input/LocationCvInput";
import { PhoneInput } from "../input-cv/phone-input/PhoneCvInput";
import { HeaderFourContainer } from "./content/HeaderFourContainer";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { FieldNameCv } from "@/features/cv-editor/utils/fields/fieldNameCv";
import { useRef, useState } from "react";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import { FieldNameHeader } from "@/features/cv-editor/utils/fields/fieldNameHeader";
import { useCreateCvContext } from "../../../context/CreateCvContext";
import { getHeaderChrome } from "./utils/headerLayout";

export const HeaderFour = () => {
	const { setSelectModifInput } = useCreateCvContext();
	const { watch } = useFormContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const watchPhoto = watch(FieldNameCv.photo);
	const watchModelHeaderNom = watch(FieldNameHeader.settingsNom);
	const watchModelHeaderPrenom = watch(FieldNameHeader.settingsPrenom);
	const refPhoto = useRef<HTMLInputElement | null>(null);
	const chrome = getHeaderChrome(watchGeneral); // watchGeneral = layout
	const [photo, setPhoto] = useState(watchPhoto);

	const onSelect = (_event: React.MouseEvent<HTMLInputElement>) => {
		//   if (((event.target as HTMLInputElement).files as FileList)[0]) {
		//     const blob = new Blob([((event.target as HTMLInputElement).files as FileList)[0]], { type: 'image/*' })
		//     const blobUrl = URL.createObjectURL(blob)
		//     setPhoto(blobUrl)
		//     const reader = new FileReader()
		//     reader.readAsDataURL(blob)
		//     // console.log('ONSELECT', reader)
		//     reader.onload = function () {
		//       setValue(FieldNameCv.photo, reader.result)
		//     }
		//   }
	};

	const onUpload = () => {
		// console.log('TESTTEST', refPhoto.current)
		refPhoto.current?.click();
	};

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
			photo={
				<>
					<button
						type="button"
						style={{
							width: "150px",
							/* height: "130px",*/ backgroundImage: `url(${
								photo && photo !== "" ? photo : "/assets/img/User-avatar.svg.png"
							})`,
							backgroundPosition: "center",
							backgroundSize: "cover",
							cursor: "pointer",
						}}
						className={
							watchGeneral?.stylePhoto && watchGeneral?.stylePhoto === "circle"
								? "rounded-full"
								: "rounded"
						}
						onClick={onUpload}
					/>
					{/* <FileUpload ref={refPhoto} style={{ display: "none" }} mode="basic" name="demo[]" url="/api/upload" accept="image/*" maxFileSize={1000000} onSelect={onSelect} /> */}
					<input
						style={{ display: "none" }}
						type="file"
						onClick={(e) => onSelect(e)}
						ref={refPhoto}
					/>
				</>
			}
		/>
	);
};
