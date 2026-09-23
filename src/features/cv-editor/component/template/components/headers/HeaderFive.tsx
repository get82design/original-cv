import { useFormContext } from "react-hook-form";
import { HeaderFiveContainer } from "./content/HeaderFiveContainer";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { FieldNameCv } from "@/features/cv-editor/utils/fields/fieldNameCv";
import { IntituleCvInput } from "../input-cv/intitule-input/IntituleCvInput";
import { EmailInput } from "../input-cv/email-input/EmailCvInput";
import { PhoneInput } from "../input-cv/phone-input/PhoneCvInput";
import { LocationInput } from "../input-cv/location-input/LocationCvInput";
import { NomPrenomInput } from "../input-cv/nom-input/NomPrenomInput";
import { useRef, useState } from "react";
import { FieldNameHeader } from "@/features/cv-editor/utils/fields/fieldNameHeader";

export function HeaderFive() {
	const { watch } = useFormContext();
	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const watchPhoto = watch(FieldNameCv.photo);
	const [photo, setPhoto] = useState(watchPhoto);
	const refPhoto = useRef<HTMLInputElement | null>(null);
	const watchDataHeaderTitleSettings = watch(FieldNameHeader.title);
	const watchDataHeaderSubTitleSettings = watch(FieldNameHeader.subTitle);

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
				<>
					<button
						type="button"
						style={{
							width: "150px",
							height: "150px",
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
}
