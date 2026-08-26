import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { useRef } from "react";
import { TextareaProfile } from "../../input/TextareaProfile";
import type { MenuItem } from "primereact/menuitem";

export const ProfileDescription = () => {
	const refDescription = useRef<SpeedDial>(null);

	const items: MenuItem[] = [
		{
			label: "Mise à jour depuis CV",
			icon: "pi pi-refresh",
			// disabled: nbCv === 0 && true,
			command: () => {
				// setVisibleMaj(true)
			},
		},
	];

	return (
		<div>
			{/* <DialogSelectCv visible={visibleMaj} onHide={() => setVisibleMaj(false)} setIdCv={setIdCv} cvs={cvs} /> */}
			<AppCard className="relative group">
				<div className="opacity-30 absolute top-2 left-3">
					<TitleAppTwo
						firstPart={"Votre"}
						secondPart={"Description"}
						size={"text-2xl"}
						withSpace
					/>
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
