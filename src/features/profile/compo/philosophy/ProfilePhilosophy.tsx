import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import { MdFormatQuote } from "react-icons/md";
import { TextareaProfile } from "../../input/TextareaProfile";
import { InputTextProfile } from "../../input/InputTextProfile";
import { Tooltip } from "primereact/tooltip";
import { SpeedDial } from "primereact/speeddial";
import { useRef } from "react";
import { useFormContext } from "react-hook-form";
import type { MenuItem } from "primereact/menuitem";

export const ProfilePhilosophy = () => {
	const refPhilosophie = useRef<SpeedDial>(null);
	const { watch, setValue } = useFormContext();
	const watchPhilosophie = watch("philosophy");

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
						secondPart={"Philosophie"}
						size={"text-2xl"}
						withSpace
					/>
				</div>
				<div className="mt-10 w-full flex flex-col gap-2">
					<div
						className={`w-full flex flex-col items-center gap-4 ${watchPhilosophie?.citation && "pt-4"} relative`}
					>
						{watchPhilosophie?.citation && (
							<MdFormatQuote
								className="absolute top-0 left-12"
								style={{ width: "40px", height: "40px", opacity: "0.5" }}
							/>
						)}
						<div style={{ width: "60%" }}>
							<TextareaProfile
								name={"philosophy.citation"}
								fontSize={watchPhilosophie?.citation ? "18px" : "16px"}
								weight={watchPhilosophie?.citation ? 300 : 400}
								textAlign={watchPhilosophie?.citation ? "center" : "justify"}
								placeholder="Entrez ici votre citation"
								pressEnter
							/>
						</div>
						{watchPhilosophie?.citation && (
							<div className="w-full flex justify-end">
								<InputTextProfile
									placeholder="Auteur"
									name={"philosophy.author"}
									fontSize={"16"}
									weight={700}
									textColor={"text-black dark:text-white"}
									textAlign="right"
								/>
							</div>
						)}
					</div>
				</div>
				<Tooltip
					target=".speeddial-description .p-speeddial-action"
					position="bottom"
					className="text-sm"
				/>
				<SpeedDial
					ref={refPhilosophie}
					model={items}
					direction="left"
					style={{ top: 12, right: 8 }}
					className="speeddial-description mini-speeddial"
					buttonClassName="opacity-0 transition duration-300 ease-in-out group-hover:opacity-100"
					// buttonStyle={PrimaryOutlinedButtonColorStyle()}
				/>
			</AppCard>
		</div>
	);
};
