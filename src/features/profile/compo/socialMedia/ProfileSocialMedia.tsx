import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import type {
	ProfileSaveInput,
	SocialMediaInput,
} from "@/services/schemas/profileSave.schema";
import type { MenuItem } from "primereact/menuitem";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { MiniFooterMultiFunc } from "../footer/MiniFooterMultiFunc";
import { Checkbox } from "primereact/checkbox";
import { SelectSocialIconProfile } from "../../input/SelectIconProfile";
import { InputTextProfile } from "../../input/InputTextProfile";
import type { ListItem } from "@utils/type";
import { v4 as uuid } from "uuid";
import type { CV } from "../../CompoPage";
import { trpc } from "@utils/trpc";
import { DialogSelectCv } from "../common/DialogSelectCv";
import { DialogSelectSocialMedia } from "./DialogSelectSocialMedia";

export function createEmptySocialMedia(opts?: {
	order?: number;
}): ListItem<SocialMediaInput> {
	return {
		clientKey: `socialMedia-${uuid()}`,
		order: opts?.order ?? 1,
		content: {
			icon: "faGlobe",
			socialNetwork: "",
			username: "",
		},
	};
}

export const ProfileSocialMedia = ({ cvs }: { cvs: CV[] }) => {
	const refSocial = useRef<SpeedDial>(null);
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
		name: "socialMedias",
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
			label: "Ajouter un réseau social",
			icon: "pi pi-plus",
			command: () => {
				append(createEmptySocialMedia());
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
				<DialogSelectSocialMedia
					onHide={() => setVisibleSelect(false)}
					visible={visibleSelect}
					listSocialMediaFromCv={cvSelected?.socialMedias ?? []}
					listSocialMediaInProfile={fields}
					setListSocialMedia={(data) => replace(data)}
				/>
			)}
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo
						firstPart={""}
						secondPart={"Réseaux"}
						size={"text-2xl"}
						withSpace
					/>
				</div>
				<div className="mt-10 flex flex-col gap-2">
					{fields.map((field, idx) => {
						return (
							<div
								className="w-full flex gap-0 items-center"
								key={field.clientKey}
							>
								{openDelete && (
									<Checkbox
										checked={toDelete.has(field.clientKey)}
										onChange={() => toggle(field.clientKey)}
									/>
								)}
								<div className="w-1/8 flex flex-col gap-1">
									<SelectSocialIconProfile
										icon={watch(`socialMedias.${idx}.content.icon`) ?? ""}
										setIcon={(data: string) =>
											setValue(`socialMedias.${idx}.content.icon`, data, {
												shouldDirty: true,
											})
										}
									/>
								</div>
								<div className="w-7/8 flex flex-col gap-0">
									<InputTextProfile
										placeholder="réseau social"
										name={`socialMedias.${idx}.content.socialNetwork`}
										fontSize={"16px"}
										weight={700}
										textColor={"text-black dark:text-white font-semibold"}
									/>
									<InputTextProfile
										placeholder="Nom d'utilisateur"
										name={`socialMedias.${idx}.content.username`}
										fontSize={"14px"}
										weight={300}
										textColor={"text-black dark:text-white font-light -mt-1"}
									/>
								</div>
							</div>
						);
					})}
					{fields.length === 0 && (
						<p className="w-full font-light text-gray-400">
							Pas de réseaux sociaux enregistrés
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
						target=".speeddial-social .p-speeddial-action"
						position="bottom"
						className="text-sm"
					/>
					<SpeedDial
						ref={refSocial}
						model={items}
						direction="left"
						style={{ top: 12, right: 8 }}
						className="speeddial-social mini-speeddial"
						buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
					/>
				</div>
			</AppCard>
		</div>
	);
};
