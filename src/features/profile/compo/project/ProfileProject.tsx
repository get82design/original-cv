import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import type { MenuItem } from "primereact/menuitem";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { useRef, useState } from "react";
import { MiniFooterMultiFunc } from "../footer/MiniFooterMultiFunc";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { ProfileSaveInput, ProjectInput } from "@/services/schemas/profileSave.schema";
import { TextareaProfile } from "../../input/TextareaProfile";
import { InputTextProfile } from "../../input/InputTextProfile";
import { PeriodeProfile } from "../../input/PeriodeProfile";
import { Checkbox } from "primereact/checkbox";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from "uuid";
import type { CV } from "../../CompoPage";
import { DialogSelectCv } from "../common/DialogSelectCv";
import { trpc } from "@utils/trpc";
import { DialogSelectProject } from "./DialogSelectProject";

export function createEmptyProject(opts?: { order?: number }): ListItem<ProjectInput> {
	return {
		clientKey: `project-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			title: "",
			start: new Date(),
			end: undefined,
			location: "",
			description: "",
			result: "",
			missions: [],
			technology: "",
			status: undefined,
		},
	};
}

export function createEmptyMission(order = 0) {
	return {
		clientKey: `mission-${uuid()}`,
		order,
		content: { content: "" },
	};
}

export const ProfileProject = ({ cvs }: { cvs: CV[] }) => {
	const refProjet = useRef<SpeedDial>(null);
	const [openDelete, setOpenDelete] = useState(false);
	const [toDelete, setToDelete] = useState<Set<string>>(new Set());
	const [visibleMaj, setVisibleMaj] = useState(false);
	const [idCv, setIdCv] = useState<string | undefined>(undefined);
	const { data: cvSelected } = trpc.cv.byId.useQuery({ id: idCv ?? "" }, { enabled: !!idCv });
	const [visibleSelect, setVisibleSelect] = useState(false);

	const { control } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove, replace } = useFieldArray({
		control,
		name: "projects",
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
			label: "Ajouter un projet",
			icon: "pi pi-plus",
			command: () => {
				append(createEmptyProject({ order: fields.length + 1 }));
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
				<DialogSelectProject
					onHide={() => setVisibleSelect(false)}
					visible={visibleSelect}
					listProjectFromCv={cvSelected?.projects ?? []}
					listProjectInProfile={fields}
					setListProject={replace}
				/>
			)}
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo firstPart={"Vos"} secondPart={"Projets"} size={"text-2xl"} withSpace />
				</div>
				<div className="mt-10 flex flex-col gap-4">
					{fields.map((field, idx: number) => {
						return (
							<div className="w-full flex flex-col gap-0" key={field.clientKey}>
								<div className="flex gap-1 items-start">
									{openDelete && (
										<Checkbox
											checked={toDelete.has(field.clientKey)}
											onChange={() => toggle(field.clientKey)}
										/>
									)}
									<TextareaProfile
										placeholder="Nom du projet"
										name={`projects.${idx}.content.title`}
										fontSize={"16px"}
										weight={700}
										textAlign="justify"
									/>
									<div className="flex flex-col gap-1 items-end">
										<PeriodeProfile
											startName={`projects.${idx}.content.start`}
											endName={`projects.${idx}.content.end`}
											fontSize={"14px"}
											fontWeight={300}
											textAlign={"right"}
										/>
										<div className="-mt-2">
											<InputTextProfile
												placeholder="Lieu"
												name={`projects.${idx}.content.location`}
												fontSize={"14px"}
												weight={500}
												textAlign="right"
												textColor={"text-black dark:text-white"}
											/>
										</div>
									</div>
								</div>
								<div className="w-full flex flex-col gap-0 mt-1">
									<TextareaProfile
										placeholder="Description"
										name={`projects.${idx}.content.description`}
										fontSize={"14px"}
										weight={300}
										textAlign="justify"
										leading={1}
									/>
									<ProjectMissions projectIndex={idx} />
									<TextareaProfile
										placeholder="Résultat"
										name={`projects.${idx}.content.result`}
										fontSize={"14px"}
										weight={300}
										textAlign="justify"
										leading={1}
									/>
								</div>
							</div>
						);
					})}
					{fields.length === 0 && (
						<p className="w-full font-light text-gray-400">Aucun projet enregistré</p>
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
								setOpenDelete(false);
							}}
						/>
					)}
					{/* {dashboardAddDelete.addProjet
                        && <FormulaireProjetCreate setAddMode={setAddMode} projets={watchProjet} />
                    } */}
				</div>
				<Tooltip
					target=".speeddial-projet .p-speeddial-action"
					position="bottom"
					className="text-sm"
				/>
				<SpeedDial
					ref={refProjet}
					model={items}
					direction="left"
					style={{ top: 12, right: 8 }}
					className="speeddial-projet mini-speeddial"
					buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
				/>
			</AppCard>
		</div>
	);
};

function ProjectMissions({ projectIndex }: { projectIndex: number }) {
	const { control } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: `projects.${projectIndex}.content.missions`,
		keyName: "rhfId",
	});
	return (
		<>
			{fields.map((field, j) => (
				<div key={field.rhfId} className="flex justify-between items-start gap-2">
					<TextareaProfile
						name={`projects.${projectIndex}.content.missions.${j}.content.content`}
						placeholder="Mission accomplie ?"
						fontSize={"14px"}
						weight={300}
						textAlign="justify"
						leading={1}
					/>
					<button type="button" className="-mt-1.5" onClick={() => remove(j)}>
						×
					</button>
				</div>
			))}
			<button
				type="button"
				onClick={() => append(createEmptyMission(fields.length))}
				className="cursor-pointer"
			>
				Ajouter une mission
			</button>
		</>
	);
}
