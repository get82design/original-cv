import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import { Checkbox } from "primereact/checkbox";
import { useRef, useState } from "react";
import { TextareaProfile } from "../../input/TextareaProfile";
import { InputTextProfile } from "../../input/InputTextProfile";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Tooltip } from "primereact/tooltip";
import { SpeedDial } from "primereact/speeddial";
import type { MenuItem } from "primereact/menuitem";
import type {
	ExperienceInput,
	ProfileSaveInput,
} from "@/services/schemas/profileSave.schema";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from "uuid";
import { PeriodeProfile } from "../../input/PeriodeProfile";
import { MiniFooterMultiFunc } from "../footer/MiniFooterMultiFunc";
import type { CV } from "../../CompoPage";
import { DialogSelectCv } from "../common/DialogSelectCv";
import { trpc } from "@utils/trpc";
import { DialogSelectExperience } from "./DialogSelectExperience";

export function createEmptyExperience(opts?: {
	order?: number;
}): ListItem<ExperienceInput> {
	return {
		clientKey: "experience-" + uuid(),
		order: opts?.order ?? 1,
		content: {
			title: "",
			company: "",
			start: new Date(),
			end: undefined,
			location: "",
			description: "",
			missions: [],
		},
	};
}

export function createEmptyMission(order = 0) {
	return {
		clientKey: "mission-" + uuid(),
		order,
		content: { content: "" },
	};
}

export const ProfileExperiences = ({ cvs }: { cvs: CV[] }) => {
	const refExperience = useRef<SpeedDial>(null);
	const [visio, setVision] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);
	const [visibleMaj, setVisibleMaj] = useState(false);
	const [idCv, setIdCv] = useState<string | undefined>(undefined);
	const { data: cvSelected } = trpc.cv.byId.useQuery(
		{ id: idCv ?? "" },
		{ enabled: !!idCv },
	);
	const [visibleSelect, setVisibleSelect] = useState(false);

	const { control } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove, replace } = useFieldArray({
		control,
		name: "experiences",
		keyName: "rhfId", // ne pas écraser clientKey
	});

	const [toDelete, setToDelete] = useState<Set<string>>(new Set());

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
			label: "Ajouter une expérience",
			icon: "pi pi-plus",
			command: () => {
				append(createEmptyExperience({ order: fields.length + 1 }));
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
		{
			label: "Voir plus de données",
			icon: "pi pi-eye",
			command: () => {
				setVision(!visio);
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
				<DialogSelectExperience
					visible={visibleSelect}
					listExperienceFromCv={cvSelected?.experiences ?? []}
					listExperienceInProfile={fields}
					setListExperience={(list) => replace(list)}
					onHide={() => setVisibleSelect(false)}
				/>
			)}
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo
						firstPart={"Vos"}
						secondPart={"Expériences"}
						size={"text-2xl"}
						withSpace
					/>
				</div>
				<div className="mt-10 flex flex-col gap-4">
					{fields.map((field, idx) => (
						<div key={field.clientKey} className="w-full flex flex-col gap-0">
							<div className="w-full flex gap-1 justify-between">
								{openDelete && (
									<Checkbox
										checked={toDelete.has(field.clientKey)}
										onChange={() => toggle(field.clientKey)}
									/>
								)}
								<div className="w-3/4 flex flex-col gap-1">
									<TextareaProfile
										placeholder="Votre intitulé"
										name={`experiences.${idx}.content.title`}
										fontSize={"18px"}
										weight={700}
										textAlign="justify"
									/>
									<div className="-mt-2">
										<InputTextProfile
											placeholder="Compagnie"
											name={`experiences.${idx}.content.company`}
											fontSize={"14px"}
											weight={300}
											textAlign="justify"
											textColor={"text-black dark:text-white"}
										/>
									</div>
								</div>
								<div className="flex flex-col items-end gap-1">
									<PeriodeProfile
										startName={`experiences.${idx}.content.start`}
										endName={`experiences.${idx}.content.end`}
										fontSize={"16px"}
										fontWeight={300}
										textAlign={"right"}
									/>
									<div className="-mt-2">
										<InputTextProfile
											placeholder="Lieu"
											name={`experiences.${idx}.content.location`}
											fontSize={"14px"}
											weight={500}
											textAlign="right"
											textColor={"text-black dark:text-white"}
										/>
									</div>
								</div>
							</div>
							{visio && (
								<>
									<div className="mt-1">
										<TextareaProfile
											placeholder="Description"
											name={`experiences.${idx}.content.description`}
											fontSize={"14px"}
											weight={300}
											textAlign="justify"
											leading={1}
										/>
									</div>
									<ExperienceMissions expIndex={idx} />
								</>
							)}
						</div>
					))}
					{fields.length === 0 && (
						<p className="w-full font-light text-gray-400">
							Aucune expérience enregistrée.
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
					target=".speeddial-experience .p-speeddial-action"
					position="bottom"
					className="text-sm"
				/>
				<SpeedDial
					ref={refExperience}
					model={items}
					direction="left"
					style={{ top: 12, right: 8 }}
					className="speeddial-experience mini-speeddial"
					buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
				/>
			</AppCard>
		</div>
	);
};

function ExperienceMissions({ expIndex }: { expIndex: number }) {
	const { control } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: `experiences.${expIndex}.content.missions`,
		keyName: "rhfId",
	});
	return (
		<>
			{fields.map((field, j) => (
				<div
					key={field.rhfId}
					className="flex justify-between items-start gap-2"
				>
					<TextareaProfile
						placeholder="Mission accomplie ?"
						name={`experiences.${expIndex}.content.missions.${j}.content.content`}
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
