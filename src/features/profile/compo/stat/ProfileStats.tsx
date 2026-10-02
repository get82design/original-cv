import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import type { MenuItem } from "primereact/menuitem";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { useRef, useState } from "react";
import { MiniFooterMultiFunc } from "../footer/MiniFooterMultiFunc";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { ProfileSaveInput, StatInput } from "@/services/schemas/profileSave.schema";
import { v4 as uuid } from "uuid";
import type { ListItem } from "@utils/type";
import { TextareaProfile } from "../../input/TextareaProfile";
import { Checkbox } from "primereact/checkbox";
import { trpc } from "@utils/trpc";
import { DialogSelectCv } from "../common/DialogSelectCv";
import type { CV } from "../../CompoPage";
import { DialogSelectStat, type ProfileStatItem } from "./DialogSelectStat";

export function createEmptyStat(opts?: { order?: number }): ListItem<StatInput> {
	return {
		clientKey: `stat-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			label: "",
			value: "",
		},
	};
}

export const ProfileStats = ({ cvs }: { cvs: CV[] }) => {
	const refStat = useRef<SpeedDial>(null);
	const [openDelete, setOpenDelete] = useState(false);
	const [toDelete, setToDelete] = useState<Set<string>>(new Set());
	const [visibleMaj, setVisibleMaj] = useState(false);
	const [idCv, setIdCv] = useState<string | undefined>(undefined);
	const { data: cvSelected } = trpc.cv.byId.useQuery({ id: idCv ?? "" }, { enabled: !!idCv });
	const [visibleSelect, setVisibleSelect] = useState(false);

	const { control } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove, replace } = useFieldArray({
		control,
		name: "stats",
		keyName: "rhfId",
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
			label: "Ajouter un chiffre",
			icon: "pi pi-plus",
			command: () => {
				append(createEmptyStat({ order: fields.length + 1 }));
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
			icon: "pi pi-trash",
			disabled: fields.length === 0,
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
				<DialogSelectStat
					onHide={() => setVisibleSelect(false)}
					visible={visibleSelect}
					listStatFromCv={cvSelected?.stats ?? []}
					listStatInProfile={fields}
					setListStat={(list: ProfileStatItem[]) => replace(list)}
				/>
			)}
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo firstPart={"En"} secondPart={"nombres"} size={"text-2xl"} withSpace />
				</div>
				<div className="mt-10 flex flex-col gap-2 items-center">
					{fields.map((field, idx: number) => {
						return (
							<div className="w-full flex gap-2" key={field.clientKey}>
								{openDelete && (
									<Checkbox
										checked={toDelete.has(field.clientKey)}
										onChange={() => toggle(field.clientKey)}
									/>
								)}
								<div className="w-full flex flex-col gap-1">
									<TextareaProfile
										placeholder="Ex. +50"
										name={`stats.${idx}.content.value`}
										fontSize={"20px"}
										weight={700}
										textAlign="left"
									/>
									<div className="-mt-1">
										<TextareaProfile
											placeholder="Ex. projets livrés"
											name={`stats.${idx}.content.label`}
											fontSize={"14px"}
											weight={300}
											textAlign="left"
											leading={1}
										/>
									</div>
								</div>
							</div>
						);
					})}
					{fields.length === 0 && (
						<p className="w-full font-light text-gray-400">Aucun chiffre enregistré.</p>
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
					target=".speeddial-stat .p-speeddial-action"
					position="bottom"
					className="text-sm"
				/>
				<SpeedDial
					ref={refStat}
					model={items}
					direction="left"
					style={{ top: 12, right: 8 }}
					className="speeddial-stat mini-speeddial"
					buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
				/>
			</AppCard>
		</div>
	);
};
