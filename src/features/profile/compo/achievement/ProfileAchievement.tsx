import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import type { AchievementInput, ProfileSaveInput } from "@/services/schemas/profileSave.schema";
import type { ListItem } from "@utils/type";
import { Checkbox } from "primereact/checkbox";
import type { MenuItem } from "primereact/menuitem";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { v4 as uuid } from "uuid";
import { TextareaProfile } from "../../input/TextareaProfile";
import { MiniFooterMultiFunc } from "../footer/MiniFooterMultiFunc";
import { InputTextProfile } from "../../input/InputTextProfile";
import { trpc } from "@utils/trpc";
import { DialogSelectCv } from "../common/DialogSelectCv";
import { DialogSelectAchievement } from "./DialogSelectAchievement";
import type { CV } from "../../CompoPage";

export function createEmptyAchievement(opts?: { order?: number }): ListItem<AchievementInput> {
	return {
		clientKey: `achievement-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			title: "",
			description: "",
			technology: "",
			year: null,
		},
	};
}

export const ProfileAchievement = ({ cvs }: { cvs: CV[] }) => {
	const refAchievement = useRef<SpeedDial>(null);
	const [openDelete, setOpenDelete] = useState(false);
	const [toDelete, setToDelete] = useState<Set<string>>(new Set());
	const [visibleMaj, setVisibleMaj] = useState(false);
	const [idCv, setIdCv] = useState<string | undefined>(undefined);
	const { data: cvSelected } = trpc.cv.byId.useQuery({ id: idCv ?? "" }, { enabled: !!idCv });
	const [visibleSelect, setVisibleSelect] = useState(false);

	const { control, watch, setValue } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove, replace } = useFieldArray({
		control,
		name: "achievements",
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
			label: "Ajouter une réalisation",
			icon: "pi pi-plus",
			command: () => {
				append(createEmptyAchievement({ order: fields.length + 1 }));
			},
		},
		{
			label: "Mise à jour depuis CV",
			icon: "pi pi-refresh",
			disabled: cvs.length === 0 && true,
			command: () => {
				if (cvs.length > 1) {
					setVisibleMaj(true);
				} else {
					setIdCv(cvs[0]?.id ?? "");
					setVisibleSelect(true);
				}
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
			{visibleMaj && (
				<DialogSelectCv
					visible={visibleMaj}
					onHide={() => setVisibleMaj(false)}
					setIdCv={(id) => {
						setIdCv(id);
						setVisibleSelect(true);
					}}
					cvs={cvs}
				/>
			)}
			{visibleSelect && (
				<DialogSelectAchievement
					onHide={() => setVisibleSelect(false)}
					visible={visibleSelect}
					listAchievementFromCv={cvSelected?.achievements ?? []}
					listAchievementInProfile={fields}
					setListAchievement={(data) => {
						replace(data);
					}}
				/>
			)}
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo firstPart={"Vos"} secondPart={"Réalisations"} size={"text-2xl"} withSpace />
				</div>
				<div className="mt-10 flex flex-col gap-4">
					{fields.map((field, idx: number) => {
						return (
							<div className="flex gap-4 justify-between items-start" key={field.clientKey}>
								<div className="w-3/4 flex flex-col gap-0">
									<div className="w-full flex gap-2">
										{openDelete && (
											<Checkbox
												checked={toDelete.has(field.clientKey)}
												onChange={() => toggle(field.clientKey)}
											/>
										)}
										<TextareaProfile
											name={`achievements.${idx}.content.title`}
											fontSize={"16px"}
											weight={700}
											textAlign="justify"
											placeholder="Nom de la réalisation"
										/>
									</div>
									<div className="-mt-1">
										<TextareaProfile
											name={`achievements.${idx}.content.description`}
											fontSize={"14px"}
											weight={300}
											textAlign="justify"
											placeholder="Description de la réalisation"
										/>
									</div>
								</div>
								<div className="w-1/4 flex flex-col gap-0 items-end">
									<InputTextProfile
										name={`achievements.${idx}.content.technology`}
										fontSize={"14px"}
										weight={300}
										textAlign="right"
										placeholder="Technologie"
										textColor={"text-black dark:text-white"}
									/>
									<InputTextProfile
										name={`achievements.${idx}.content.year`}
										fontSize={"14px"}
										weight={300}
										type="number"
										textAlign="right"
										placeholder="Année"
										textColor={"text-black dark:text-white"}
									/>
								</div>
							</div>
						);
					})}
					{fields.length === 0 && (
						<p className="w-full font-light text-gray-400">Aucune réalisation enregistrée</p>
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
					target=".speeddial-achievement .p-speeddial-action"
					position="bottom"
					className="text-sm"
				/>
				<SpeedDial
					ref={refAchievement}
					model={items}
					direction="left"
					style={{ top: 12, right: 8 }}
					className="speeddial-achievement mini-speeddial"
					buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
				/>
			</AppCard>
		</div>
	);
};
