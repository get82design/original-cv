import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import type { PassionInput, ProfileSaveInput } from "@/services/schemas/profileSave.schema";
import type { MenuItem } from "primereact/menuitem";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { MiniFooterMultiFunc } from "../footer/MiniFooterMultiFunc";
import { Checkbox } from "primereact/checkbox";
import { SelectBasicIconProfile } from "../../input/SelectIconProfile";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from "uuid";
import { trpc } from "@utils/trpc";
import { DialogSelectCv } from "../common/DialogSelectCv";
import type { CV } from "../../CompoPage";
import { DialogSelectPassion } from "./DialogSelectPassion";
import { TextareaProfile } from "../../input/TextareaProfile";

function createEmptyPassion(opts?: { order?: number }): ListItem<PassionInput> {
	return {
		clientKey: `passion-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			title: "",
			icon: "faHeart",
		},
	};
}

export const ProfilePassion = ({ cvs }: { cvs: CV[] }) => {
	const refPassion = useRef<SpeedDial>(null);
	const [openDelete, setOpenDelete] = useState(false);
	const [toDelete, setToDelete] = useState<Set<string>>(new Set());
	const [visibleMaj, setVisibleMaj] = useState(false);
	const [idCv, setIdCv] = useState<string | undefined>(undefined);
	const { data: cvSelected } = trpc.cv.byId.useQuery({ id: idCv ?? "" }, { enabled: !!idCv });
	const [visibleSelect, setVisibleSelect] = useState(false);

	const { control, watch, setValue } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove, replace } = useFieldArray({
		control,
		name: "passions",
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
			label: "Ajouter une passion",
			icon: "pi pi-plus",
			command: () => {
				append(createEmptyPassion());
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
				<DialogSelectPassion
					listPassionFromCv={cvSelected?.passions ?? []}
					listPassionInProfile={fields}
					setListPassion={(data) => replace(data)}
					visible={visibleSelect}
					onHide={() => setVisibleSelect(false)}
				/>
			)}
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo firstPart={""} secondPart={"Passions"} size={"text-2xl"} withSpace />
				</div>
				<div className="mt-10 flex flex-col gap-1">
					{fields.map((field, idx: number) => {
						return (
							<div className="w-full flex gap-2 items-center" key={field.clientKey}>
								{openDelete && (
									<Checkbox
										checked={toDelete.has(field.clientKey)}
										onChange={(e) => {
											e.preventDefault();
											toggle(field.clientKey);
										}}
									/>
								)}
								<SelectBasicIconProfile
									icon={watch(`passions.${idx}.content.icon`) ?? ""}
									setIcon={(data: string) => setValue(`passions.${idx}.content.icon`, data)}
								/>
								<TextareaProfile
									name={`passions.${idx}.content.title`}
									fontSize={"16px"}
									weight={400}
									textAlign="left"
									leading={1}
									placeholder="Nom de la passion"
								/>
							</div>
						);
					})}
					{fields.length === 0 && (
						<p className="w-full font-light text-gray-400">Aucune passion enregistrée</p>
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
					target=".speeddial-passion .p-speeddial-action"
					position="bottom"
					className="text-sm"
				/>
				<SpeedDial
					ref={refPassion}
					model={items}
					direction="left"
					style={{ top: 12, right: 8 }}
					className="speeddial-passion mini-speeddial"
					buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
				/>
			</AppCard>
		</div>
	);
};
