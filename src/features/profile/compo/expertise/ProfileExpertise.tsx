import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import type {
	ExpertiseInput,
	ProfileSaveInput,
} from "@/services/schemas/profileSave.schema";
import type { MenuItem } from "primereact/menuitem";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { MiniFooterMultiFunc } from "../footer/MiniFooterMultiFunc";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from "uuid";
import { Checkbox } from "primereact/checkbox";
import { TextareaProfile } from "../../input/TextareaProfile";
import { RatingProfile } from "../../input/RatingProfile";

function createEmptyExpertise(opts?: {
	order?: number;
}): ListItem<ExpertiseInput> {
	return {
		clientKey: `expertise-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			title: "",
			level: "Débutant",
		},
	};
}

export const ProfileExpertise = () => {
	const refExpertise = useRef<SpeedDial>(null);
	const [openDelete, setOpenDelete] = useState(false);
	const [toDelete, setToDelete] = useState<Set<string>>(new Set());

	const { control, watch, setValue } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: "expertises",
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
			label: "Ajouter une expertise",
			icon: "pi pi-plus",
			command: () => {
				append(createEmptyExpertise({ order: fields.length + 1 }));
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
            <DialogSelectExpertise
                onHide={() => setVisibleSelect(false)}
                visible={visibleSelect}
                listExpertiseFromCv={listExpertise}
                listExpertiseInDashboard={watchExpertise}
                setNewExpertiseList={(data) => {
                    setValue('expertise', data)
                    setIdCv('0')
                }}
            /> */}
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo
						firstPart={""}
						secondPart={"Expertise"}
						size={"text-2xl"}
						withSpace
					/>
				</div>
				<div className="mt-10 flex flex-col gap-4">
					{fields.map((field, idx) => {
						return (
							<div className="w-full flex flex-col gap-1" key={field.clientKey}>
								<div className="flex gap-1 items-start justify-between">
									{openDelete && (
										<Checkbox
											checked={toDelete.has(field.clientKey)}
											onChange={() => {
												toggle(field.clientKey);
											}}
										/>
									)}
									<TextareaProfile
										name={`expertises.${idx}.content.title`}
										placeholder="Expertise"
										fontSize={"16px"}
										weight={700}
										textAlign="justify"
									/>
									<div className="w-1/2 flex justify-center">
										<RatingProfile name={`expertises.${idx}.content.level`} />
									</div>
								</div>
							</div>
						);
					})}
					{fields.length === 0 && (
						<p className="w-full font-light text-gray-400">
							Aucune expertise enregistrée.
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
					target=".speeddial-expertise .p-speeddial-action"
					position="bottom"
					className="text-sm"
				/>
				<SpeedDial
					ref={refExpertise}
					model={items}
					direction="left"
					style={{ top: 12, right: 8 }}
					className="speeddial-expertise mini-speeddial"
					buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
				/>
			</AppCard>
		</div>
	);
};
