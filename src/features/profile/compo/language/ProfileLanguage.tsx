import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import type {
	LanguageInput,
	ProfileSaveInput,
} from "@/services/schemas/profileSave.schema";
import type { MenuItem } from "primereact/menuitem";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { MiniFooterMultiFunc } from "../footer/MiniFooterMultiFunc";
import { Checkbox } from "primereact/checkbox";
import { InputTextProfile } from "../../input/InputTextProfile";
import { RatingProfile } from "../../input/RatingProfile";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from "uuid";

function createEmptyLanguage(opts?: {
	order?: number;
}): ListItem<LanguageInput> {
	return {
		clientKey: `language-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			name: "",
			level: "Débutant",
		},
	};
}

export const ProfileLanguage = () => {
	const refLangue = useRef<SpeedDial>(null);
	const [openDelete, setOpenDelete] = useState(false);
	const [toDelete, setToDelete] = useState<Set<string>>(new Set());

	const { control, watch, setValue } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: "languages",
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
			label: "Ajouter une langue",
			icon: "pi pi-plus",
			command: () => {
				append(createEmptyLanguage({ order: fields.length + 1 }));
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
			disabled: fields.length === 0,
			icon: "pi pi-trash",
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
            <DialogSelectLangue
                visible={visibleSelect}
                listLangueFromCv={langueTemp}
                listLangueInDashboard={watchLangue
                    ? watchLangue
                    : []}
                setListLangue={setListLangue}
                onHide={() => setVisibleSelect(false)}
            /> */}
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo
						firstPart={""}
						secondPart={"Langues"}
						size={"text-2xl"}
						withSpace
					/>
				</div>
				<div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
					{fields.map((field, idx) => {
						return (
							<div
								key={field.clientKey}
								className="w-full flex gap-2 items-center"
							>
								{openDelete && (
									<Checkbox
										checked={toDelete.has(field.clientKey)}
										onChange={() => toggle(field.clientKey)}
									/>
								)}
								<div className="w-full flex flex-col gap-1">
									<InputTextProfile
										name={`languages.${idx}.content.name`}
										fontSize={"18px"}
										weight={700}
										textColor={"text-black dark:text-white"}
										placeholder="Langue"
									/>
								</div>
								<div className="w-1/2 flex justify-center">
									<RatingProfile name={`languages.${idx}.content.level`} />
								</div>
							</div>
						);
					})}
				</div>
				{fields.length === 0 && (
					<p className="w-full font-light text-gray-400">
						Aucune langue enregistrée
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
				<Tooltip
					target=".speeddial-langue .p-speeddial-action"
					position="bottom"
					className="text-sm"
				/>
				<SpeedDial
					ref={refLangue}
					model={items}
					direction="left"
					style={{ top: 12, right: 8 }}
					className="speeddial-langue mini-speeddial"
					buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
				/>
			</AppCard>
		</div>
	);
};
