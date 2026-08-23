import { useSession } from "next-auth/react";
import { useMediaQuery } from "@utils/useWindowWidth";
import { TitleAppOne } from "@/components/title/TitleAppOne";
import { GeneralColor } from "@/features/cv-editor/component/custom-cv-input/GeneralColor";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import { Button } from "primereact/button";
import { ModifSelectInput } from "@/features/cv-editor/component/custom-cv-input/ModifSelectInput";
import { TabPanel, TabView } from "primereact/tabview";
import { ModifMiseEnPage } from "./component/custom-cv-input/ModifMiseEnPAge";
import { SelectTemplate } from "./component/custom-cv-input/SelectTemplate";
import { useFormContext } from "react-hook-form";
import type { TemplateModule } from "@/services/schemas/cvTemplate.schema";
import { useEffect, useState } from "react";
import { SectionNoUse } from "./component/custom-cv-input/SectionNoUse";
import { OneColumnModel } from "./component/kit-dnd/one-column-model/OneColumnModel";
import { clearEditorSelection, useCreateCvContext } from "./component/context/CreateCvContext";
import type { ItemGeneralProps } from "@utils/type";
import { compactActiveOrders, nextActiveOrder } from "@/utils/moduleOrder";
import { PageLayoutRegister } from "./component/kit-dnd/register/PageLayoutRegister";
import { getCvTypographyVars } from "./utils/utilsCv/font";
import { MdInfoOutline } from "react-icons/md";
import { saveGuestCvDraft } from "./utils/guestCvDraft";
import type { CvFormValues } from "@/services/schemas/cvSave.schema";
import { useRouter } from "next/router";
import { trpc } from "@utils/trpc";

export const CvEditor = () => {
	const {data} = trpc.cv.allByUser.useQuery();
	console.log(data);
	const router = useRouter();
	const { data: session, status } = useSession();
	const [itemNoUse, setItemNoUse] = useState<TemplateModule[]>([]);
	const {
		getValues,
		setValue,
		watch,
		formState: { isSubmitting },
	} = useFormContext();
	const isLg = useMediaQuery("(min-width: 1024px)");
	const isXl = useMediaQuery("(min-width: 1440px)");
	const modules = watch("modules") as TemplateModule[];
	const { setSectionSelected, setSelectModifInput, setSelectInputForm } =
		useCreateCvContext();
	const typography = watch("layoutGeneral.layout.typography");

	useEffect(() => {
		if (!modules) return;
		setItemNoUse(modules?.filter((module) => module.isActive === false));
	}, [modules]);

	useEffect(() => {
		const onPointerDown = (e: PointerEvent) => {
			const target = e.target as HTMLElement | null;
			if (!target) return;

			// Panneau modification → ne rien faire
			if (target.closest("#modele-cv-modif")) return;

			if (target.closest(".p-dialog, .p-menu, .p-overlaypanel")) return;

			// Clic dans la page blanche → garder la sélection
			if (target.closest(".cv-page-document")) {
				if (
					target.closest("input, textarea, .section-card, [data-cv-selectable]")
				) return;
			};

			// Dialog modal template au démarrage
			if (target.closest(".p-dialog")) return;

			clearEditorSelection({
				setSelectModifInput,
				setSelectInputForm,
				setSectionSelected,
			});
		};
		
		document.addEventListener("pointerdown", onPointerDown);
		return () => document.removeEventListener("pointerdown", onPointerDown);
	}, [setSelectModifInput, setSelectInputForm, setSectionSelected]);

	const addItem = (item: TemplateModule) => {
		if (!modules) return;

		// déjà actif → noop
		if (modules.some((m) => m.type === item.type && m.isActive)) return;

		const newOrder = nextActiveOrder(modules);

		const updated = modules.map((mod) =>
			mod.type === item.type
				? { ...mod, isActive: true, column: 0, order: newOrder }
				: mod,
		);

		setValue("modules", updated, { shouldDirty: true });
	};

	const deleteSection = (item: ItemGeneralProps) => {
		if (!modules) return;

		const type = item.id.replace("section-", ""); // ex. "experience"
		// ou: item.id.split("-")[1] comme aujourd’hui

		const deactivated = modules.map((mod) =>
			mod.type === type ? { ...mod, isActive: false } : mod,
		);

		// 1,2,4,5 → 1,2,3,4 pour les actifs restants
		const compacted = compactActiveOrders(deactivated);

		setValue("modules", compacted, { shouldDirty: true });
		setSectionSelected("");
		setSelectInputForm?.(""); // si tu l’utilises
		setSelectModifInput("");
	};

	const key =
		watch("layoutGeneral.defaultStyles.pageLayout") ?? "OneColumnModel";
	const PageLayout = PageLayoutRegister[key] ?? OneColumnModel;

	return (
		<>
			<div className="my-8 px-8 lg:hidden">
				Pour l'instant vous ne pouvez pas créer de CV en mode mobile.
			</div>
			<div className="hidden w-full lg:flex flex-row-reverse justify-end gap-8 relative">
				{/* <DialogApercu
                    visible={visible}
                    onHide={() => setVisible(false)}
                    cvForViewer={cvForViewer}
                /> */}
				{/* <RefreshCvProvider> */}
				<div className="w-full">
					<div className="lg:hidden"></div>
					<div className={"w-full flex gap-8 my-4"}>
						<div
							className="flex flex-col items-center gap-12 relative"
							style={{
								width: isXl
									? "calc(100vw - 580px)"
									: !isXl && isLg && status === "authenticated"
										? "calc(100vw - 110px)"
										: "100vw",
							}}
						>
							<div className="w-full px-4 xl:px-0 flex justify-between items-center">
								<TitleAppOne
									firstPart="Créer"
									secondPart="votre CV"
									withSpace
								/>
								<div
									style={{ maxWidth: "300px" }}
									className="flex flex-col gap-2"
								>
									<GeneralColor />
									{/* {!isXl && <PanelModificationMobile noUse={noUse} addSection={addSection} />} */}
								</div>
							</div>
							{/* //! Modeles bon du coup je pense qu'il y aura des modèles différents en fonction du nombre de colonne  */}
							<div
								id="modele-cv-page"
								style={{
									...getCvTypographyVars(typography),
									fontFamily: "var(--cv-font-body)",
								}}
								className="cv-root ml-0 lg:ml-4 xl:ml-0 flex flex-col gap-4"
							>
								<PageLayout deleteSection={deleteSection} />
							</div>
						</div>
						{isXl ? (
							<div
								id="modele-cv-modif"
								style={{
									height: "calc(100vh - 160px)",
									maxHeight: "calc(100vh - 160px)",
									width: "420px",
								}}
								className="fixed right-8 custom-bar flex flex-col gap-4"
							>
								<div
									className={`shadow-md rounded-lg bg-white dark:bg-black relative p-0`}
								>
									<div style={{ height: "245px" }}>
										<div className="p-4">
											<TitleAppTwo
												firstPart="Modifier la"
												secondPart="sélection"
												withSpace
												size="text-md"
											/>
											<ModifSelectInput />
										</div>
									</div>
								</div>

								<div
									style={{
										height: "calc(100vh - 200px - 245px - 58px)",
										maxHeight: "calc(100vh - 200px - 245px - 58px)",
									}}
									className="overflow-auto rounded-lg shadow-md"
								>
									<div
										className={`min-h-full bg-white dark:bg-black p-0 fix-p-tabview-nav-containere`}
									>
										<TabView className={`rounded-lg`} id="panel-modif-cv">
											<TabPanel
												header="Page"
												headerClassName="text-sm flex justify-center text-center"
												contentClassName="py-2"
											>
												<ModifMiseEnPage />
											</TabPanel>
											<TabPanel
												header="Sections"
												headerClassName="text-sm flex justify-center text-center"
												contentClassName="py-2"
											>
												<SectionNoUse itemNoUse={itemNoUse} addItem={addItem} />
											</TabPanel>
											<TabPanel
												header="Modèles"
												headerClassName="text-sm flex justify-center text-center"
												contentClassName="py-2"
											>
												<SelectTemplate />
											</TabPanel>
										</TabView>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-2">
									{status === "authenticated" ? (
										<Button /*onClick={() => createApercu()}*/
											loading={isSubmitting}
											type="submit"
											className="flex justify-center bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
										>
											Sauver votre CV
										</Button>
									) : (
										<Button
											outlined /*onClick={() => createApercu()}*/
											className="flex justify-center font-semibold"
											onClick={() => {
												saveGuestCvDraft(getValues() as CvFormValues);
												router.push("/register");
											}}
										>
											Créer un compte
										</Button>
									)}
									<Button /*onClick={() => createApercu()}*/
										className="flex justify-center bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
									>
										Télécharger votre CV
									</Button>
								</div>
								{status !== "authenticated" && (
									<div className="flex gap-2 items-center -mt-3 text-sm text-gray-500">
										<MdInfoOutline className="w-4 h-4" />
										Créer un compte pour sauver votre cv
									</div>
								)}
							</div>
						) : null}
					</div>
				</div>
				{/* </RefreshCvProvider> */}
			</div>
		</>
	);
};
