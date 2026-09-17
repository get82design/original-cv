import { Dialog, type DialogProps } from "primereact/dialog";
import type { ProfileComplete } from "../../form/FormCv";
import { useState } from "react";
import { SelectButton } from "primereact/selectbutton";
import { Message } from "primereact/message";
import { MdInfo } from "react-icons/md";
import { Button } from "primereact/button";
import { useFormContext } from "react-hook-form";
import { useModelAndColorContext } from "../../context/ModelAndColorContext";
import { mapProfileToCvDatas } from "../../form/mapProfileToCvDatas";

interface DialogDataFromProfileProps extends DialogProps {
	profile: ProfileComplete;
}

export const DialogDataFromProfile = ({
	visible,
	onHide,
	profile,
}: DialogDataFromProfileProps) => {
	const { reset, getValues } = useFormContext();
	const { modeles } = useModelAndColorContext();

	const [selectedOption, setSelectedOption] = useState<string>("no");
	const options = [
		{ label: "Oui", value: "yes" },
		{ label: "Non", value: "no" },
	];

	const onValide = () => {
		if (selectedOption === "yes") {
			const current = getValues();
			const model = modeles.find((m) => m.id === current.templateId);
			if (!model) {
				onHide();
				return;
			}
			const fromProfile = mapProfileToCvDatas(profile, model);
			reset({
				...current,
				photo: profile.photo ?? current.photo,
				datas: {
					...current.datas,
					...fromProfile,
				},
			});
		}
		onHide();
	};

	const footer = () => {
		return (
			<div className="flex justify-end gap-2">
				<Button
					label="Annuler"
					outlined
					onClick={onHide}
					className="!text-zinc-600 dark:!text-zinc-300 !border-zinc-300 dark:!border-zinc-600 hover:!bg-zinc-100 dark:hover:!bg-zinc-800"
				/>
				<Button
					label="Valider"
					onClick={onValide}
					className="bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
				/>
			</div>
		);
	};

	return (
		<Dialog
			visible={visible}
			onHide={onHide}
			header="Données du profil"
			style={{ width: "900px", maxWidth: "85vw" }}
			className="dialog-data-from-profile"
			footer={footer}
		>
			<div className="flex flex-col gap-4 p-4">
				<div className="flex justify-center items-center gap-4">
					<p className="text-zinc-900 dark:text-zinc-100">
						Souhaitez vous remplacer le contenu de votre CV par les infos
						stockées sur votre tableau de bord ?
					</p>
					<SelectButton
						value={selectedOption}
						onChange={(e) => setSelectedOption(e.value)}
						options={options}
						allowEmpty={false}
					/>
				</div>
				<Message
					severity="info"
					text="Info Message"
					content={
						<div className="w-full flex gap-2">
							<MdInfo className="text-sky-600 dark:text-sky-400 size-8 shrink-0" />
							{selectedOption === "yes" ? (
								<div className="flex flex-col gap-2">
									<p>
										Les informations de votre tableau de bord seront utilisées
										pour remplir votre CV. Elles viendront écraser les données
										actuelles de votre CV.
									</p>
									<p>
										Si une section n&apos;est pas présente sur le modèle par
										défaut, vous la retrouverez dans l&apos;onglet
										&quot;Sections&quot; avec les données que vous avez
										enregistré dans votre tableau de bord.
									</p>
								</div>
							) : (
								<div className="flex flex-col gap-2">
									<p>
										Les informations de votre tableau de bord ne seront pas
										utilisées pour remplir votre CV.
									</p>
									<p>
										Vous pouvez toujours, si vous le souhaitez, récupérer les
										données d&apos;une section depuis votre tableau de bord en
										cliquant sur le bouton &quot;Récupérer les données&quot;
										présent dans chaque section.
									</p>
								</div>
							)}
						</div>
					}
					className="w-full border-b-0 border-t-0 border-r-0 border-l-8 border-sky-600 dark:border-sky-400 bg-sky-100 dark:bg-sky-950/50 p-2 rounded-md text-sky-700 dark:text-sky-300"
				/>
			</div>
		</Dialog>
	);
};
