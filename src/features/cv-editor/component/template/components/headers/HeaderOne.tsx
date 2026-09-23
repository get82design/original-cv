import { useRef, useState } from "react";
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

export const HeaderOne = () => {
	const { watch } = useFormContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const watchPhoto = watch(FieldNameCv.photo);
	const chrome = getHeaderChrome(watchGeneral); // watchGeneral = layout
	const refPhoto = useRef<HTMLInputElement | null>(null);
	const [photo, setPhoto] = useState(watchPhoto);
	const watchDataHeaderTitleSettings: BaseTextSettings = watch(FieldNameHeader.settingsTitle);

	const titleAlign =
		chrome.photoSide === "right"
			? "right" // flip photo → texte côté photo
			: (watchDataHeaderTitleSettings?.textAlign ?? "left"); // tokens : left | center | right

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
		<HeaderOneContainer
			modelGeneral={watchGeneral}
			chrome={chrome}
			titleCompo={<NomPrenomInput forceWidthFull textAlign={titleAlign} />}
			subTitleCompo={<IntituleCvInput forceWidthFull textAlign={titleAlign} />}
			emailCompo={<EmailInput textAlign={chrome.contacts.email} />}
			phoneCompo={<PhoneInput textAlign={chrome.contacts.phone} />}
			locationCompo={<LocationInput textAlign={chrome.contacts.location} />}
			photo={
				<>
					{/* <Image
              alt=""
              src={photo && photo !== '' ? photo : "/assets/img/User-avatar.svg.png"}
              width="130"
              height="130"
              imageClassName={
                watchGeneral.stylePhoto && watchGeneral.stylePhoto === 'circle'
                  ? 'rounded-full'
                  : 'rounded'
              }
              onClick={onUpload}
            /> */}
					<button
						type="button"
						style={{
							width: "110px",
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
