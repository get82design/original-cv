import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import type { MenuItem } from "primereact/menuitem";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { useRef, useState } from "react";
import { MiniFooterMultiFunc } from "../footer/MiniFooterMultiFunc";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { ProfileSaveInput, StrengthInput } from "@/services/schemas/profileSave.schema";
import { v4 as uuid } from "uuid";
import type { ListItem } from "@utils/type";
import { TextareaProfile } from "../../input/TextareaProfile";
import { Checkbox } from "primereact/checkbox";
import { SelectBasicIconProfile } from "../../input/SelectIconProfile";
import { trpc } from "@utils/trpc";
import { DialogSelectCv } from "../common/DialogSelectCv";
import type { CV } from "../../CompoPage";
import { DialogSelectStrength } from "./DailogSelectStrength";

export function createEmptyStrength(opts?: { order?: number }): ListItem<StrengthInput> {
	return {
		clientKey: "strength-" + uuid(),
		order: opts?.order ?? 1,
		content: {
			title: "",
			icon: "",
			description: "",
		},
	};
}

export const ProfileStrengths = ({ cvs }: { cvs: CV[] }) => {
	const refAtout = useRef<SpeedDial>(null);
	const [openDelete, setOpenDelete] = useState(false);
	const [toDelete, setToDelete] = useState<Set<string>>(new Set());
	const [visibleMaj, setVisibleMaj] = useState(false);
	const [idCv, setIdCv] = useState<string | undefined>(undefined);
	const { data: cvSelected } = trpc.cv.byId.useQuery({ id: idCv ?? "" }, { enabled: !!idCv });
	const [visibleSelect, setVisibleSelect] = useState(false);

	const { control, watch, setValue } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove, replace } = useFieldArray({
		control,
		name: "strengths",
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
			label: "Ajouter un atout",
			icon: "pi pi-plus",
			command: () => {
				append(createEmptyStrength({ order: fields.length + 1 }));
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
				<DialogSelectStrength
					onHide={() => setVisibleSelect(false)}
					visible={visibleSelect}
					listStrengthFromCv={cvSelected?.strengths ?? []}
					listStrengthInProfile={fields}
					setListStrength={(list) => replace(list)}
				/>
			)}
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo firstPart={"Vos"} secondPart={"Atouts"} size={"text-2xl"} withSpace />
				</div>
				<div className="mt-10 flex flex-col gap-2 items-center">
					{fields.map((field, idx: number) => {
						return (
							<div className="w-full flex gap-2" key={field.clientKey}>
								<div className="flex flex-col gap-0 items-center">
									{openDelete && (
										<Checkbox
											checked={toDelete.has(field.clientKey)}
											onChange={() => toggle(field.clientKey)}
										/>
									)}
									<SelectBasicIconProfile
										icon={watch(`strengths.${idx}.content.icon`) ?? ""}
										setIcon={(data: string) =>
											setValue(`strengths.${idx}.content.icon`, data, {
												shouldDirty: true,
											})
										}
									/>
								</div>
								<div className="w-full flex flex-col gap-1">
									<TextareaProfile
										placeholder="Votre atout"
										name={`strengths.${idx}.content.title`}
										fontSize={"16px"}
										weight={700}
										textAlign="justify"
									/>
									<div className="-mt-1">
										<TextareaProfile
											placeholder="Expliquez en quoi cet atout est intéressant"
											name={`strengths.${idx}.content.description`}
											fontSize={"14px"}
											weight={300}
											textAlign="justify"
											leading={1}
										/>
									</div>
								</div>
							</div>
						);
					})}
					{fields.length === 0 && (
						<p className="w-full font-light text-gray-400">Aucun atout enregistré.</p>
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
					target=".speeddial-atout .p-speeddial-action"
					position="bottom"
					className="text-sm"
				/>
				<SpeedDial
					ref={refAtout}
					model={items}
					direction="left"
					style={{ top: 12, right: 8 }}
					className="speeddial-atout mini-speeddial"
					buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
				/>
			</AppCard>
		</div>
	);
};
