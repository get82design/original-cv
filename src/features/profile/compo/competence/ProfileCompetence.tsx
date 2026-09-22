import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import type {
	CompetenceGroupInput,
	CompetenceInput,
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
import { TextareaProfile } from "../../input/TextareaProfile";
import { FaTimes } from "react-icons/fa";
import { Checkbox } from "primereact/checkbox";
import type { CV } from "../../CompoPage";
import { trpc } from "@utils/trpc";
import { DialogSelectCv } from "../common/DialogSelectCv";
import { DialogSelectCompetenceGroup } from "./DialogSelectCompetenceGroup";

function createEmptyCompetenceGroup(opts?: { order?: number }): ListItem<CompetenceGroupInput> {
	return {
		clientKey: `competenceGroup-${uuid()}`,
		order: opts?.order ?? 0,
		content: { title: "", competences: [] },
	};
}

function createEmptyCompetence(opts?: { order?: number }): ListItem<CompetenceInput> {
	return {
		clientKey: `competence-${uuid()}`,
		order: opts?.order ?? 0,
		content: { name: "" },
	};
}

export const ProfileCompetence = ({ cvs }: { cvs: CV[] }) => {
	const refCompetence = useRef<SpeedDial>(null);
	const [openDelete, setOpenDelete] = useState(false);
	const [toDelete, setToDelete] = useState<Set<string>>(new Set());
	const [visibleMaj, setVisibleMaj] = useState(false);
	const [idCv, setIdCv] = useState<string | undefined>(undefined);
	const { data: cvSelected } = trpc.cv.byId.useQuery({ id: idCv ?? "" }, { enabled: !!idCv });
	const [visibleSelect, setVisibleSelect] = useState(false);

	const { control, watch, setValue } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove, replace } = useFieldArray({
		control,
		name: "competenceGroups",
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
			label: "Ajouter un groupe de compétences",
			icon: "pi pi-plus",
			command: () => {
				append(createEmptyCompetenceGroup({ order: fields.length + 1 }));
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
				<DialogSelectCompetenceGroup
					onHide={() => setVisibleSelect(false)}
					visible={visibleSelect}
					listCompetenceGroupFromCv={cvSelected?.competences ?? []}
					listCompetenceGroupInProfile={fields}
					setListCompetenceGroup={(data) => replace(data)}
				/>
			)}
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo firstPart={""} secondPart={"Compétences"} size={"text-2xl"} />
				</div>
				<div className="mt-10 flex flex-col gap-2">
					{fields.map((field, idx: number) => {
						return (
							<div className="w-full flex flex-col gap-0" key={field.clientKey}>
								<div className="flex gap-2 items-top">
									{openDelete && (
										<Checkbox
											checked={toDelete.has(field.clientKey)}
											onChange={(e) => toggle(field.clientKey)}
										/>
									)}
									<TextareaProfile
										placeholder="Nom du groupe de compétences"
										name={`competenceGroups.${idx}.content.title`}
										fontSize={"16px"}
										weight={700}
										textAlign="justify"
									/>
								</div>
								<div className="w-full flex flex-col gap-0">
									<CompetenceGroupCompetences groupIndex={idx} />
								</div>
							</div>
						);
					})}
					{fields.length === 0 && (
						<p className="w-full font-light text-gray-400">Aucune compétence enregistrée.</p>
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
					target=".speeddial-competence .p-speeddial-action"
					position="bottom"
					className="text-sm"
				/>
				<SpeedDial
					ref={refCompetence}
					model={items}
					direction="left"
					style={{ top: 12, right: 8 }}
					className="speeddial-competence mini-speeddial"
					buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
				/>
			</AppCard>
		</div>
	);
};

function CompetenceGroupCompetences({ groupIndex }: { groupIndex: number }) {
	const { control } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: `competenceGroups.${groupIndex}.content.competences`,
		keyName: "rhfId",
	});
	return (
		<>
			{fields.map((competence, index) => {
				return (
					<div className="w-full flex justify-between items-start gap-1" key={competence.clientKey}>
						<TextareaProfile
							placeholder="Nom de la compétence"
							name={`competenceGroups.${groupIndex}.content.competences.${index}.content.name`}
							fontSize={"14px"}
							weight={400}
							className="w-auto"
							textAlign={"left"}
						/>
						<FaTimes
							style={{ width: "12px", height: "12px", cursor: "pointer" }}
							onClick={() => {
								remove(index);
							}}
						/>
					</div>
				);
			})}
			<button type="button" onClick={() => append(createEmptyCompetence({ order: fields.length }))}>
				Ajouter une compétence
			</button>
		</>
	);
}
