import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import type { ProfileSaveInput } from "@/services/schemas/profileSave.schema";
import type { MenuItem } from "primereact/menuitem";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { MiniFooterMultiFunc } from "../footer/MiniFooterMultiFunc";
import type { ListItem } from "@utils/type";
import type { PrizeInput } from "@/services/schemas/profileSave.schema";
import { v4 as uuid } from "uuid";
import { Checkbox } from "primereact/checkbox";
import { SelectBasicIconProfile } from "../../input/SelectIconProfile";
import { TextareaProfile } from "../../input/TextareaProfile";

export function createEmptyPrize(opts?: {
	order?: number;
}): ListItem<PrizeInput> {
	return {
		clientKey: `socialMedia-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			icon: "faTrophy",
			title: "",
			domaine: "",
		},
	};
}

export const ProfilePrize = () => {
	const refPrize = useRef<SpeedDial>(null);
	const [openDelete, setOpenDelete] = useState(false);
	const [toDelete, setToDelete] = useState<Set<string>>(new Set());

	const { control, watch, setValue } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: "prizes",
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
			label: "Ajouter un prix",
			icon: "pi pi-plus",
			command: () => {
				append(createEmptyPrize({ order: fields.length + 1 }));
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
            <DialogSelectPrix
                onHide={() => setVisibleSelect(false)}
                visible={visibleSelect}
                listPrixFromCv={listPrix}
                listPrixInDashboard={watchPrix}
                setNewPrixList={(data) => {
                    setValue('prix', data)
                    setIdCv('0')
                }}
            /> */}
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo
						firstPart={""}
						secondPart={"Prix"}
						size={"text-2xl"}
						withSpace
					/>
				</div>
				<div className="mt-10 flex flex-col gap-4">
					{fields.map((fields, idx: number) => {
						return (
							<div
								className="w-full flex gap-2 items-center"
								key={fields.clientKey}
							>
								<div className="flex flex-col gap-0 items-center">
									{openDelete && (
										<Checkbox
											checked={toDelete.has(fields.clientKey)}
											onChange={() => {
												toggle(fields.clientKey);
											}}
										/>
									)}
									<SelectBasicIconProfile
										icon={watch(`prizes.${idx}.content.icon`) ?? ""}
										setIcon={(data: string) =>
											setValue(`prizes.${idx}.content.icon`, data)
										}
									/>
								</div>
								<div className="w-full flex flex-col gap-0">
									<TextareaProfile
										name={`prizes.${idx}.content.title`}
										fontSize={"16px"}
										weight={700}
										textAlign="justify"
										placeholder="Nom du prix"
									/>
									<div className="-mt-1">
										<TextareaProfile
											name={`prizes.${idx}.content.domaine`}
											fontSize={"14px"}
											weight={300}
											textAlign="justify"
											placeholder="Domaine du prix"
										/>
									</div>
								</div>
							</div>
						);
					})}
					{fields.length === 0 && (
						<p className="w-full font-light text-gray-400">
							Aucun prix enregistré
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
					target=".speeddial-prix .p-speeddial-action"
					position="bottom"
					className="text-sm"
				/>
				<SpeedDial
					ref={refPrize}
					model={items}
					direction="left"
					style={{ top: 12, right: 8 }}
					className="speeddial-prix mini-speeddial"
					buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
				/>
			</AppCard>
		</div>
	);
};
