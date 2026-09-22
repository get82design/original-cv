import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import type { MenuItem } from "primereact/menuitem";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { useRef, useState } from "react";
import { MiniFooterMultiFunc } from "../footer/MiniFooterMultiFunc";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { ProfileSaveInput, SkillInput } from "@/services/schemas/profileSave.schema";
import type { SkillGroupInput } from "@/services/schemas/profileSave.schema";
import { v4 as uuid } from "uuid";
import type { ListItem } from "@utils/type";
import { Checkbox } from "primereact/checkbox";
import { InputTextProfile } from "../../input/InputTextProfile";
import { FaTimes } from "react-icons/fa";
import { RatingProfile } from "../../input/RatingProfile";
import type { CV } from "../../CompoPage";
import { trpc } from "@utils/trpc";
import { DialogSelectCv } from "../common/DialogSelectCv";
import { DialogSelectSkillGroup } from "./DialogSelectSkill";

function createEmptySkillGroup(opts?: { order?: number }): ListItem<SkillGroupInput> {
	return {
		clientKey: `skillGroup-${uuid()}`,
		order: opts?.order ?? 0,
		content: { title: "", skills: [] },
	};
}

function createEmptySkill(opts?: { order?: number }): ListItem<SkillInput> {
	return {
		clientKey: `skill-${uuid()}`,
		order: opts?.order ?? 0,
		content: { name: "", level: "Débutant" },
	};
}

export const ProfileSkill = ({ cvs }: { cvs: CV[] }) => {
	const refSkill = useRef<SpeedDial>(null);
	const [openDelete, setOpenDelete] = useState(false);
	const [toDelete, setToDelete] = useState<Set<string>>(new Set());
	const [visibleMaj, setVisibleMaj] = useState(false);
	const [idCv, setIdCv] = useState<string | undefined>(undefined);
	const { data: cvSelected } = trpc.cv.byId.useQuery({ id: idCv ?? "" }, { enabled: !!idCv });
	const [visibleSelect, setVisibleSelect] = useState(false);

	const { control, watch, setValue } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove, replace } = useFieldArray({
		control,
		name: "skillGroups",
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
			label: "Ajouter un groupe",
			icon: "pi pi-plus",
			command: () => {
				append(createEmptySkillGroup({ order: fields.length + 1 }));
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
				<DialogSelectSkillGroup
					onHide={() => setVisibleSelect(false)}
					visible={visibleSelect}
					listSkillGroupFromCv={cvSelected?.skillGroups ?? []}
					listSkillGroupInProfile={fields}
					setListSkillGroup={(data) => replace(data)}
				/>
			)}
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo firstPart={"Vos"} secondPart={"Skills"} size={"text-2xl"} withSpace />
				</div>
				<div className="mt-10 flex flex-col gap-4">
					{fields.map((field, idx) => {
						return (
							<div className="w-full flex flex-col gap-1" key={field.clientKey}>
								<div className="w-full flex gap-2">
									{openDelete && (
										<Checkbox
											checked={toDelete.has(field.clientKey)}
											onChange={() => toggle(field.clientKey)}
										/>
									)}
									<InputTextProfile
										placeholder="Nom du groupe"
										name={`skillGroups.${idx}.content.title`}
										fontSize={"16px"}
										weight={700}
										textColor={"text-black dark:text-white"}
									/>
								</div>
								<div className="flex flex-col gap-1">
									<SkillGroupSkills groupIndex={idx} />
								</div>
							</div>
						);
					})}
					{fields.length === 0 && (
						<p className="w-full font-light text-gray-400">Aucun groupe de skills enregistré</p>
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
					target=".speeddial-skill .p-speeddial-action"
					position="bottom"
					className="text-sm"
				/>
				<SpeedDial
					ref={refSkill}
					model={items}
					direction="left"
					style={{ top: 12, right: 8 }}
					className="speeddial-skill mini-speeddial"
					buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
				/>
			</AppCard>
		</div>
	);
};

function SkillGroupSkills({ groupIndex }: { groupIndex: number }) {
	const { control } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: `skillGroups.${groupIndex}.content.skills`,
		keyName: "rhfId",
	});
	return (
		<>
			{fields.map((skill, index) => (
				<div key={skill.clientKey} className="flex gap-4 items-center">
					<InputTextProfile
						name={`skillGroups.${groupIndex}.content.skills.${index}.content.name`}
						placeholder="Nom du skill"
						fontSize={"14px"}
						weight={300}
						textColor={"text-black dark:text-white"}
						className="w-full"
					/>
					<RatingProfile name={`skillGroups.${groupIndex}.content.skills.${index}.content.level`} />
					<FaTimes
						style={{
							width: "12px",
							height: "12px",
							cursor: "pointer",
						}}
						onClick={() => remove(index)}
					/>
				</div>
			))}
			<button type="button" onClick={() => append(createEmptySkill({ order: fields.length }))}>
				Ajouter un skill
			</button>
		</>
	);
}
