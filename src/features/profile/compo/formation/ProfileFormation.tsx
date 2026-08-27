import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import type { ProfileSaveInput } from "@/services/schemas/profileSave.schema";
import { Checkbox } from "primereact/checkbox";
import type { MenuItem } from "primereact/menuitem";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { TextareaProfile } from "../../input/TextareaProfile";
import { PeriodeProfile } from "../../input/PeriodeProfile";
import { MiniFooterMultiFunc } from "../footer/MiniFooterMultiFunc";
import type { ListItem } from "@utils/type";
import type { FormationInput } from "@/services/schemas/profileSave.schema";
import { v4 as uuid } from "uuid";

function createEmptyFormation(opts?: {
	order?: number;
}): ListItem<FormationInput> {
	return {
		clientKey: `formation-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			title: "",
			start: new Date(),
			end: new Date(),
			organismeFormation: "",
			status: "COMPLETED",
		},
	};
}

export function ProfileFormation() {
	const refFormation = useRef<SpeedDial>(null);
	const [openDelete, setOpenDelete] = useState(false);
	const [toDelete, setToDelete] = useState<Set<string>>(new Set());

	const { control, watch, setValue } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: "formations",
		keyName: "rhfId", // ne pas écraser clientKey
	});

	const toggle = (clientKey: string) => {
		setToDelete((prev) => {
			const next = new Set(prev);
			if (next.has(clientKey)) next.delete(clientKey);
			else next.add(clientKey);
			return next;
		});
	};

	const confirmDelete = () => {
		// du plus grand index au plus petit
		const indexes = fields
			.map((f, i) => (toDelete.has(f.clientKey) ? i : -1))
			.filter((i) => i >= 0)
			.sort((a, b) => b - a);
		indexes.forEach((i) => {
			remove(i);
		});
		setToDelete(new Set());
		setOpenDelete(false);
	};

	const items: MenuItem[] = [
		{
			label: "Ajouter une formation",
			icon: "pi pi-plus",
			command: () => {
				append(createEmptyFormation());
			},
		},
		{
			label: "Mise à jour depuis CV",
			icon: "pi pi-refresh",
			// disabled: nbCv === 0 && true,
			command: () => {
				// setVisibleMaj(true)
			},
		},
		{
			label: "Supprimer",
			disabled: fields.length === 0,
			icon: "pi pi-trash",
			command: () => {
				setOpenDelete(true);
			},
		},
	];

	return (
		<div>
			{/* <DialogSelectCv visible={visibleMaj} onHide={() => setVisibleMaj(false)} setIdCv={setIdCv} cvs={cvs} />
            <DialogSelectFormation
                onHide={() => setVisibleSelect(false)}
                visible={visibleSelect}
                listFormationFromCv={listFormation}
                listFormationInDashboard={watchFormation}
                setNewFormationList={(data) => {
                    setValue('formation', data)
                    setIdCv('0')
                }}
            /> */}
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo
						firstPart={""}
						secondPart={"Formations"}
						size={"text-2xl"}
					/>
				</div>
				<div className="mt-10 flex flex-col gap-4">
					{fields.map((field, idx: number) => {
						return (
							<div className="w-full flex flex-col gap-0" key={field.clientKey}>
								<div className="w-full flex gap-2 justify-between items-start">
									<div className="flex flex-col gap-0">
										<div className="flex gap-1 items-center">
											{openDelete && (
												<Checkbox
													checked={toDelete.has(field.clientKey)}
													onChange={() => {
														toggle(field.clientKey);
													}}
												/>
											)}
											<TextareaProfile
												placeholder="Nom de la formation"
												name={`formations.${idx}.content.title`}
												fontSize={"16px"}
												weight={700}
												textAlign="justify"
											/>
										</div>
										<TextareaProfile
											placeholder="Organisme de formation"
											name={`formations.${idx}.content.organismeFormation`}
											fontSize={"14px"}
											weight={300}
											textAlign="justify"
										/>
									</div>
									<PeriodeProfile
										startName={`formations.${idx}.content.start`}
										endName={`formations.${idx}.content.end`}
										fontSize={"14px"}
										fontWeight={300}
										textAlign="right"
									/>
								</div>
							</div>
						);
					})}
					{fields.length === 0 && (
						<p className="w-full font-light text-gray-400">
							Aucune formation enregistrée.
						</p>
					)}
					{openDelete && (
						<MiniFooterMultiFunc
							lightLabel={"Fermer"}
							actionLabel={"Supprimer"}
							actionAction={(e) => {
								e.preventDefault();
								confirmDelete();
							}}
							lightAction={(e) => {
								e.preventDefault();
								setToDelete(new Set());
								setOpenDelete(false);
							}}
						/>
					)}
				</div>
				<Tooltip
					target=".speeddial-formation .p-speeddial-action"
					position="bottom"
					className="text-sm"
				/>
				<SpeedDial
					ref={refFormation}
					model={items}
					direction="left"
					style={{ top: 12, right: 8 }}
					className="speeddial-formation mini-speeddial"
					buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
				/>
			</AppCard>
		</div>
	);
}
