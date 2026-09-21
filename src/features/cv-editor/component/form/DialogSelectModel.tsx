import type { Color, TemplateCv } from "@utils/trpc.types";
import { Dialog, type DialogProps } from "primereact/dialog";
import {
	useEffect,
	useMemo,
	useRef,
	useState,
	type Dispatch,
	type SetStateAction,
} from "react";
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
import { useSession } from "next-auth/react";
import { isTemplateLocked } from "../../utils/isTemplateLocked";
import { TemplateCatalogBadges } from "@/components/badge/TemplateCatalogBadges";

interface DialogSelectModelProp extends DialogProps {
	modelSelect: TemplateCv | undefined;
	setModelSelect: Dispatch<SetStateAction<TemplateCv | undefined>>;
	onSelectModel: (withProfile: boolean) => void;
	draft: CvFormValues | undefined;
	onResumeDraft: () => void;
	withProfileValue: boolean;
	setWithProfileValue: Dispatch<SetStateAction<boolean>>;
	optionsProfile: { label: string; value: boolean }[];
	profile: ProfileComplete | undefined;
	importing?: boolean;
	onImportPdf?: (file: File) => void;
	/** Toast / feedback si import sans modèle sélectionné */
	onImportWithoutModel?: () => void;
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
	importing = false,
	onImportPdf,
	onImportWithoutModel,
}: DialogSelectModelProp) => {
	const { status } = useSession();
	const { colors, modeles } = useModelAndColorContext();
	const { setValue } = useFormContext<CvFormValues>();
	const options = ["Reprendre brouillon", "Nouveau CV"];
	const [draftOption, setDraftOption] = useState<string | undefined>(
		undefined,
	);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [idModele, setIdModele] = useState("");
	const { data: dataTemplate } = trpc.cvTemplate.findById.useQuery(
		{ id: idModele },
		{ enabled: idModele !== "" },
	);

	const unlockedQuery = trpc.unlockedTemplate.findAll.useQuery(undefined, {
		enabled: status === "authenticated",
	});
	const unlockedIds = useMemo(
		() => new Set((unlockedQuery.data ?? []).map((u) => u.templateId)),
		[unlockedQuery.data],
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

	const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;
		onImportPdf?.(file);
	};

	const footerTemplate = () => {
		return (
			<div className="w-full flex flex-col items-center gap-2">
				{modelSelect &&
				isTemplateLocked(modelSelect, unlockedIds) ? (
					<p className="m-0 text-xs text-amber-600 dark:text-amber-400">
						Modèle premium — utilisable pour créer le CV, déblocage
						requis pour télécharger.
					</p>
				) : null}
				<Button
					className="resume-setup-modal__submit-button bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
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
					disabled={
						importing ||
						((draftOption === "Nouveau CV" || !draft) &&
							!modelSelect)
					}
				/>
			</div>
		);
	};

	const itemTemplate = (model: TemplateCv) => {
		const locked = isTemplateLocked(model, unlockedIds);
		const selected = idModele === model.id;
		return (
			<button
				type="button"
				className="group w-full h-66 py-3 relative rounded-lg flex flex-col gap-2 items-center"
				onClick={() => !importing && setIdModele(model.id)}
				disabled={importing}
			>
				<div className="absolute top-4 right-6 z-10">
					<TemplateCatalogBadges
						isFeatured={model.isFeatured}
						isPremium={model.isPremium}
						locked={locked}
						size="sm"
					/>
				</div>
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
						border: selected
							? "solid 2px var(--primary-color)"
							: "solid 2px transparent",
					}}
				></div>
			</button>
		);
	};

	const showNewCv = draftOption === "Nouveau CV" || !draft;

	return (
		<>
			<Dialog
				style={{ minWidth: "1200px", maxWidth: "85vw" }}
				visible={visible}
				onHide={onHide}
				className="dialog-select-model"
				header="Modèle de votre CV"
				closable={false}
				footer={footerTemplate}
			>
				<div className="flex flex-col gap-4 py-4 text-zinc-900 dark:text-zinc-100">
					<input
						ref={fileInputRef}
						type="file"
						accept="application/pdf,.pdf"
						className="hidden"
						onChange={onFileChange}
					/>
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
									disabled={importing}
								/>
							</div>
						</div>
					) : null}
					{profile && showNewCv && (
						<div className="w-full flex justify-center items-center gap-2">
							<p>Voulez-vous charger les données de votre profil ?</p>
							<SelectButton
								value={withProfileValue}
								onChange={(e) => setWithProfileValue(!!e.value)}
								optionLabel="label"
								optionValue="value"
								options={optionsProfile}
								disabled={importing}
							/>
						</div>
					)}
					{showNewCv && !withProfileValue && (
						<div className="w-full flex flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-3 dark:border-zinc-600">
							<p className="m-0 text-center font-semibold">
								Ou importer un CV existant (PDF)
							</p>
							<p className="m-0 text-center text-xs text-zinc-500 dark:text-zinc-400">
								Choisissez un modèle ci-dessous, puis importez.
							</p>
							<Button
								type="button"
								outlined={!importing}
								icon={
									importing
										? "pi pi-spin pi-spinner"
										: "pi pi-upload"
								}
								label={
									importing
										? "Import en cours…"
										: "Importer un CV"
								}
								disabled={importing}
								onClick={() => {
									if (!modelSelect) {
										onImportWithoutModel?.();
										return;
									}
									fileInputRef.current?.click();
								}}
								className="!text-zinc-700 dark:!text-zinc-200 !border-zinc-300 dark:!border-zinc-600"
							/>
						</div>
					)}
					{showNewCv ? (
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
													name={
														FieldNameLayoutGeneral.primaryColor
													}
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
		</>
	);
};
