import { useSession } from "next-auth/react";
import { useMediaQuery } from "@utils/useWindowWidth";
import { TitleAppOne } from "@/components/title/TitleAppOne";
import { useFormContext } from "react-hook-form";
import type { TemplateModule } from "@/services/schemas/cvTemplate.schema";
import { useEffect, useMemo, useRef, useState } from "react";
import { OneColumnModel } from "./component/kit-dnd/one-column-model/OneColumnModel";
import { clearEditorSelection, useCreateCvContext } from "./component/context/CreateCvContext";
import type { ItemGeneralProps } from "@utils/type";
import { compactActiveOrders, nextActiveOrderInColumn } from "@/utils/moduleOrder";
import { commitCvFormHistory } from "./utils/cvFormHistoryCommit";
import { PageLayoutRegister } from "./component/kit-dnd/register/PageLayoutRegister";
import { getCvTypographyVars } from "./utils/utilsCv/font";
import type { CvFormValues } from "@/services/schemas/cvSave.schema";
import { trpc } from "@utils/trpc";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { Button } from "primereact/button";
import { DialogDataFromProfile } from "./component/dialog/dataFromProfile/DialogDataFromProfile";
import { DialogCvTips } from "./component/dialog/DialogCvTips";
import { DialogCvOnboarding } from "./component/dialog/DialogCvOnboarding";
import { DialogAssistantIa, type AiActionId } from "@/components/dialog/DialogAssistantIa";
import { DialogAiPayment } from "@/components/dialog/DialogAiPayment";
import { DialogCvReviewResult } from "@/components/dialog/DialogCvReviewResult";
import { DialogRewriteSection } from "@/components/dialog/DialogRewriteSection";
import {
	DialogCoverLetter,
	type CoverLetterFormValues,
} from "@/components/dialog/DialogCoverLetter";
import {
	DialogMatchJob,
	type MatchJobFormValues,
} from "@/components/dialog/DialogMatchJob";
import { DialogFicheMetier } from "@/components/dialog/DialogFicheMetier";
import { CV_MODIF_DOCK_WIDTH, CvModifDock } from "./component/custom-cv-input/CvModifDock";
import { useCvFormHistory } from "./component/form/CvFormHistoryContext";
import { DialogDownloadCv } from "@/components/dialog/DialogDownloadCv";
import {
	DialogRecentDownloadWarn,
	type PendingDownloadKind,
} from "@/components/dialog/DialogRecentDownloadWarn";
import {
	captureCvPreview,
	captureDownloadPreviews,
	waitForNextPaint,
} from "./utils/captureCvPreview";
import { useCvSignatureVariant } from "./component/context/CvSignatureVariantContext";
import type { CvSignatureVariantId } from "./utils/cvSignatureVariants";
import type { CvReview } from "@/services/schemas/cvReview.schema";
import type { CvRewriteSection as CvRewriteResult } from "@/services/schemas/cvRewriteSection.schema";
import type { CvRewriteSectionType } from "@/services/schemas/cvRewriteSection.schema";
import type { CvCoverLetter } from "@/services/schemas/cvCoverLetter.schema";
import type { CvMatchJob } from "@/services/schemas/cvMatchJob.schema";
import type { RomeFicheDto } from "@/services/schemas/romeFiche.schema";
import { formatRomeFicheForPrompt } from "@/services/schemas/romeFiche.schema";
import { Toast } from "primereact/toast";
import { flattenCvFormToText } from "./utils/flattenCvFormToText";
import { FieldNameHeader } from "./utils/fields/fieldNameHeader";
import { extractPrimaryColorName } from "@/services/cv/extractPrimaryColorName";
import { getClientErrorMessage, isTooManyRequestsError } from "@/utils/clientError";
import {
	extractCvSectionSourceText,
	listRewriteableSections,
} from "./utils/extractCvSectionForRewrite";
import { applyCvRewriteToForm } from "./utils/applyCvRewriteToForm";
import { useAiAdvice } from "./component/context/AiAdviceContext";
import { useModelAndColorContext } from "./component/context/ModelAndColorContext";
import type { AiCreditPaymentChoice } from "@/services/ai/aiBillingService";
import type { BillableAiFeature } from "@/services/ai/aiBillingService";
import { isTemplateLocked } from "./utils/isTemplateLocked";

export const CvEditor = () => {
	const { data } = trpc.cv.allByUser.useQuery();
	console.log(data);
	const { status } = useSession();
	const { data: profile } = trpc.profile.completeMe.useQuery();
	const { data: me } = trpc.user.me.useQuery(undefined, {
		enabled: status === "authenticated",
	});
	const onboardingAutoOpenedRef = useRef(false);
	const [itemNoUse, setItemNoUse] = useState<TemplateModule[]>([]);
	const [visibleDialogDataFromProfile, setVisibleDialogDataFromProfile] = useState(false);
	const [visibleAssistantIa, setVisibleAssistantIa] = useState(false);
	const [visibleTips, setVisibleTips] = useState(false);
	const [visibleOnboarding, setVisibleOnboarding] = useState(false);
	const [visibleCvReview, setVisibleCvReview] = useState(false);
	const [cvReview, setCvReview] = useState<CvReview | null>(null);
	const [visibleRewrite, setVisibleRewrite] = useState(false);
	const [rewriteResult, setRewriteResult] = useState<CvRewriteResult | null>(null);
	const [rewriteSectionType, setRewriteSectionType] = useState<CvRewriteSectionType | null>(null);
	const [visibleCoverLetter, setVisibleCoverLetter] = useState(false);
	const [coverLetterResult, setCoverLetterResult] = useState<CvCoverLetter | null>(null);
	const [visibleMatchJob, setVisibleMatchJob] = useState(false);
	const [matchJobResult, setMatchJobResult] = useState<CvMatchJob | null>(null);
	const [visibleFicheMetier, setVisibleFicheMetier] = useState(false);
	const [matchRomeFicheResult, setMatchRomeFicheResult] = useState<CvMatchJob | null>(null);
	const [visibleDownloadDialog, setVisibleDownloadDialog] = useState(false);
	const [downloadPreviewWithLogo, setDownloadPreviewWithLogo] = useState<string | null>(null);
	const [downloadPreviewWithoutLogo, setDownloadPreviewWithoutLogo] = useState<string | null>(null);
	const [downloadPreviewLoading, setDownloadPreviewLoading] = useState(false);
	const [pendingRecentDownload, setPendingRecentDownload] = useState<PendingDownloadKind | null>(
		null,
	);
	const [dockOpen, setDockOpen] = useState(false);
	const [paymentDialog, setPaymentDialog] = useState<{
		feature: BillableAiFeature;
		title: string;
		pending:
			| { kind: "review"; cvText: string }
			| {
					kind: "rewrite";
					sectionType: CvRewriteSectionType;
					sectionLabel: string;
					sourceText: string;
			  }
			| {
					kind: "cover-letter";
					cvText: string;
					companyName?: string;
					jobTitle?: string;
					jobOffer?: string;
			  }
			| {
					kind: "match-job";
					cvText: string;
					jobOffer: string;
					companyName?: string;
					jobTitle?: string;
			  }
			| {
					kind: "match-rome-fiche";
					cvText: string;
					ficheText: string;
					codeRome: string;
					libelleRome: string;
			  };
	} | null>(null);
	const billingOptionsQuery = trpc.ai.getBillingOptions.useQuery(
		{ feature: paymentDialog?.feature ?? "REVIEW_CV" },
		{ enabled: !!paymentDialog && status === "authenticated" },
	);
	const reviewCvMutation = trpc.ai.reviewCv.useMutation();
	const rewriteSectionMutation = trpc.ai.rewriteSection.useMutation();
	const coverLetterMutation = trpc.ai.coverLetter.useMutation();
	const matchJobMutation = trpc.ai.matchJob.useMutation();
	const matchRomeFicheMutation = trpc.ai.matchRomeFiche.useMutation();
	const utils = trpc.useUtils();
	const updateUserProfileMutation = trpc.user.updateProfile.useMutation({
		onSuccess: () => {
			void utils.user.me.invalidate();
		},
	});
	const toast = useRef<Toast>(null);
	const consumeFreeDownloadMutation = trpc.user.consumeFreeDownload.useMutation();
	const consumePaidDownloadMutation = trpc.user.consumePaidDownload.useMutation();
	const unlockTemplateMutation = trpc.unlockedTemplate.unlock.useMutation();
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
	const watchHeaderSubtitle = (watch(FieldNameHeader.subTitle) as string | undefined) ?? "";
	const watchTemplateId = watch("templateId") as string | undefined;
	const watchCvId = watch("cvId") as string | undefined;
	const downloadStatusCvId =
		watchCvId && watchCvId.trim() && watchCvId !== "0" ? watchCvId.trim() : undefined;
	const { data: downloadStatus } = trpc.user.getDownloadStatus.useQuery(
		downloadStatusCvId ? { cvId: downloadStatusCvId } : undefined,
		{
			enabled: visibleDownloadDialog && status === "authenticated",
		},
	);
	const { modeles } = useModelAndColorContext();
	const unlockedQuery = trpc.unlockedTemplate.findAll.useQuery(undefined, {
		enabled: status === "authenticated",
	});
	const unlockedIds = useMemo(
		() => new Set((unlockedQuery.data ?? []).map((u) => u.templateId)),
		[unlockedQuery.data],
	);
	const premiumLocked = useMemo(() => {
		if (!watchTemplateId) return false;
		const model = modeles.find((m) => m.id === watchTemplateId);
		if (!model) return false;
		return isTemplateLocked(model, unlockedIds);
	}, [watchTemplateId, modeles, unlockedIds]);
	const unlockPricing = useMemo(() => {
		if (!watchTemplateId) {
			return { priceCredits: null as number | null, priceCents: null as number | null };
		}
		const model = modeles.find((m) => m.id === watchTemplateId);
		return {
			priceCredits: model?.priceCredits ?? null,
			priceCents: model?.priceCents ?? null,
		};
	}, [watchTemplateId, modeles]);
	const { variant: signatureVariant, setVariant: setSignatureVariant } = useCvSignatureVariant();
	const { setSectionSelected, setSelectModifInput, setSelectInputForm } = useCreateCvContext();
	const { undo, redo, canUndo, canRedo } = useCvFormHistory();
	const typography = watch("layoutGeneral.layout.typography");

	// XL : dock toujours ouvert. LG : repliable, fermé par défaut.
	const dockCollapsible = isLg && !isXl;

	useEffect(() => {
		if (isXl) setDockOpen(true);
		else if (dockCollapsible) setDockOpen(false);
	}, [isXl, dockCollapsible]);

	// Stepper 1ère utilisation : une seule auto-ouverture par montage si pas d’opt-out.
	useEffect(() => {
		if (status !== "authenticated" || !me || me.hideCvOnboarding) return;
		if (onboardingAutoOpenedRef.current) return;
		onboardingAutoOpenedRef.current = true;
		setVisibleOnboarding(true);
	}, [status, me]);

	useEffect(() => {
		if (!modules) return;
		const next = modules.filter((module) => module.isActive === false);
		setItemNoUse((prev) => {
			if (
				prev.length === next.length &&
				prev.every((m, i) => m.type === next[i]?.type && m.isActive === next[i]?.isActive)
			) {
				return prev;
			}
			return next;
		});
	}, [modules]);

	useEffect(() => {
		const onPointerDown = (e: PointerEvent) => {
			const target = e.target as HTMLElement | null;
			if (!target) return;

			// Dock modifications → ne rien faire (ne ferme pas, ne clear pas)
			if (target.closest("#modele-cv-modif")) return;

			if (target.closest(".p-dialog, .p-menu, .p-overlaypanel")) return;

			if (target.closest(".cv-page-document")) {
				if (target.closest("input, textarea, .section-card, [data-cv-selectable]")) return;
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

	// Undo/redo structurel — laisse Ctrl+Z natif dans les champs texte.
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			const mod = e.ctrlKey || e.metaKey;
			if (!mod) return;
			const target = e.target as HTMLElement | null;
			if (target?.closest("input, textarea, [contenteditable='true']")) return;

			const key = e.key.toLowerCase();
			if (key === "z" && !e.shiftKey) {
				if (!canUndo) return;
				e.preventDefault();
				undo();
				return;
			}
			if (key === "y" || (key === "z" && e.shiftKey)) {
				if (!canRedo) return;
				e.preventDefault();
				redo();
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [undo, redo, canUndo, canRedo]);

	const addItem = (item: TemplateModule) => {
		if (!modules) return;
		if (modules.some((m) => m.type === item.type && m.isActive)) return;
		const target = modules.find((m) => m.type === item.type);
		const column = target?.column ?? 0;
		const newOrder = nextActiveOrderInColumn(modules, column);
		const updated = modules.map((mod) =>
			mod.type === item.type ? { ...mod, isActive: true, order: newOrder } : mod,
		);
		commitCvFormHistory();
		setValue("modules", compactActiveOrders(updated), { shouldDirty: true });
	};

	const deleteSection = (item: ItemGeneralProps) => {
		if (!modules) return;

		const type = item.id.replace("section-", "");
		const deactivated = modules.map((mod) =>
			mod.type === type ? { ...mod, isActive: false } : mod,
		);
		const compacted = compactActiveOrders(deactivated);

		commitCvFormHistory();
		setValue("modules", compacted, { shouldDirty: true });
		setSectionSelected("");
		setSelectInputForm?.("");
		setSelectModifInput("");
	};

	const key = watch("layoutGeneral.defaultStyles.components.pageLayout") ?? "OneColumnModel";
	const PageLayout = PageLayoutRegister[key] ?? OneColumnModel;

	// Entrées de menu pas encore implémentées : informer au lieu d'une action vide.
	const showComingSoon = (detail: string) => {
		toast.current?.show({
			severity: "info",
			summary: "Bientôt",
			detail,
			life: 4000,
		});
	};

	const items = [
		{
			label: "Assistant IA",
			icon: "pi pi-sparkles",
			command: () => {
				setVisibleAssistantIa(true);
			},
		},
		{
			label: "Générer mon QR Code (bientôt)",
			icon: "pi pi-qrcode",
			command: () => {
				showComingSoon("Le QR code arrivera avec la version en ligne de votre CV.");
			},
		},
		{
			label: "Fiche métier",
			icon: "pi pi-clipboard",
			command: () => {
				setMatchRomeFicheResult(null);
				setVisibleFicheMetier(true);
			},
		},
		{
			label: "Quelques tips",
			icon: "pi pi-info-circle",
			command: () => {
				setVisibleTips(true);
			},
		},
		// Sans profil il n'y a rien à réinjecter : on masque l'entrée plutôt que de l'ouvrir vide.
		...(profile
			? [
					{
						label: "Données du profil",
						icon: "pi pi-refresh",
						command: () => {
							setVisibleDialogDataFromProfile(true);
						},
					},
				]
			: []),
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

	/** L'habillage est appliqué à la vraie page : attendre un rendu avant de recapturer. */
	const changeSignatureVariant = async (variant: CvSignatureVariantId) => {
		if (variant === signatureVariant) return;
		setSignatureVariant(variant);
		setDownloadPreviewLoading(true);
		try {
			await waitForNextPaint();
			setDownloadPreviewWithLogo(await captureCvPreview());
		} catch {
			setDownloadPreviewWithLogo(null);
		} finally {
			setDownloadPreviewLoading(false);
		}
	};

	const closeDownloadDialog = () => {
		setVisibleDownloadDialog(false);
		setDownloadPreviewWithLogo(null);
		setDownloadPreviewWithoutLogo(null);
		setDownloadPreviewLoading(false);
		setPendingRecentDownload(null);
	};

	const downloadMeta = () => {
		const cv = getValues() as CvFormValues;
		const cvId = cv.cvId?.trim();
		const templateId = cv.templateId?.trim();
		const primaryColorName = extractPrimaryColorName(cv.layoutGeneral ?? null);
		return {
			...(cvId && cvId !== "0" ? { cvId } : {}),
			...(templateId ? { templateId } : {}),
			...(primaryColorName ? { primaryColorName } : {}),
		};
	};

	const onDownloadFree = async () => {
		if (status !== "authenticated") {
			toast.current?.show({
				severity: "error",
				summary: "Connexion requise",
				detail: "Connectez-vous pour télécharger.",
				life: 4000,
			});
			return;
		}
		try {
			await consumeFreeDownloadMutation.mutateAsync(downloadMeta());
			await utils.user.getDownloadStatus.invalidate();
			toast.current?.show({
				severity: "success",
				summary: "Téléchargement enregistré",
				detail: "1 export avec logo consommé (PDF bientôt).",
				life: 3500,
			});
			closeDownloadDialog();
		} catch (err) {
			toast.current?.show({
				severity: "error",
				summary: "Export impossible",
				detail: getClientErrorMessage(err, "Une erreur est survenue."),
				life: 5000,
			});
		}
	};

	const onDownloadPaid = async () => {
		if (status !== "authenticated") {
			toast.current?.show({
				severity: "error",
				summary: "Connexion requise",
				detail: "Connectez-vous pour télécharger.",
				life: 4000,
			});
			return;
		}
		try {
			await consumePaidDownloadMutation.mutateAsync(downloadMeta());
			await utils.user.getDownloadStatus.invalidate();
			toast.current?.show({
				severity: "success",
				summary: "Téléchargement enregistré",
				detail: "1 crédit sans logo consommé (PDF bientôt).",
				life: 3500,
			});
			closeDownloadDialog();
		} catch (err) {
			toast.current?.show({
				severity: "error",
				summary: "Export impossible",
				detail: getClientErrorMessage(err, "Une erreur est survenue."),
				life: 5000,
			});
		}
	};

	/** Avant débit : avertir si re-DL &lt; 10 min (le plafond 3/j est déjà bloqué dans la modale). */
	const requestDownload = (kind: PendingDownloadKind) => {
		if (downloadStatus?.dailyLimitReached) return;
		if (downloadStatus?.recentDownloadWarn) {
			setPendingRecentDownload(kind);
			return;
		}
		if (kind === "free") void onDownloadFree();
		else void onDownloadPaid();
	};

	const confirmRecentDownload = () => {
		const kind = pendingRecentDownload;
		setPendingRecentDownload(null);
		if (kind === "free") void onDownloadFree();
		else if (kind === "paid") void onDownloadPaid();
	};

	const onUnlockWithCredits = async () => {
		const templateId = (getValues("templateId") as string | undefined)?.trim();
		if (!templateId) return;
		try {
			await unlockTemplateMutation.mutateAsync({
				templateId,
				method: "credits",
			});
			await Promise.all([
				utils.unlockedTemplate.findAll.invalidate(),
				utils.user.getDownloadStatus.invalidate(),
			]);
			toast.current?.show({
				severity: "success",
				summary: "Modèle débloqué",
				detail: "Vous pouvez maintenant télécharger votre CV.",
				life: 3500,
			});
		} catch (err) {
			toast.current?.show({
				severity: "error",
				summary: "Déblocage impossible",
				detail: err instanceof Error ? err.message : "Une erreur est survenue.",
				life: 5000,
			});
		}
	};

	const onUnlockWithStripe = () => {
		toast.current?.show({
			severity: "info",
			summary: "Bientôt",
			detail: "Le paiement Stripe sera disponible prochainement.",
			life: 3500,
		});
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
		setPaymentDialog({
			feature: "REVIEW_CV",
			title: "Payer la relecture",
			pending: { kind: "review", cvText },
		});
	};

	const executePaidAiAction = async (choice: AiCreditPaymentChoice) => {
		if (!paymentDialog) return;
		const pending = paymentDialog.pending;
		try {
			if (pending.kind === "review") {
				setPaymentDialog(null);
				setCvReview(null);
				setVisibleCvReview(true);
				const { review } = await reviewCvMutation.mutateAsync({
					cvText: pending.cvText,
					paymentMethod: choice,
				});
				setCvReview(review);
				pushAdvice({
					kind: "review-cv",
					title: "Relecture générale",
					review,
				});
				return;
			}

			if (pending.kind === "cover-letter") {
				setPaymentDialog(null);
				setCoverLetterResult(null);
				setVisibleCoverLetter(true);
				const { coverLetter } = await coverLetterMutation.mutateAsync({
					cvText: pending.cvText,
					paymentMethod: choice,
					...(pending.companyName ? { companyName: pending.companyName } : {}),
					...(pending.jobTitle ? { jobTitle: pending.jobTitle } : {}),
					...(pending.jobOffer ? { jobOffer: pending.jobOffer } : {}),
				});
				setCoverLetterResult(coverLetter);
				const adviceTitle = pending.companyName
					? `Lettre · ${pending.companyName}`
					: pending.jobTitle
						? `Lettre · ${pending.jobTitle}`
						: "Lettre de motivation";
				pushAdvice({
					kind: "cover-letter",
					title: adviceTitle,
					review: {
						summary: coverLetter.letter.slice(0, 400),
						strengths: [],
						improvements: [],
						quickWins: coverLetter.subject ? [coverLetter.subject] : [],
						score: null,
					},
					coverLetter,
				});
				return;
			}

			if (pending.kind === "match-job") {
				setPaymentDialog(null);
				setMatchJobResult(null);
				setVisibleMatchJob(true);
				const { match } = await matchJobMutation.mutateAsync({
					cvText: pending.cvText,
					jobOffer: pending.jobOffer,
					paymentMethod: choice,
					...(pending.companyName ? { companyName: pending.companyName } : {}),
					...(pending.jobTitle ? { jobTitle: pending.jobTitle } : {}),
				});
				setMatchJobResult(match);
				const adviceTitle = pending.companyName
					? `Match · ${pending.companyName}`
					: pending.jobTitle
						? `Match · ${pending.jobTitle}`
						: "Comparaison annonce";
				pushAdvice({
					kind: "match-job",
					title: adviceTitle,
					review: {
						summary: match.summary,
						score: match.score,
						strengths: match.matched,
						improvements: match.gaps,
						quickWins: match.keywordsToAdd,
					},
					matchJob: match,
				});
				return;
			}

			if (pending.kind === "match-rome-fiche") {
				setPaymentDialog(null);
				setMatchRomeFicheResult(null);
				setVisibleFicheMetier(true);
				const { match } = await matchRomeFicheMutation.mutateAsync({
					cvText: pending.cvText,
					ficheText: pending.ficheText,
					paymentMethod: choice,
					codeRome: pending.codeRome,
					libelleRome: pending.libelleRome,
				});
				setMatchRomeFicheResult(match);
				pushAdvice({
					kind: "match-rome-fiche",
					title: `Fiche · ${pending.libelleRome}`,
					review: {
						summary: match.summary,
						score: match.score,
						strengths: match.matched,
						improvements: match.gaps,
						quickWins: match.keywordsToAdd,
					},
					matchJob: match,
					matchRomeFiche: true,
				});
				return;
			}

			setPaymentDialog(null);
			setRewriteSectionType(pending.sectionType);
			setRewriteResult(null);
			setVisibleRewrite(true);
			const { rewrite } = await rewriteSectionMutation.mutateAsync({
				sectionType: pending.sectionType,
				sectionLabel: pending.sectionLabel,
				sourceText: pending.sourceText,
				paymentMethod: choice,
			});
			setRewriteResult(rewrite);
		} catch (err) {
			if (pending.kind === "review") setVisibleCvReview(false);
			else if (pending.kind === "cover-letter") {
				setCoverLetterResult(null);
				setVisibleCoverLetter(false);
			} else if (pending.kind === "match-job") {
				setMatchJobResult(null);
				setVisibleMatchJob(false);
			} else if (pending.kind === "match-rome-fiche") {
				setMatchRomeFicheResult(null);
			} else {
				setRewriteSectionType(null);
				setVisibleRewrite(false);
			}
			const rateLimited = isTooManyRequestsError(err);
			toast.current?.show({
				severity: "error",
				summary: rateLimited
					? "Assistant saturé"
					: pending.kind === "review"
						? "Relecture impossible"
						: pending.kind === "cover-letter"
							? "Lettre impossible"
							: pending.kind === "match-job"
								? "Comparaison impossible"
								: pending.kind === "match-rome-fiche"
									? "Comparaison fiche impossible"
									: "Reformulation impossible",
				detail: getClientErrorMessage(err, "Une erreur est survenue."),
				life: rateLimited ? 7000 : 5000,
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
		if (status !== "authenticated") {
			toast.current?.show({
				severity: "error",
				summary: "Connexion requise",
				detail: "Connectez-vous pour utiliser la reformulation IA.",
				life: 4000,
			});
			return;
		}
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
		setVisibleRewrite(false);
		setPaymentDialog({
			feature: "REWRITE_SECTION",
			title: "Payer la reformulation",
			pending: {
				kind: "rewrite",
				sectionType: section.sectionType,
				sectionLabel: extracted.sectionLabel,
				sourceText: extracted.sourceText,
			},
		});
	};

	const onApplyRewrite = () => {
		if (!rewriteResult || !rewriteSectionType) return;
		const cv = getValues() as CvFormValues;
		const next = applyCvRewriteToForm(cv, rewriteSectionType, rewriteResult);
		commitCvFormHistory();
		reset(next);
		const sectionLabel =
			listRewriteableSections(cv).find((s) => s.sectionType === rewriteSectionType)?.label ??
			rewriteSectionType;
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
		if (action === "cover-letter") {
			openCoverLetterDialog();
			return;
		}
		if (action === "match-job") {
			openMatchJobDialog();
			return;
		}
	};

	const closeCoverLetterDialog = () => {
		if (coverLetterMutation.isPending) return;
		setVisibleCoverLetter(false);
		setCoverLetterResult(null);
	};

	const openCoverLetterDialog = () => {
		setCoverLetterResult(null);
		setVisibleCoverLetter(true);
	};

	const reopenCoverLetterResult = (coverLetter: CvCoverLetter) => {
		setCoverLetterResult(coverLetter);
		setVisibleCoverLetter(true);
	};

	const closeMatchJobDialog = () => {
		if (matchJobMutation.isPending) return;
		setVisibleMatchJob(false);
		setMatchJobResult(null);
	};

	const openMatchJobDialog = () => {
		setMatchJobResult(null);
		setVisibleMatchJob(true);
	};

	const reopenMatchJobResult = (match: CvMatchJob) => {
		setMatchJobResult(match);
		setVisibleMatchJob(true);
	};

	const reopenMatchRomeFicheResult = (match: CvMatchJob) => {
		setMatchRomeFicheResult(match);
		setVisibleFicheMetier(true);
	};

	const onCompareCvToRomeFiche = (fiche: RomeFicheDto) => {
		if (status !== "authenticated") {
			toast.current?.show({
				severity: "warn",
				summary: "Connexion requise",
				detail: "Connectez-vous pour comparer votre CV à la fiche métier.",
				life: 4000,
			});
			return;
		}
		const cvText = flattenCvFormToText(getValues() as CvFormValues);
		if (!cvText.trim()) {
			toast.current?.show({
				severity: "warn",
				summary: "CV vide",
				detail: "Ajoutez du contenu avant de comparer à une fiche métier.",
				life: 4000,
			});
			return;
		}
		setMatchRomeFicheResult(null);
		setPaymentDialog({
			feature: "MATCH_ROME_FICHE",
			title: "Payer la comparaison fiche métier",
			pending: {
				kind: "match-rome-fiche",
				cvText,
				ficheText: formatRomeFicheForPrompt(fiche),
				codeRome: fiche.codeRome,
				libelleRome: fiche.libelle,
			},
		});
	};

	const onGenerateCoverLetter = (values: CoverLetterFormValues) => {
		if (status !== "authenticated") {
			toast.current?.show({
				severity: "error",
				summary: "Connexion requise",
				detail: "Connectez-vous pour générer une lettre de motivation.",
				life: 4000,
			});
			return;
		}
		const cvText = flattenCvFormToText(getValues() as CvFormValues);
		if (!cvText.trim()) {
			toast.current?.show({
				severity: "warn",
				summary: "CV vide",
				detail: "Ajoutez du contenu avant de générer une lettre.",
				life: 4000,
			});
			return;
		}
		const companyName = values.companyName.trim() || undefined;
		const jobTitle = values.jobTitle.trim() || undefined;
		const jobOffer = values.jobOffer.trim() || undefined;
		setVisibleCoverLetter(false);
		setPaymentDialog({
			feature: "COVER_LETTER",
			title: "Payer la lettre de motivation",
			pending: {
				kind: "cover-letter",
				cvText,
				...(companyName ? { companyName } : {}),
				...(jobTitle ? { jobTitle } : {}),
				...(jobOffer ? { jobOffer } : {}),
			},
		});
	};

	const onGenerateMatchJob = (values: MatchJobFormValues) => {
		if (status !== "authenticated") {
			toast.current?.show({
				severity: "error",
				summary: "Connexion requise",
				detail: "Connectez-vous pour comparer votre CV à une annonce.",
				life: 4000,
			});
			return;
		}
		const jobOffer = values.jobOffer.trim();
		if (!jobOffer) {
			toast.current?.show({
				severity: "warn",
				summary: "Annonce manquante",
				detail: "Colle le texte de l’annonce pour lancer la comparaison.",
				life: 4000,
			});
			return;
		}
		const cvText = flattenCvFormToText(getValues() as CvFormValues);
		if (!cvText.trim()) {
			toast.current?.show({
				severity: "warn",
				summary: "CV vide",
				detail: "Ajoutez du contenu avant de comparer à une annonce.",
				life: 4000,
			});
			return;
		}
		const companyName = values.companyName.trim() || undefined;
		const jobTitle = values.jobTitle.trim() || undefined;
		setVisibleMatchJob(false);
		setPaymentDialog({
			feature: "MATCH_JOB",
			title: "Payer la comparaison",
			pending: {
				kind: "match-job",
				cvText,
				jobOffer,
				...(companyName ? { companyName } : {}),
				...(jobTitle ? { jobTitle } : {}),
			},
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
					dailyLimitReached={downloadStatus?.dailyLimitReached ?? false}
					premiumLocked={premiumLocked}
					unlockPriceCredits={unlockPricing.priceCredits}
					unlockPriceCents={unlockPricing.priceCents}
					loading={
						consumeFreeDownloadMutation.isPending ||
						consumePaidDownloadMutation.isPending ||
						unlockTemplateMutation.isPending
					}
					onDownloadFree={() => {
						requestDownload("free");
					}}
					onDownloadPaid={() => {
						requestDownload("paid");
					}}
					onUnlockWithCredits={() => {
						void onUnlockWithCredits();
					}}
					onUnlockWithStripe={onUnlockWithStripe}
					signatureVariant={signatureVariant}
					onSignatureVariantChange={(variant) => {
						void changeSignatureVariant(variant);
					}}
					onAdjust={() => setVisibleAssistantIa(true)}
				/>
				<DialogRecentDownloadWarn
					visible={pendingRecentDownload != null}
					kind={pendingRecentDownload}
					loading={consumeFreeDownloadMutation.isPending || consumePaidDownloadMutation.isPending}
					onHide={() => setPendingRecentDownload(null)}
					onConfirm={confirmRecentDownload}
				/>
				<DialogAssistantIa
					visible={visibleAssistantIa}
					onHide={() => setVisibleAssistantIa(false)}
					onSelectAction={onSelectAiAction}
				/>
				<DialogCvTips visible={visibleTips} onHide={() => setVisibleTips(false)} />
				<DialogCvOnboarding
					visible={visibleOnboarding}
					onHide={() => setVisibleOnboarding(false)}
					onDismissPermanently={() => {
						updateUserProfileMutation.mutate({ hideCvOnboarding: true });
					}}
				/>
				<DialogAiPayment
					visible={!!paymentDialog}
					onHide={() => {
						if (
							reviewCvMutation.isPending ||
							rewriteSectionMutation.isPending ||
							coverLetterMutation.isPending ||
							matchJobMutation.isPending ||
							matchRomeFicheMutation.isPending
						) {
							return;
						}
						setPaymentDialog(null);
					}}
					title={paymentDialog?.title ?? "Payer l’action IA"}
					options={billingOptionsQuery.data}
					loading={billingOptionsQuery.isFetching}
					confirming={
						reviewCvMutation.isPending ||
						rewriteSectionMutation.isPending ||
						coverLetterMutation.isPending ||
						matchJobMutation.isPending ||
						matchRomeFicheMutation.isPending
					}
					onConfirm={(choice) => {
						void executePaidAiAction(choice);
					}}
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
					sections={listRewriteableSections(getValues() as CvFormValues)}
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
				<DialogCoverLetter
					visible={visibleCoverLetter}
					loading={coverLetterMutation.isPending}
					result={coverLetterResult}
					onHide={closeCoverLetterDialog}
					onGenerate={onGenerateCoverLetter}
					onBackToForm={() => {
						setCoverLetterResult(null);
					}}
				/>
				<DialogMatchJob
					visible={visibleMatchJob}
					loading={matchJobMutation.isPending}
					result={matchJobResult}
					onHide={closeMatchJobDialog}
					onGenerate={onGenerateMatchJob}
					onBackToForm={() => {
						setMatchJobResult(null);
					}}
				/>
				<DialogFicheMetier
					visible={visibleFicheMetier}
					initialQuery={watchHeaderSubtitle}
					iaLoading={matchRomeFicheMutation.isPending}
					iaResult={matchRomeFicheResult}
					onHide={() => {
						if (matchRomeFicheMutation.isPending) return;
						setVisibleFicheMetier(false);
						setMatchRomeFicheResult(null);
					}}
					onCompareCv={onCompareCvToRomeFiche}
					onBackFromIa={() => {
						setMatchRomeFicheResult(null);
					}}
				/>
				{profile && (
					<DialogDataFromProfile
						visible={visibleDialogDataFromProfile}
						onHide={() => setVisibleDialogDataFromProfile(false)}
						profile={profile}
					/>
				)}
				<Tooltip target=".speeddial-bottom-right .p-speeddial-action" position="left" />
				<SpeedDial
					className="speeddial-bottom-right z-50"
					model={items}
					radius={180}
					type="quarter-circle"
					direction="down-left"
					style={{ position: "fixed", right: 10, top: 72, zIndex: 50 }}
				/>
				{/* Historique structurel — flottant à droite, sous le SpeedDial */}
				<div className="fixed z-50 flex flex-col gap-1" style={{ right: 10, top: 132 }}>
					<Button
						type="button"
						rounded
						text
						disabled={!canUndo}
						icon="pi pi-arrow-left"
						aria-label="Annuler"
						tooltip="Annuler (Ctrl+Z)"
						tooltipOptions={{ position: "left" }}
						onClick={undo}
						className="w-10 h-10 shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
					/>
					<Button
						type="button"
						rounded
						text
						disabled={!canRedo}
						icon="pi pi-arrow-right"
						aria-label="Rétablir"
						tooltip="Rétablir (Ctrl+Y)"
						tooltipOptions={{ position: "left" }}
						onClick={redo}
						className="w-10 h-10 shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
					/>
				</div>
				<div className="w-full">
					<div className="w-full flex gap-8 my-4">
						<div className="flex flex-col items-center gap-12 relative" style={{ width: cvWidth }}>
							<div className="w-full px-4 xl:px-0 flex justify-between items-center">
								<TitleAppOne firstPart="Atelier" secondPart="CV" withSpace />
							</div>
							<div
								id="modele-cv-page"
								style={{
									...getCvTypographyVars(typography),
									fontFamily: "var(--cv-font-body)",
								}}
								className="cv-root ml-0 lg:ml-4 xl:ml-0 flex flex-col gap-4 [overflow-anchor:none]"
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
								onReopenCoverLetter={reopenCoverLetterResult}
								onReopenMatchJob={reopenMatchJobResult}
								onReopenMatchRomeFiche={reopenMatchRomeFicheResult}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
};
