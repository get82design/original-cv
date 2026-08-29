import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import type { MenuItem } from "primereact/menuitem";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { useRef, useState } from "react";
import { MiniFooterMultiFunc } from "../footer/MiniFooterMultiFunc";
import { useFieldArray, useFormContext } from "react-hook-form";
import type {
	ProfileSaveInput,
	PublicationInput,
} from "@/services/schemas/profileSave.schema";
import { Checkbox } from "primereact/checkbox";
import { TextareaProfile } from "../../input/TextareaProfile";
import { InputTextProfile } from "../../input/InputTextProfile";
import { PeriodeProfile } from "../../input/PeriodeProfile";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from "uuid";
import type { CV } from "../../CompoPage";
import { trpc } from "@utils/trpc";
import { DialogSelectCv } from "../common/DialogSelectCv";
import { DialogSelectPublication } from "./DialogSelectPublication";

function createEmptyPublication(opts?: {
	order?: number;
}): ListItem<PublicationInput> {
	return {
		clientKey: "publication-" + uuid(),
		order: opts?.order ?? 1,
		content: {
			title: "",
			start: new Date(),
			end: null,
			journalName: "",
			description: "",
			url: "",
		},
	};
}

export const ProfilePublication = ({ cvs }: { cvs: CV[] }) => {
	const refPublication = useRef<SpeedDial>(null);
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
		name: "publications",
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
			label: "Ajouter une publication",
			icon: "pi pi-plus",
			command: () => {
				append(createEmptyPublication({ order: fields.length + 1 }));
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
						setVisibleMaj(false);
					}}
					cvs={cvs}
				/>
			)}
			{visibleSelect && (
				<DialogSelectPublication
					onHide={() => setVisibleSelect(false)}
					visible={visibleSelect}
					listPublicationFromCv={cvSelected?.publications ?? []}
					listPublicationInProfile={fields}
					setListPublication={(data) => replace(data)}
				/>
			)}
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo
						firstPart={"Vos"}
						secondPart={"Publications"}
						size={"text-2xl"}
						withSpace
					/>
				</div>
				<div className="mt-10 flex flex-col gap-4">
					{fields.map((field, idx: number) => {
						return (
							<div className="w-full flex flex-col gap-0" key={field.clientKey}>
								<div className="flex gap-1 items-center">
									{openDelete && (
										<Checkbox
											checked={toDelete.has(field.clientKey)}
											onChange={() => toggle(field.clientKey)}
										/>
									)}
									<div className="w-3/4 flex flex-col gap-0">
										<TextareaProfile
											placeholder="Titre"
											name={`publications.${idx}.content.title`}
											fontSize={"16px"}
											weight={700}
											textAlign="justify"
										/>
									</div>
									<div className="flex flex-col gap-0 items-end">
										<PeriodeProfile
											startName={`publications.${idx}.content.start`}
											endName={`publications.${idx}.content.end`}
											fontSize={"14px"}
											fontWeight={300}
											textAlign={"right"}
										/>
										<div className="-mt-2">
											<InputTextProfile
												placeholder="journal"
												name={`publications.${idx}.content.journalName`}
												fontSize={"14px"}
												weight={700}
												textAlign="right"
												textColor={"text-black dark:text-white"}
											/>
										</div>
									</div>
								</div>
								<div className="w-full flex flex-col gap-0 mt-1">
									<TextareaProfile
										placeholder="Description"
										name={`publications.${idx}.content.description`}
										fontSize={"14px"}
										weight={300}
										textAlign="justify"
									/>
									<TextareaProfile
										className="italic"
										placeholder="Lien vers la publication"
										name={`publications.${idx}.content.url`}
										fontSize={"14px"}
										weight={300}
										textAlign="justify"
									/>
								</div>
							</div>
						);
					})}
					{fields.length === 0 && (
						<p className="w-full font-light text-gray-400">
							Aucune publication enregistrée
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
					target=".speeddial-publication .p-speeddial-action"
					position="bottom"
					className="text-sm"
				/>
				<SpeedDial
					ref={refPublication}
					model={items}
					direction="left"
					style={{ top: 12, right: 8 }}
					className="speeddial-publication mini-speeddial"
					buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
					// buttonStyle={PrimaryOutlinedButtonColorStyle()}
				/>
			</AppCard>
		</div>
	);
};
