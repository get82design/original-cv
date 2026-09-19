import { useSession } from "next-auth/react";
import { useMediaQuery } from "@utils/useWindowWidth";
import { TitleAppOne } from "@/components/title/TitleAppOne";
import { useFormContext } from "react-hook-form";
import type { TemplateModule } from "@/services/schemas/cvTemplate.schema";
import { useEffect, useRef, useState } from "react";
import { OneColumnModel } from "./component/kit-dnd/one-column-model/OneColumnModel";
import {
	clearEditorSelection,
	useCreateCvContext,
} from "./component/context/CreateCvContext";
import type { ItemGeneralProps } from "@utils/type";
import {
	compactActiveOrders,
	nextActiveOrderInColumn,
} from "@/utils/moduleOrder";
import { PageLayoutRegister } from "./component/kit-dnd/register/PageLayoutRegister";
import { getCvTypographyVars } from "./utils/utilsCv/font";
import type { CvFormValues } from "@/services/schemas/cvSave.schema";
import { trpc } from "@utils/trpc";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { DialogDataFromProfile } from "./component/dialog/dataFromProfile/DialogDataFromProfile";
import { DialogAssistantIa, type AiActionId } from "@/components/dialog/DialogAssistantIa";
import { DialogCvReviewResult } from "@/components/dialog/DialogCvReviewResult";
import { DialogRewriteSection } from "@/components/dialog/DialogRewriteSection";
import {
	CV_MODIF_DOCK_WIDTH,
	CvModifDock,
} from "./component/custom-cv-input/CvModifDock";
import { DialogDownloadCv } from "@/components/dialog/DialogDownloadCv";
import { captureDownloadPreviews } from "./utils/captureCvPreview";
import type { CvReview } from "@/services/schemas/cvReview.schema";
import type { CvRewriteSection as CvRewriteResult } from "@/services/schemas/cvRewriteSection.schema";
import type { CvRewriteSectionType } from "@/services/schemas/cvRewriteSection.schema";
import { Toast } from "primereact/toast";
import { flattenCvFormToText } from "./utils/flattenCvFormToText";
import {
	extractCvSectionSourceText,
	listRewriteableSections,
} from "./utils/extractCvSectionForRewrite";
import { applyCvRewriteToForm } from "./utils/applyCvRewriteToForm";
import { useAiAdvice } from "./component/context/AiAdviceContext";

export const CvEditor = () => {
	const { data } = trpc.cv.allByUser.useQuery();
	console.log(data);
	const { data: session, status } = useSession();
	const { data: profile } = trpc.profile.completeMe.useQuery();
	const [itemNoUse, setItemNoUse] = useState<TemplateModule[]>([]);
	const [visibleDialogDataFromProfile, setVisibleDialogDataFromProfile] =
		useState(false);
	const [visibleAssistantIa, setVisibleAssistantIa] = useState(false);
	const [visibleCvReview, setVisibleCvReview] = useState(false);
	const [cvReview, setCvReview] = useState<CvReview | null>(null);
	const [visibleRewrite, setVisibleRewrite] = useState(false);
	const [rewriteResult, setRewriteResult] = useState<CvRewriteResult | null>(
		null,
	);
	const [rewriteSectionType, setRewriteSectionType] =
		useState<CvRewriteSectionType | null>(null);
	const [visibleDownloadDialog, setVisibleDownloadDialog] = useState(false);
	const [downloadPreviewWithLogo, setDownloadPreviewWithLogo] = useState<
		string | null
	>(null);
	const [downloadPreviewWithoutLogo, setDownloadPreviewWithoutLogo] =
		useState<string | null>(null);
	const [downloadPreviewLoading, setDownloadPreviewLoading] = useState(false);
	const [dockOpen, setDockOpen] = useState(false);
	const { data: downloadStatus } = trpc.user.getDownloadStatus.useQuery(
		undefined,
		{ enabled: visibleDownloadDialog && status === "authenticated" },
	);
	const reviewCvMutation = trpc.ai.reviewCv.useMutation();
	const rewriteSectionMutation = trpc.ai.rewriteSection.useMutation();
	const toast = useRef<Toast>(null);
	const { pushAdvice } = useAiAdvice();
	const {
		getValues,
		setValue,
		reset,
		watch,
		formState: { isSubmitting },
	} = useFormContext();
	const isLg = useMediaQuery("(min-width: 1024px)");
	const isXl = useMediaQuery("(min-width: 1440px)");
	const modules = watch("modules") as TemplateModule[];
	const { setSectionSelected, setSelectModifInput, setSelectInputForm } =
		useCreateCvContext();
	const typography = watch("layoutGeneral.layout.typography");

	// XL : dock toujours ouvert. LG : repliable, fermé par défaut.
	const dockCollapsible = isLg && !isXl;

	useEffect(() => {
		if (isXl) setDockOpen(true);
		else if (dockCollapsible) setDockOpen(false);
	}, [isXl, dockCollapsible]);

	useEffect(() => {
		if (!modules) return;
		setItemNoUse(modules?.filter((module) => module.isActive === false));
	}, [modules]);

	useEffect(() => {
		const onPointerDown = (e: PointerEvent) => {
			const target = e.target as HTMLElement | null;
			if (!target) return;

			// Dock modifications → ne rien faire (ne ferme pas, ne clear pas)
			if (target.closest("#modele-cv-modif")) return;

			if (target.closest(".p-dialog, .p-menu, .p-overlaypanel")) return;

			if (target.closest(".cv-page-document")) {
				if (
					target.closest(
						"input, textarea, .section-card, [data-cv-selectable]",
					)
				)
					return;
			}

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
		if (modules.some((m) => m.type === item.type && m.isActive)) return;
		const target = modules.find((m) => m.type === item.type);
		const column = target?.column ?? 0;
		const newOrder = nextActiveOrderInColumn(modules, column);
		const updated = modules.map((mod) =>
			mod.type === item.type
				? { ...mod, isActive: true, order: newOrder }
				: mod,
		);
		setValue("modules", compactActiveOrders(updated), { shouldDirty: true });
	};

	const deleteSection = (item: ItemGeneralProps) => {
		if (!modules) return;

		const type = item.id.replace("section-", "");
		const deactivated = modules.map((mod) =>
			mod.type === type ? { ...mod, isActive: false } : mod,
		);
		const compacted = compactActiveOrders(deactivated);

		setValue("modules", compacted, { shouldDirty: true });
		setSectionSelected("");
		setSelectInputForm?.("");
		setSelectModifInput("");
	};

	const key =
		watch("layoutGeneral.defaultStyles.components.pageLayout") ??
		"OneColumnModel";
	const PageLayout = PageLayoutRegister[key] ?? OneColumnModel;

	const items = [
		{
			label: "Assistant IA",
			icon: "pi pi-sparkles",
			command: () => {
				setVisibleAssistantIa(true);
			},
		},
		{
			label: "Générer mon QR Code",
			icon: "pi pi-qrcode",
			command: () => {},
		},
		{
			label: "Fiche métier",
			icon: "pi pi-clipboard",
			command: () => {},
		},
		{
			label: "Quelques tips",
			icon: "pi pi-info-circle",
			command: () => {},
		},
		{
			label: "Données du profil",
			icon: "pi pi-refresh",
			command: () => {
				setVisibleDialogDataFromProfile(true);
			},
		},
	];

	const dockVisible = isLg && (isXl || dockOpen);
	const cvWidth = !isLg
		? "100vw"
		: dockVisible
			? `calc(100vw - ${CV_MODIF_DOCK_WIDTH + 80}px)`
			: status === "authenticated"
				? "calc(100vw - 110px)"
				: "100vw";

	const openDownloadDialog = async () => {
		setDownloadPreviewWithLogo(null);
		setDownloadPreviewWithoutLogo(null);
		setDownloadPreviewLoading(true);
		setVisibleDownloadDialog(true);
		try {
			const { withLogo, withoutLogo } = await captureDownloadPreviews();
			setDownloadPreviewWithLogo(withLogo);
			setDownloadPreviewWithoutLogo(withoutLogo);
		} catch {
			setDownloadPreviewWithLogo(null);
			setDownloadPreviewWithoutLogo(null);
		} finally {
			setDownloadPreviewLoading(false);
		}
	};

	const closeDownloadDialog = () => {
		setVisibleDownloadDialog(false);
		setDownloadPreviewWithLogo(null);
		setDownloadPreviewWithoutLogo(null);
		setDownloadPreviewLoading(false);
	};

	const runCvReview = async () => {
		if (status !== "authenticated") {
			toast.current?.show({
				severity: "error",
				summary: "Connexion requise",
				detail: "Connectez-vous pour utiliser la relecture IA.",
				life: 4000,
			});
			return;
		}
		const cvText = flattenCvFormToText(getValues() as CvFormValues);
		if (!cvText.trim()) {
			toast.current?.show({
				severity: "warn",
				summary: "CV vide",
				detail: "Ajoutez du contenu avant de lancer une relecture.",
				life: 4000,
			});
			return;
		}
		setCvReview(null);
		setVisibleCvReview(true);
		try {
			const { review } = await reviewCvMutation.mutateAsync({ cvText });
			setCvReview(review);
			pushAdvice({
				kind: "review-cv",
				title: "Relecture générale",
				review,
			});
		} catch (err) {
			setVisibleCvReview(false);
			toast.current?.show({
				severity: "error",
				summary: "Relecture impossible",
				detail:
					err instanceof Error
						? err.message
						: "Une erreur est survenue.",
				life: 5000,
			});
		}
	};

	const closeRewriteDialog = () => {
		if (rewriteSectionMutation.isPending) return;
		setVisibleRewrite(false);
		setRewriteResult(null);
		setRewriteSectionType(null);
	};

	const openRewriteDialog = () => {
		setRewriteResult(null);
		setRewriteSectionType(null);
		setVisibleRewrite(true);
	};

	const onPickRewriteSection = async (section: {
		sectionType: CvRewriteSectionType;
		label: string;
	}) => {
		const cv = getValues() as CvFormValues;
		const extracted = extractCvSectionSourceText(cv, section.sectionType);
		if (!extracted) {
			toast.current?.show({
				severity: "warn",
				summary: "Section vide",
				detail: "Cette section n’a pas de contenu à reformuler.",
				life: 4000,
			});
			return;
		}
		setRewriteSectionType(section.sectionType);
		setRewriteResult(null);
		try {
			const { rewrite } = await rewriteSectionMutation.mutateAsync({
				sectionType: section.sectionType,
				sectionLabel: extracted.sectionLabel,
				sourceText: extracted.sourceText,
			});
			setRewriteResult(rewrite);
		} catch (err) {
			setRewriteSectionType(null);
			toast.current?.show({
				severity: "error",
				summary: "Reformulation impossible",
				detail:
					err instanceof Error
						? err.message
						: "Une erreur est survenue.",
				life: 5000,
			});
		}
	};

	const onApplyRewrite = () => {
		if (!rewriteResult || !rewriteSectionType) return;
		const cv = getValues() as CvFormValues;
		const next = applyCvRewriteToForm(
			cv,
			rewriteSectionType,
			rewriteResult,
		);
		reset(next);
		const sectionLabel =
			listRewriteableSections(cv).find(
				(s) => s.sectionType === rewriteSectionType,
			)?.label ?? rewriteSectionType;
		pushAdvice({
			kind: "rewrite-section",
			title: `Reformulation · ${sectionLabel}`,
			review: {
				summary: rewriteResult.rationale,
				strengths: [],
				improvements: [],
				quickWins: [],
				score: null,
			},
		});
		toast.current?.show({
			severity: "success",
			summary: "Section mise à jour",
			detail: "La reformulation a été appliquée au CV.",
			life: 3500,
		});
		closeRewriteDialog();
	};

	const onSelectAiAction = (action: AiActionId) => {
		if (action === "review-cv") {
			void runCvReview();
			return;
		}
		if (action === "rewrite-section") {
			openRewriteDialog();
			return;
		}
		toast.current?.show({
			severity: "info",
			summary: "Bientôt",
			detail: "Cette action IA sera disponible prochainement.",
			life: 3500,
		});
	};

	return (
		<>
			<Toast ref={toast} position="top-center" />
			<div className="my-8 px-8 lg:hidden">
				Pour l&apos;instant vous ne pouvez pas créer de CV en mode mobile.
			</div>
			<div className="hidden w-full lg:flex flex-row-reverse justify-end gap-8 relative">
				<DialogDownloadCv
					visible={visibleDownloadDialog}
					onHide={closeDownloadDialog}
					previewUrlWithLogo={downloadPreviewWithLogo}
					previewUrlWithoutLogo={downloadPreviewWithoutLogo}
					previewLoading={downloadPreviewLoading}
					title={(getValues("title") as string) || "Votre CV"}
					freeDownloadsRemaining={downloadStatus?.freeDownloadsRemaining ?? 0}
					downloadCredits={downloadStatus?.downloadCredits ?? 0}
					onAdjust={() => setVisibleAssistantIa(true)}
				/>
				<DialogAssistantIa
					visible={visibleAssistantIa}
					onHide={() => setVisibleAssistantIa(false)}
					onSelectAction={onSelectAiAction}
				/>
				<DialogCvReviewResult
					visible={visibleCvReview}
					review={cvReview}
					loading={reviewCvMutation.isPending}
					onHide={() => {
						if (reviewCvMutation.isPending) return;
						setVisibleCvReview(false);
						setCvReview(null);
					}}
				/>
				<DialogRewriteSection
					visible={visibleRewrite}
					sections={listRewriteableSections(
						getValues() as CvFormValues,
					)}
					loading={rewriteSectionMutation.isPending}
					rewrite={rewriteResult}
					selectedType={rewriteSectionType}
					onHide={closeRewriteDialog}
					onPickSection={(section) => {
						void onPickRewriteSection(section);
					}}
					onApply={onApplyRewrite}
					onBackToPick={() => {
						setRewriteResult(null);
						setRewriteSectionType(null);
					}}
				/>
				{profile && (
					<>
						<DialogDataFromProfile
							visible={visibleDialogDataFromProfile}
							onHide={() => setVisibleDialogDataFromProfile(false)}
							profile={profile}
						/>
						<Tooltip
							target=".speeddial-bottom-right .p-speeddial-action"
							position="left"
						/>
						<SpeedDial
							className="speeddial-bottom-right z-50"
							model={items}
							radius={180}
							type="quarter-circle"
							direction="down-left"
							style={{ position: "fixed", right: 10, top: 72, zIndex: 50 }}
						/>
					</>
				)}
				<div className="w-full">
					<div className="w-full flex gap-8 my-4">
						<div
							className="flex flex-col items-center gap-12 relative"
							style={{ width: cvWidth }}
						>
							<div className="w-full px-4 xl:px-0 flex justify-between items-center">
								<TitleAppOne
									firstPart="Atelier"
									secondPart="CV"
									withSpace
								/>
							</div>
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

						{isLg && (
							<CvModifDock
								open={isXl ? true : dockOpen}
								onOpenChange={setDockOpen}
								collapsible={dockCollapsible}
								itemNoUse={itemNoUse}
								addItem={addItem}
								status={status}
								isSubmitting={isSubmitting}
								getValues={() => getValues() as CvFormValues}
								onDownloadClick={openDownloadDialog}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
};
