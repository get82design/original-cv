import { SelectButtonRhf } from "@/components/input/select-button/SelectButton";
import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import type { StylePhoto } from "@/services/schemas/cvTemplate.schema";
import { Tooltip } from "primereact/tooltip";

interface SideOption {
	name: string;
	value: string;
}

interface StyleOption {
	value: StylePhoto;
	label: string;
}

interface GeneralPhotoProps {
	watchWithPhoto: boolean;
	watchStylePhoto: StylePhoto;
	watchPhotoSide: "left" | "right";
	watchLockPhotoSide: boolean;
}

const compactButtonPt = {
	button: {
		className:
			"p-button-sm text-xs py-0 px-2.5 h-8 min-h-[2rem] inline-flex items-center justify-center",
	},
};

const styleShapeClass: Record<StylePhoto, string> = {
	flat: "rounded-none",
	rounded: "rounded-[5px]",
	circle: "rounded-full",
};

export const GeneralPhoto = ({
	watchWithPhoto,
	watchStylePhoto,
	watchPhotoSide,
	watchLockPhotoSide,
}: GeneralPhotoProps) => {
	const photoOptions: StyleOption[] = [
		{ value: "flat", label: "Carré" },
		{ value: "rounded", label: "Arrondi" },
		{ value: "circle", label: "Rond" },
	];
	const photoSideOptions: SideOption[] = [
		{ value: "left", name: "Gauche" },
		{ value: "right", name: "Droite" },
	];
	const styleTemplate = (option: StyleOption) => (
		<span
			className="photo-style-opt inline-flex items-center justify-center leading-none"
			data-pr-tooltip={option.label}
			data-pr-position="top"
			// aria-label={option.label}
		>
			<span
				aria-hidden
				className={`inline-block size-3.5 border-2 border-current ${styleShapeClass[option.value]}`}
			/>
		</span>
	);
	const sideTemplate = (option: SideOption) => (
		<div className="text-xs">{option.name}</div>
	);

	return (
		(watchWithPhoto || watchWithPhoto === false) && (
			<div className="flex flex-col gap-1">
				<p className="my-0 font-semibold text-xs">Photo</p>
				<div className="flex gap-3 items-center general-photo">
					<ToggleAfficherCacher name="layoutGeneral.layout.withPhoto" compact />
					{watchWithPhoto && (
						<>
							<Tooltip target=".photo-style-opt" />
							<SelectButtonRhf
								className="shadow-none"
								value={watchStylePhoto}
								name={FieldNameLayoutGeneral.stylePhoto}
								itemTemplate={styleTemplate}
								optionValue="value"
								options={photoOptions}
								unselectable={false}
								pt={compactButtonPt}
							/>
						</>
					)}
					{watchWithPhoto && watchPhotoSide && !watchLockPhotoSide && (
						<SelectButtonRhf
							className="shadow-none"
							value={watchPhotoSide}
							name={FieldNameLayoutGeneral.photoSide}
							itemTemplate={sideTemplate}
							optionValue="value"
							options={photoSideOptions}
							unselectable={false}
							pt={compactButtonPt}
						/>
					)}
				</div>
			</div>
		)
	);
};


