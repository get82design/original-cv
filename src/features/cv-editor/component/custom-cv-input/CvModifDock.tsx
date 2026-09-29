import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import { ModifSelectInput } from "@/features/cv-editor/component/custom-cv-input/ModifSelectInput";
import { ModifMiseEnPage } from "@/features/cv-editor/component/custom-cv-input/ModifMiseEnPAge";
import { SelectTemplate } from "@/features/cv-editor/component/custom-cv-input/SelectTemplate";
import { SectionNoUse } from "@/features/cv-editor/component/custom-cv-input/SectionNoUse";
import { AiAdvicePanel } from "@/features/cv-editor/component/custom-cv-input/AiAdvicePanel";
import { useAiAdvice } from "@/features/cv-editor/component/context/AiAdviceContext";
import { useCvFormSave } from "@/features/cv-editor/component/form/CvFormSaveContext";
import type { TemplateModule } from "@/services/schemas/cvTemplate.schema";
import type { CvFormValues } from "@/services/schemas/cvSave.schema";
import type { CvCoverLetter } from "@/services/schemas/cvCoverLetter.schema";
import { saveGuestCvDraft } from "@/features/cv-editor/utils/guestCvDraft";
import { Button } from "primereact/button";
import { TabPanel, TabView } from "primereact/tabview";
import { MdInfoOutline } from "react-icons/md";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const DOCK_WIDTH = 400;
const TAB_IA_INDEX = 3; // Page=0, Sections=1, Modèles=2, IA=3

interface CvModifDockProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Sur XL le dock reste toujours visible ; sur LG il est repliable. */
	collapsible: boolean;
	itemNoUse: TemplateModule[];
	addItem: (item: TemplateModule) => void;
	status: string;
	isSubmitting: boolean;
	getValues: () => CvFormValues;
	onDownloadClick?: () => void;
	onReopenCoverLetter?: (coverLetter: CvCoverLetter) => void;
}

export function CvModifDock({
	open,
	onOpenChange,
	collapsible,
	itemNoUse,
	addItem,
	status,
	isSubmitting,
	getValues,
	onDownloadClick,
	onReopenCoverLetter,
}: CvModifDockProps) {
	const router = useRouter();
	const { requestSave } = useCvFormSave();
	const showPanel = open || !collapsible;
	const { entries, iaTabNonce } = useAiAdvice();
	const showIaTab = entries.length > 0;
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		if (iaTabNonce > 0 && showIaTab) {
			setActiveIndex(TAB_IA_INDEX);
			onOpenChange(true);
		}
	}, [iaTabNonce, showIaTab, onOpenChange]);

	useEffect(() => {
		if (!showIaTab && activeIndex === TAB_IA_INDEX) {
			setActiveIndex(0);
		}
	}, [showIaTab, activeIndex]);

	return (
		<>
			{collapsible && !open && (
				<Button
					outlined
					type="button"
					className="fixed z-40 bg-white dark:bg-gray-800 text-primary-color dark:text-primary-color-dark top-28 -right-11 rotate-270"
					onClick={() => onOpenChange(true)}
				>
					Modifications
				</Button>
			)}

			<aside
				id="modele-cv-modif"
				aria-hidden={!showPanel}
				style={{ width: DOCK_WIDTH }}
				className={`fixed right-4 top-[88px] bottom-20 z-30 custom-bar flex flex-col gap-4 transition-transform duration-200 ease-out ${
					showPanel
						? "translate-x-0 pointer-events-auto"
						: "translate-x-[calc(100%+2rem)] pointer-events-none"
				}`}
			>
				{collapsible && (
					<div className="flex justify-end -mb-2 shrink-0">
						<Button
							type="button"
							text
							size="small"
							icon="pi pi-times"
							aria-label="Fermer le panneau"
							onClick={() => onOpenChange(false)}
						/>
					</div>
				)}

				<div className="shrink-0 shadow-md rounded-xl bg-white dark:bg-black relative p-0 border border-gray-100 dark:border-gray-800">
					<div style={{ height: "245px" }}>
						<div className="p-4">
							<TitleAppTwo
								firstPart="modifier la"
								secondPart="sélection"
								withSpace
								size="text-md"
							/>
							<ModifSelectInput />
						</div>
					</div>
				</div>

				<div className="flex-1 min-h-0 flex flex-col overflow-hidden rounded-xl shadow-md border border-gray-100 dark:border-gray-800 bg-white dark:bg-black">
					<TabView
						className="cv-modif-tabview flex flex-col h-full min-h-0 rounded-xl"
						id="panel-modif-cv"
						activeIndex={activeIndex}
						onTabChange={(e) => setActiveIndex(e.index)}
					>
						<TabPanel
							header="Page"
							headerClassName="text-sm flex justify-center text-center whitespace-nowrap"
							contentClassName="py-2 px-1"
						>
							<ModifMiseEnPage />
						</TabPanel>
						<TabPanel
							header="Sections"
							headerClassName="text-sm flex justify-center text-center whitespace-nowrap"
							contentClassName="py-2 px-1"
						>
							<SectionNoUse itemNoUse={itemNoUse} addItem={addItem} />
						</TabPanel>
						<TabPanel
							header="Modèles"
							headerClassName="text-sm flex justify-center text-center whitespace-nowrap"
							contentClassName="py-2 px-1"
						>
							<SelectTemplate />
						</TabPanel>
						{showIaTab ? (
							<TabPanel
								header={`IA (${entries.length})`}
								headerClassName="text-sm flex justify-center text-center whitespace-nowrap"
								contentClassName="py-2 px-1"
							>
								{onReopenCoverLetter ? (
									<AiAdvicePanel onReopenCoverLetter={onReopenCoverLetter} />
								) : (
									<AiAdvicePanel />
								)}
							</TabPanel>
						) : null}
					</TabView>
				</div>

				<div className="shrink-0 grid grid-cols-2 gap-2">
					{status === "authenticated" ? (
						<Button
							loading={isSubmitting}
							type="button"
							onClick={requestSave}
							className="flex justify-center bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
						>
							Sauver votre CV
						</Button>
					) : (
						<Button
							outlined
							type="button"
							className="flex justify-center font-semibold"
							onClick={() => {
								saveGuestCvDraft(getValues());
								router.push("/register");
							}}
						>
							Créer un compte
						</Button>
					)}
					<Button
						type="button"
						className="flex justify-center bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
						onClick={onDownloadClick}
					>
						Télécharger votre CV
					</Button>
				</div>
				{status !== "authenticated" && (
					<div className="shrink-0 flex gap-2 items-center -mt-3 text-sm text-gray-500">
						<MdInfoOutline className="w-4 h-4" />
						Créer un compte pour sauver votre cv
					</div>
				)}
			</aside>
		</>
	);
}

export const CV_MODIF_DOCK_WIDTH = DOCK_WIDTH;
