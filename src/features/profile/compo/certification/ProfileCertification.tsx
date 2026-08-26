import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import type {
	CertificationInput,
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
import { Checkbox } from "primereact/checkbox";
import { InputTextProfile } from "../../input/InputTextProfile";
import { TextareaProfile } from "../../input/TextareaProfile";

function createEmptyCertification(opts?: {
	order?: number;
}): ListItem<CertificationInput> {
	return {
		clientKey: `certification-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			title: "",
			organismeCertification: "",
		},
	};
}

export function ProfileCertification() {
	const refCertification = useRef<SpeedDial>(null);
	const [openDelete, setOpenDelete] = useState(false);
	const [toDelete, setToDelete] = useState<Set<string>>(new Set());

	const { control, watch, setValue } = useFormContext<ProfileSaveInput>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: "certifications",
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
			label: "Ajouter une certification",
			icon: "pi pi-plus",
			command: () => {
				append(createEmptyCertification());
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
			disabled: !fields.length,
			command: () => {
				setOpenDelete(true);
			},
		},
	];
	return (
		<div>
			{/* <DialogSelectCv visible={visibleMaj} onHide={() => setVisibleMaj(false)} setIdCv={setIdCv} cvs={cvs} />
            <DialogSelectCertification
                onHide={() => setVisibleSelect(false)}
                visible={visibleSelect}
                listCertificationFromCv={listCertification}
                listCertificationInDashboard={watchCertification}
                setNewCertificationList={(data) => {
                    setValue('certification', data)
                    setIdCv('0')
                }}
            /> */}
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo
						firstPart={""}
						secondPart={"Certification"}
						size={"text-2xl"}
						withSpace
					/>
				</div>
				<div className="mt-10 flex flex-col gap-2">
					{fields.map((field, idx) => {
						return (
							<div className="w-full flex flex-col gap-0" key={field.clientKey}>
								<div className="w-full flex gap-2 -mb-1">
									{openDelete && (
										<Checkbox
											checked={toDelete.has(field.clientKey)}
											onChange={() => {
												toggle(field.clientKey);
											}}
										/>
									)}
									<InputTextProfile
										placeholder="Certification"
										name={`certifications.${idx}.content.title`}
										fontSize={"16px"}
										weight={700}
										textAlign="justify"
										textColor="text-black dark:text-white"
									/>
								</div>
								<TextareaProfile
									placeholder="Organisme de certification"
									name={`certifications.${idx}.content.organismeCertification`}
									fontSize={"14px"}
									weight={300}
									textAlign="justify"
								/>
							</div>
						);
					})}
					{fields.length === 0 && (
						<p className="w-full font-light text-gray-400">
							Aucune certification enregistrée.
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
					{/* {dashboardAddDelete.addCertification && <FormulaireCertificationCreate setAddMode={setAddMode} watchCertification={watchCertification} />} */}
				</div>
				<Tooltip
					target=".speeddial-certification .p-speeddial-action"
					position="bottom"
					className="text-sm"
				/>
				<SpeedDial
					ref={refCertification}
					model={items}
					direction="left"
					style={{ top: 12, right: 8 }}
					className="speeddial-certification mini-speeddial"
					buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
				/>
			</AppCard>
		</div>
	);
}
