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

export function ProfileEducation() {
	const refDiplome = useRef<SpeedDial>(null);
	const [openDelete, setOpenDelete] = useState(false);
	const [toDelete, setToDelete] = useState<Set<string>>(new Set());

	const { control, watch, setValue } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove } = useFieldArray({
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
			// disabled: nbCv === 0 && true,
			command: () => {
				// setVisibleMaj(true)
			},
		},
		{
			label: "Supprimer",
			icon: "pi pi-trash",
			// disabled: !watchDiplome,
			command: () => {
				setOpenDelete(true);
			},
		},
	];

	return (
		<div>
			{/* <DialogSelectCv
                visible={visibleMaj}
                onHide={() => setVisibleMaj(false)}
                setIdCv={setIdCv}
                cvs={cvs}
            />
            <DialogSelectDiplome
                visible={visibleSelect}
                listDiplomeFromCv={diplomeTemp}
                listDiplomeInDashboard={watchDiplome
                    ? watchDiplome
                    : []}
                setListDiplome={setListDiplome}
                onHide={() => setVisibleSelect(false)}
            /> */}
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
								<div className="w-full flex justify-between items-center gap-1">
									{openDelete && (
										<Checkbox
											checked={toDelete.has(field.clientKey)}
											onChange={() => toggle(field.clientKey)}
										/>
									)}
									<div className="w-4/5">
										<TextareaProfile
											placeholder="Votre diplôme"
											name={`educations.${idx}.content.title`}
											fontSize={"18px"}
											weight={700}
											textAlign="justify"
										/>
									</div>
									<PeriodeProfile
										startName={`educations.${idx}.content.start`}
										endName={`educations.${idx}.content.end`}
										fontSize={"14px"}
										fontWeight={300}
										textAlign={"right"}
									/>
								</div>
								<div className="w-full flex justify-between items-center gap-1 -mt-1">
									<InputTextProfile
										placeholder="Etablissement"
										name={`educations.${idx}.content.school`}
										fontSize={"16px"}
										weight={300}
										textAlign="justify"
										textColor={"text-black dark:text-white"}
									/>
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
