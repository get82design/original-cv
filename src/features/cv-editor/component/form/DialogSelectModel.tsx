import type { Color, TemplateCv } from "@utils/trpc.types";
import { Dialog, type DialogProps } from "primereact/dialog";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useFormContext } from "react-hook-form";
import { useModelAndColorContext } from "../context/ModelAndColorContext";
import { Button } from "primereact/button";
import { RadioColorRhf } from "@/components/input/radio/RadioColorRhf";
import { trpc } from "@utils/trpc";
import type { CvFormValues } from "@/services/schemas/cvSave.schema";
import { SelectButton } from "primereact/selectbutton";
import { FieldNameLayoutGeneral } from "../../utils/fields/fieldNameLayoutGeneral";
import { templateDefaultStylesSchema } from "@/services/schemas/cvTemplate.schema";
import { Carousel } from "primereact/carousel";
import type { ProfileComplete } from "./FormCv";

interface DialogSelectModelProp extends DialogProps {
	modelSelect: TemplateCv | undefined;
	setModelSelect: Dispatch<SetStateAction<TemplateCv | undefined>>;
	onSelectModel: (withProfile: boolean) => void;
	draft: CvFormValues | undefined;
	onResumeDraft: () => void;
	withProfileValue: boolean;
	setWithProfileValue: Dispatch<SetStateAction<boolean>>;
	optionsProfile: {label: string, value: boolean}[];
	profile: ProfileComplete | undefined;
}

export const DialogSelectModel = ({
	visible,
	onHide,
	modelSelect,
	setModelSelect,
	onSelectModel,
	draft,
	onResumeDraft,
	withProfileValue,
	setWithProfileValue,
	optionsProfile,
	profile,
}: DialogSelectModelProp) => {
	const { colors, modeles } = useModelAndColorContext();
	const { setValue } = useFormContext<CvFormValues>();
	const options = ["Reprendre brouillon", "Nouveau CV"];
	const [draftOption, setDraftOption] = useState<string | undefined>(undefined);
	// const {data: profile} = trpc.profile.me.useQuery();
	// const optionsProfile = ['Non', 'Oui'];
    // const [valueProfile, setValueProfile] = useState(optionsProfile[0]);

	const [idModele, setIdModele] = useState("");
	const { data: dataTemplate } = trpc.cvTemplate.findById.useQuery(
		{ id: idModele },
		{ enabled: idModele !== "" }, // staleTime 1h
	);

	useEffect(() => {
		if (dataTemplate) {
			setModelSelect(dataTemplate as TemplateCv);
			const defaultStyles = templateDefaultStylesSchema.parse(
				dataTemplate.defaultStyles,
			);
			setValue(FieldNameLayoutGeneral.primaryColor, {
				name: defaultStyles.primaryColor.name,
				primary: defaultStyles.primaryColor.primary,
			});
		}
	}, [dataTemplate, setModelSelect, setValue]);

	const footerTemplate = () => {
		return (
			<div className="w-full flex justify-center">
				<Button
					className="resume-setup-modal__submit-button"
					label={
						draftOption === "Nouveau CV" || !draft
							? "Selectionner ce modèle"
							: "Charger le brouillon"
					}
					onClick={
						draftOption === "Nouveau CV" || !draft
							? () => onSelectModel(!!withProfileValue)
							: onResumeDraft
					}
					disabled={(draftOption === "Nouveau CV" || !draft) && !modelSelect}
				/>
			</div>
		);
	};

	const itemTemplate = (model: TemplateCv) => {
		return (
			<button
				type="button"
				className="w-full h-66 py-3 relative rounded-lg flex flex-col gap-2 items-center"
				onClick={() => setIdModele(model.id)}
			>
				<label
					htmlFor={model.id}
					className="absolute bottom-3 left-0 w-full text-center font-semibold"
				>
					{model.name}
				</label>
				<div
					className="h-60 w-44 flex justify-center cursor-pointer rounded-lg shadow-md"
					style={{
						backgroundImage: `url(/assets/img/${model.name}.png)`,
						backgroundSize: "cover",
						backgroundPosition: "top center",
						backgroundRepeat: "no-repeat",
						border:
							idModele === model.id
								? "solid 2px var(--primary-color)"
								: "solid 2px transparent",
					}}
				></div>
			</button>
		);
	};

	return (
		<Dialog
			style={{ minWidth: "1200px", maxWidth: "85vw" }}
			visible={visible}
			onHide={onHide}
			className="bg-white dark:bg-gray-900"
			header="Modèle de votre CV"
			closable={false}
			footer={footerTemplate}
		>
			<div className="flex flex-col gap-4 py-4">
				{draft ? (
					<div className="w-full flex flex-col justify-center items-center gap-2">
						<p className="text-center font-semibold">
							Vous avez un CV en cours. Voulez-vous le reprendre ?
						</p>
						<div className="w-full">
							<SelectButton
								value={draftOption}
								onChange={(e) => setDraftOption(e.value)}
								options={options}
							/>
						</div>
					</div>
				) : null}
				{profile && <div className="w-full flex justify-center items-center gap-2">
					<p>Voulez-vous charger les données de votre profil ?</p>
					<SelectButton 
					    value={withProfileValue} 
						onChange={(e) => setWithProfileValue(!!e.value)} 
						optionLabel="label"
                        optionValue="value" 
						options={optionsProfile} 
					/>
				</div>}
				{/* <div className='w-full flex justify-center gap-2'>
            <InputTextRhf 
                //! penser à remettre le fieldName
                // name={FieldNameCvHeader.nom} 
                name={"datas.header.nom"} 
                label='Nom' 
            />
            <InputTextRhf 
                // name={FieldNameCvHeader.prenom} 
                name={"datas.header.prenom"} 
                label='Prénom' 
            />
          </div> */}
				{draftOption === "Nouveau CV" || !draft ? (
					<>
						<p className="-mb-2 text-center font-semibold">
							Sélectionner une couleur pour votre CV
						</p>
						<div className="w-full flex justify-center gap-2">
							{colors && colors.length > 0
								? colors.map((color: Color, index) => {
										return (
											<RadioColorRhf
												index={index}
												general={true}
												className="col"
												key={color.name}
												name={FieldNameLayoutGeneral.primaryColor}
												// name='layoutGeneral.defaultStyles.primaryColor'
												color={`--${color.name}${color.primary}`}
												value={color}
											/>
										);
									})
								: null}
						</div>
						<p className="text-center font-semibold">
							Choisissez un modèle pour votre CV :
						</p>
						<Carousel
							value={modeles}
							numScroll={1}
							numVisible={5}
							itemTemplate={itemTemplate}
						/>
					</>
				) : null}
			</div>
		</Dialog>
	);
};
