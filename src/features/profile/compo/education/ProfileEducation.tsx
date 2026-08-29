import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import type {
	EducationInput,
	ProfileSaveInput,
} from "@/services/schemas/profileSave.schema";
import type { ListItem } from "@utils/type";
import type { MenuItem } from "primereact/menuitem";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { v4 as uuid } from "uuid";
import { TextareaProfile } from "../../input/TextareaProfile";
import { InputTextProfile } from "../../input/InputTextProfile";
import { MiniFooterMultiFunc } from "../footer/MiniFooterMultiFunc";
import { Checkbox } from "primereact/checkbox";
import { PeriodeProfile } from "../../input/PeriodeProfile";
import type { CV } from "../../CompoPage";
import { trpc } from "@utils/trpc";
import { DialogSelectCv } from "../common/DialogSelectCv";
import { DialogSelectEducation } from "./DialogSelectEducation";

function createEmptyEducation(opts?: {
	order?: number;
}): ListItem<EducationInput> {
	return {
		clientKey: `education-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			title: "",
			start: new Date(),
			end: null,
			city: "",
			obtained: undefined,
			degree: "",
		},
	};
}

export function ProfileEducation({ cvs }: { cvs: CV[] }) {
	const refDiplome = useRef<SpeedDial>(null);
	const [openDelete, setOpenDelete] = useState(false);
	const [toDelete, setToDelete] = useState<Set<string>>(new Set());
	const [visibleMaj, setVisibleMaj] = useState(false);
	const [idCv, setIdCv] = useState<string | undefined>(undefined);
	const { data: cvSelected } = trpc.cv.byId.useQuery(
		{ id: idCv ?? "" },
		{ enabled: !!idCv },
	);
	const [visibleSelect, setVisibleSelect] = useState(false);

	const { control, watch, setValue } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove, replace } = useFieldArray({
		control,
		name: "educations",
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
			label: "Ajouter un diplome",
			icon: "pi pi-plus",
			command: () => {
				append(createEmptyEducation({ order: fields.length + 1 }));
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
						setVisibleMaj(true);
					}}
					cvs={cvs}
				/>
			)}
			{visibleSelect && (
				<DialogSelectEducation
					visible={visibleSelect}
					listEducationFromCv={cvSelected?.educations ?? []}
					listEducationInProfile={fields}
					setListEducation={(list) => replace(list)}
					onHide={() => setVisibleSelect(false)}
				/>
			)}
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo
						firstPart={"Vos"}
						secondPart={"Diplômes"}
						size={"text-2xl"}
						withSpace
					/>
				</div>
				<div className="mt-10 flex flex-col gap-2">
					{fields.map((field, idx) => {
						return (
							<div className="w-full flex flex-col gap-0" key={field.clientKey}>
								<div className="w-full flex justify-between items-center gap-6">
									{openDelete && (
										<Checkbox
											checked={toDelete.has(field.clientKey)}
											onChange={() => toggle(field.clientKey)}
										/>
									)}
									<div className="w-3/4 flex flex-col gap-1">
										<TextareaProfile
											placeholder="Votre diplôme"
											name={`educations.${idx}.content.title`}
											fontSize={"18px"}
											weight={700}
											textAlign="left"
										/>
										<div className="-mt-2">
											<InputTextProfile
												placeholder="Etablissement"
												name={`educations.${idx}.content.school`}
												fontSize={"16px"}
												weight={300}
												textAlign="justify"
												textColor={"text-black dark:text-white"}
											/>
										</div>
									</div>
									<div className="flex flex-col items-end gap-1">
										<PeriodeProfile
											startName={`educations.${idx}.content.start`}
											endName={`educations.${idx}.content.end`}
											fontSize={"14px"}
											fontWeight={300}
											textAlign={"right"}
										/>
										<div className="-mt-2">
											<InputTextProfile
												placeholder="ville"
												name={`educations.${idx}.content.city`}
												fontSize={"14px"}
												weight={500}
												textAlign="right"
												textColor={"text-black dark:text-white"}
											/>
										</div>
									</div>
								</div>
							</div>
						);
					})}
					{fields.length === 0 && (
						<p className="w-full font-light text-gray-400">
							Aucun diplôme enregistré.
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
					target=".speeddial-diplome .p-speeddial-action"
					position="bottom"
					className="text-sm"
				/>
				<SpeedDial
					ref={refDiplome}
					model={items}
					direction="left"
					style={{ top: 12, right: 8 }}
					className="speeddial-diplome mini-speeddial"
					buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
				/>
			</AppCard>
		</div>
	);
}
