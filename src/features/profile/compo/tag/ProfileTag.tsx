import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import type {
	ProfileSaveInput,
	TagGroupInput,
	TagInput,
} from "@/services/schemas/profileSave.schema";
import { Checkbox } from "primereact/checkbox";
import type { MenuItem } from "primereact/menuitem";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { InputTextProfile } from "../../input/InputTextProfile";
import { FaTimes } from "react-icons/fa";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from "uuid";
import { MiniFooterMultiFunc } from "../footer/MiniFooterMultiFunc";
import type { CV } from "../../CompoPage";
import { trpc } from "@utils/trpc";
import { DialogSelectCv } from "../common/DialogSelectCv";
import { DialogSelectTagGroup } from "./DialogSelectTagGroup";

function createEmptyTagGroup(opts?: { order?: number }): ListItem<TagGroupInput> {
	return {
		clientKey: `tagGroup-${uuid()}`,
		order: opts?.order ?? 0,
		content: { title: "", tags: [] },
	};
}

function createEmptyTag(opts?: { order?: number }): ListItem<TagInput> {
	return {
		clientKey: `tag-${uuid()}`,
		order: opts?.order ?? 0,
		content: { name: "" },
	};
}

export const ProfileTag = ({ cvs }: { cvs: CV[] }) => {
	const refTag = useRef<SpeedDial>(null);
	const [openDelete, setOpenDelete] = useState(false);
	const [toDelete, setToDelete] = useState<Set<string>>(new Set());
	const [visibleMaj, setVisibleMaj] = useState(false);
	const [idCv, setIdCv] = useState<string | undefined>(undefined);
	const { data: cvSelected } = trpc.cv.byId.useQuery({ id: idCv ?? "" }, { enabled: !!idCv });
	const [visibleSelect, setVisibleSelect] = useState(false);

	const { control, watch, setValue } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove, replace } = useFieldArray({
		control,
		name: "tagGroups",
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
				append(createEmptyTagGroup({ order: fields.length }));
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
			<DialogSelectTagGroup
				onHide={() => setVisibleSelect(false)}
				visible={visibleSelect}
				listTagGroupFromCv={cvSelected?.tagGroups ?? []}
				listTagGroupInProfile={fields}
				setListTagGroup={(data) => replace(data)}
			/>
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo firstPart={"Vos"} secondPart={"Tags"} size={"text-2xl"} withSpace />
				</div>
				<div className="mt-10 flex flex-col gap-4">
					{fields.map((field, idx) => {
						return (
							<div className="w-full flex flex-col gap-1" key={field.clientKey}>
								<div className="w-full flex gap-2">
									{openDelete && (
										<Checkbox
											checked={toDelete.has(field.clientKey)}
											onChange={(e) => toggle(field.clientKey)}
										/>
									)}
									<InputTextProfile
										placeholder="Nom du groupe"
										name={`tagGroups.${idx}.content.title`}
										fontSize={"16px"}
										weight={700}
										textColor={"text-black dark:text-white"}
									/>
								</div>
								<div className="flex gap-1 flex-wrap">
									<TagGroupTags groupIndex={idx} />
								</div>
							</div>
						);
					})}
					{fields.length === 0 && (
						<p className="w-full font-light text-gray-400">Aucun groupe de tags enregistré</p>
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
					target=".speeddial-tag .p-speeddial-action"
					position="bottom"
					className="text-sm"
				/>
				<SpeedDial
					ref={refTag}
					model={items}
					direction="left"
					style={{ top: 12, right: 8 }}
					className="speeddial-tag mini-speeddial"
					buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
				/>
			</AppCard>
		</div>
	);
};

function TagGroupTags({ groupIndex }: { groupIndex: number }) {
	const { control } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: `tagGroups.${groupIndex}.content.tags`,
		keyName: "rhfId",
	});
	return (
		<>
			{fields.map((tag, index) => {
				return (
					<div key={tag.clientKey} className="rounded-full bg-primary dark:bg-primary-dark">
						<div className="flex gap-0 items-center px-3 py-1 text-sm text-white dark:text-black">
							<InputTextProfile
								placeholder="Nom du tag"
								name={`tagGroups.${groupIndex}.content.tags.${index}.content.name`}
								fontSize={"16px"}
								weight={600}
								textColor={"dark:text-black text-white"}
								className="w-auto"
							/>
							<FaTimes
								style={{ width: "12px", height: "12px", cursor: "pointer" }}
								onClick={() => {
									remove(index);
								}}
							/>
						</div>
					</div>
				);
			})}
			<button type="button" onClick={() => append(createEmptyTag({ order: fields.length }))}>
				Ajouter un tag
			</button>
		</>
	);
}
