import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import type { ExpertiseInput, ProfileSaveInput } from "@/services/schemas/profileSave.schema";
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
import type { CV } from "../../CompoPage";
import { trpc } from "@utils/trpc";
import { DialogSelectCv } from "../common/DialogSelectCv";
import { DialogSelectExpertise } from "./DialogSelectExpertise";

function createEmptyExpertise(opts?: { order?: number }): ListItem<ExpertiseInput> {
	return {
		clientKey: `expertise-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			title: "",
			level: "Débutant",
		},
	};
}

export const ProfileExpertise = ({ cvs }: { cvs: CV[] }) => {
	const refExpertise = useRef<SpeedDial>(null);
	const [openDelete, setOpenDelete] = useState(false);
	const [toDelete, setToDelete] = useState<Set<string>>(new Set());
	const [visibleMaj, setVisibleMaj] = useState(false);
	const [idCv, setIdCv] = useState<string | undefined>(undefined);
	const { data: cvSelected } = trpc.cv.byId.useQuery({ id: idCv ?? "" }, { enabled: !!idCv });
	const [visibleSelect, setVisibleSelect] = useState(false);

	const { control } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove, replace } = useFieldArray({
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
			<DialogSelectExpertise
				onHide={() => setVisibleSelect(false)}
				visible={visibleSelect}
				listExpertiseFromCv={cvSelected?.expertises ?? []}
				listExpertiseInProfile={fields}
				setListExpertise={(data) => replace(data)}
			/>
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo firstPart={""} secondPart={"Expertise"} size={"text-2xl"} withSpace />
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
						<p className="w-full font-light text-gray-400">Aucune expertise enregistrée.</p>
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
