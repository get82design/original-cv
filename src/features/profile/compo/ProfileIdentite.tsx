import { trpc } from "@utils/trpc";
import { Checkbox } from "primereact/checkbox";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { AppCard } from "@/components/card/AppCard";
import { MultiSelectRhf } from "@/components/input/select/MultiSelectRhf";
import { PhotoField } from "@/components/photo/PhotoField";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import { DRIVING_LICENSE_OPTIONS } from "@/services/schemas/enums";
import type { CV } from "../CompoPage";
import { InputTextProfile } from "../input/InputTextProfile";
import { DialogSelectCv } from "./common/DialogSelectCv";

export const ProfileIdentite = ({ cvs }: { cvs: CV[] }) => {
	const { watch, setValue, control } = useFormContext();
	const refProfil = useRef<SpeedDial>(null);
	const [edit, setEdit] = useState(false);
	const watchNom = watch("firstName");
	const watchPrenom = watch("lastName");
	const [visibleMaj, setVisibleMaj] = useState(false);
	const [idCv, setIdCv] = useState<string | null>(null);
	const { data: cvSelected } = trpc.cv.byId.useQuery({ id: idCv ?? "" }, { enabled: !!idCv });

	useEffect(() => {
		if (cvSelected) {
			setValue("firstName", cvSelected?.headerCv?.prenom ?? "");
			setValue("lastName", cvSelected?.headerCv?.nom ?? "");
			setValue("email", cvSelected?.headerCv?.email ?? "");
			setValue("phone", cvSelected?.headerCv?.phone ?? "");
			setValue("location", cvSelected?.headerCv?.location ?? "");
			setValue("drivingLicenses", cvSelected?.headerCv?.drivingLicenses ?? []);
			setValue("hasVehicle", cvSelected?.headerCv?.hasVehicle ?? false);
			if (cvSelected.photo) {
				setValue("photo", cvSelected.photo, { shouldDirty: true });
			}
		}
	}, [cvSelected, setValue]);

	const items = [
		{
			label: "Edition rapide",
			icon: "pi pi-pencil",
			command: () => {
				setEdit(!edit);
			},
		},
		{
			label: "Mettre à jour",
			icon: "pi pi-refresh",
			disabled: cvs.length === 0 && true,
			command: () => {
				setVisibleMaj(true);
			},
		},
		{
			label: "Plus de données",
			icon: "pi pi-plus",
		},
	];

	return (
		<div>
			{visibleMaj && (
				<DialogSelectCv
					visible={visibleMaj}
					onHide={() => setVisibleMaj(false)}
					setIdCv={setIdCv}
					cvs={cvs}
				/>
			)}
			<AppCard className="flex justify-between gap-4 relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo firstPart={"Votre"} secondPart={"Profil"} size={"text-2xl"} withSpace />
				</div>
				<div className="w-2/5 px-8 pt-8 pb-4 flex justify-center rounded-md">
					<PhotoField name="photo" stylePhoto="circle" size={130} className="mt-2" />
				</div>
				<div className="w-3/5 text-left flex flex-col gap-6">
					<div
						style={{
							display: edit ? "none" : "flex",
						}}
					>
						<TitleAppTwo
							firstPart={watchNom ? watchNom : "Nom"}
							secondPart={watchPrenom ? watchPrenom : "Prenom"}
							size={"text-xl"}
							withSpace
						/>
					</div>
					<div
						className="gap-2"
						style={{
							display: edit ? "flex" : "none",
							marginBottom: "-4px",
							marginTop: "-2px",
						}}
					>
						<InputTextProfile
							className="w-1/2"
							placeholder="Prenom"
							name={"firstName"}
							fontSize={"24px"}
							weight={300}
							textColor={"text-black dark:text-white"}
							disabled={!edit}
						/>
						<InputTextProfile
							className="w-1/2"
							placeholder="Nom"
							name={"lastName"}
							fontSize={"24px"}
							weight={700}
							textColor={"text-black dark:text-white"}
							disabled={!edit}
						/>
					</div>
					<div>
						<InputTextProfile
							placeholder="Email"
							name={"email"}
							fontSize={"16px"}
							weight={500}
							textColor={"text-black dark:text-white"}
							disabled={!edit}
						/>
						<InputTextProfile
							placeholder="N° téléphone"
							name={"phone"}
							fontSize={"16px"}
							weight={500}
							textColor={"text-black dark:text-white"}
							disabled={!edit}
						/>
						<InputTextProfile
							placeholder="Adresse courte"
							name={"location"}
							fontSize={"16px"}
							weight={500}
							textColor={"text-black dark:text-white"}
							disabled={!edit}
						/>
						<div className="profile-identite-permis mt-2 flex flex-col gap-2">
							<label
								htmlFor="drivingLicenses"
								className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
							>
								Permis de conduire
							</label>
							<MultiSelectRhf
								name="drivingLicenses"
								options={DRIVING_LICENSE_OPTIONS}
								optionLabel="label"
								optionValue="value"
								placeholder="Sélectionner vos permis"
								display="chip"
								disabled={!edit}
								className="w-full text-sm"
								panelClassName="profile-identite-permis-panel"
								filter
								showClear
							/>
							<label
								htmlFor="hasVehicle"
								className="mt-1 flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200 cursor-pointer select-none"
							>
								<Controller
									name="hasVehicle"
									control={control}
									render={({ field }) => (
										<Checkbox
											inputId="hasVehicle"
											checked={Boolean(field.value)}
											disabled={!edit}
											onChange={(e) => field.onChange(Boolean(e.checked))}
										/>
									)}
								/>
								<span>Véhiculé</span>
							</label>
						</div>
					</div>
					<Tooltip
						target=".speeddial-profil .p-speeddial-action"
						position="left"
						className="text-sm"
					/>
					<SpeedDial
						ref={refProfil}
						model={items}
						direction="down"
						className="speeddial-profil mini-speeddial"
						style={{ top: 12, right: 8 }}
						buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
					/>
				</div>
			</AppCard>
		</div>
	);
};
