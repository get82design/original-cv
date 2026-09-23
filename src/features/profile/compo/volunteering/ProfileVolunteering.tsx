import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import type { ProfileSaveInput } from "@/services/schemas/profileSave.schema";
import type { MenuItem } from "primereact/menuitem";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { v4 as uuid } from "uuid";
import type { ListItem } from "@utils/type";
import type { VolunteeringInput } from "@/services/schemas/profileSave.schema";
import { Checkbox } from "primereact/checkbox";
import { TextareaProfile } from "../../input/TextareaProfile";
import { InputTextProfile } from "../../input/InputTextProfile";
import { PeriodeProfile } from "../../input/PeriodeProfile";
import { MiniFooterMultiFunc } from "../footer/MiniFooterMultiFunc";
import type { CV } from "../../CompoPage";
import { trpc } from "@utils/trpc";
import { DialogSelectCv } from "../common/DialogSelectCv";
import { DialogSelectVolunteering } from "./DialogSelectVolunteering";

export function createEmptyVolunteering(opts?: { order?: number }): ListItem<VolunteeringInput> {
	return {
		clientKey: `volunteering-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			title: "",
			start: new Date(),
			end: undefined,
			location: "",
			organisation: "",
			description: "",
			missions: [],
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

export const ProfileVolunteering = ({ cvs }: { cvs: CV[] }) => {
	const refBenevolat = useRef<SpeedDial>(null);
	const [openDelete, setOpenDelete] = useState(false);
	const [toDelete, setToDelete] = useState<Set<string>>(new Set());
	const [visibleMaj, setVisibleMaj] = useState(false);
	const [idCv, setIdCv] = useState<string | undefined>(undefined);
	const { data: cvSelected } = trpc.cv.byId.useQuery({ id: idCv ?? "" }, { enabled: !!idCv });
	const [visibleSelect, setVisibleSelect] = useState(false);

	const { control } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove, replace } = useFieldArray({
		control,
		name: "volunteerings",
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
			label: "Ajouter une expérience bénévole",
			icon: "pi pi-plus",
			command: () => {
				append(createEmptyVolunteering({ order: fields.length + 1 }));
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
				<DialogSelectVolunteering
					onHide={() => setVisibleSelect(false)}
					visible={visibleSelect}
					listVolunteeringFromCv={cvSelected?.volunteerings ?? []}
					listVolunteeringInProfile={fields}
					setListVolunteering={(list) => replace(list)}
				/>
			)}
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo firstPart={"Du"} secondPart={"Bénévolat"} size={"text-2xl"} withSpace />
				</div>
				<div className="mt-10 flex flex-col gap-2">
					{fields.map((field, idx: number) => {
						return (
							<div className="w-full flex flex-col gap-0" key={field.clientKey}>
								<div className="flex gap-1 items-start justify-between">
									{openDelete && (
										<Checkbox
											checked={toDelete.has(field.clientKey)}
											onChange={() => toggle(field.clientKey)}
										/>
									)}
									<div className="w-3/4 flex flex-col gap-0">
										<TextareaProfile
											placeholder="Action bénévole"
											name={`volunteerings.${idx}.content.title`}
											fontSize={"16px"}
											weight={700}
											textAlign="justify"
										/>
										<div className="-mt-2">
											<InputTextProfile
												placeholder="Organisation"
												name={`volunteerings.${idx}.content.organisation`}
												fontSize={"14px"}
												weight={300}
												textAlign="justify"
												textColor={"text-black dark:text-white"}
											/>
										</div>
									</div>
									<div className="flex flex-col gap-0 items-end">
										<PeriodeProfile
											startName={`volunteerings.${idx}.content.start`}
											endName={`volunteerings.${idx}.content.end`}
											fontSize={"14px"}
											fontWeight={300}
											textAlign={"right"}
										/>
										<div className="-mt-2">
											<InputTextProfile
												placeholder="Lieu"
												name={`volunteerings.${idx}.content.location`}
												fontSize={"14px"}
												weight={500}
												textAlign="right"
												textColor={"text-black dark:text-white"}
											/>
										</div>
									</div>
								</div>
								<div className="mt-1">
									<TextareaProfile
										placeholder="Description"
										name={`volunteering.${idx}.content.description`}
										fontSize={"14px"}
										weight={300}
										textAlign="justify"
									/>
								</div>
								<VolunteeringMissions volunteeringIndex={idx} />
							</div>
						);
					})}
					{fields.length === 0 && (
						<p className="w-full font-light text-gray-400">Aucune action bénévole enregistrée.</p>
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
					target=".speeddial-benevolat .p-speeddial-action"
					position="bottom"
					className="text-sm"
				/>
				<SpeedDial
					ref={refBenevolat}
					model={items}
					direction="left"
					style={{ top: 12, right: 8 }}
					className="speeddial-benevolat mini-speeddial"
					buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
				/>
			</AppCard>
		</div>
	);
};

function VolunteeringMissions({ volunteeringIndex }: { volunteeringIndex: number }) {
	const { control } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: `volunteerings.${volunteeringIndex}.content.missions`,
		keyName: "rhfId",
	});
	return (
		<>
			{fields.map((field, j) => (
				<div key={field.rhfId} className="flex justify-between">
					<InputTextProfile
						name={`volunteerings.${volunteeringIndex}.content.missions.${j}.content.content`}
						placeholder="Mission accomplie ?"
						fontSize={"14px"}
						weight={300}
						textColor={"text-black dark:text-white"}
					/>
					<button type="button" onClick={() => remove(j)}>
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
