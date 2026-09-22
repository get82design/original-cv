import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { useEffect, useRef, useState } from "react";
import { TextareaProfile } from "../../input/TextareaProfile";
import type { MenuItem } from "primereact/menuitem";
import { DialogSelectCv } from "../common/DialogSelectCv";
import type { CV } from "../../CompoPage";
import { trpc } from "@utils/trpc";
import { useFormContext } from "react-hook-form";

export const ProfileDescription = ({ cvs }: { cvs: CV[] }) => {
	const refDescription = useRef<SpeedDial>(null);
	const [visibleMaj, setVisibleMaj] = useState(false);
	const { setValue } = useFormContext();
	const [idCv, setIdCv] = useState<string>("");
	const { data: cvSelected } = trpc.cv.byId.useQuery({ id: idCv ?? "" }, { enabled: !!idCv });

	useEffect(() => {
		if (cvSelected) {
			setValue("description.description", cvSelected.description?.description ?? "");
		}
	}, [cvSelected, setValue]);

	const items: MenuItem[] = [
		{
			label: "Mise à jour depuis CV",
			icon: "pi pi-refresh",
			disabled: cvs?.length === 0,
			command: () => {
				setVisibleMaj(true);
			},
		},
	];

	return (
		<div>
			<DialogSelectCv
				visible={visibleMaj}
				onHide={() => setVisibleMaj(false)}
				setIdCv={(id) => {
					setIdCv(id);
					setVisibleMaj(true);
				}}
				cvs={cvs}
			/>
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo firstPart={"Votre"} secondPart={"Description"} size={"text-2xl"} withSpace />
				</div>
				<div className="mt-10 flex flex-col gap-2">
					<TextareaProfile
						name={"description.description"}
						fontSize={"16px"}
						weight={300}
						placeholder="Entrez ici votre description"
						textAlign="justify"
					/>
					<Tooltip
						target=".speeddial-description .p-speeddial-action"
						position="bottom"
						className="text-sm"
					/>
					<SpeedDial
						ref={refDescription}
						model={items}
						direction="left"
						style={{ top: 12, right: 8 }}
						className="speeddial-description mini-speeddial"
						buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
					/>
				</div>
			</AppCard>
		</div>
	);
};
