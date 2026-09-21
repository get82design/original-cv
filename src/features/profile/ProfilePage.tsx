import { AppCard } from "@/components/card/AppCard";
import { TitleAppOne } from "@/components/title/TitleAppOne";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import { useMediaQuery } from "@utils/useWindowWidth";
import { Button } from "primereact/button";
import { CompoPage, type CV } from "./CompoPage";
import { FormProfile } from "./form/FormProfile";
import { ProfileProvider } from "./contexte/ProfileContext";
import { trpc } from "@utils/trpc";
import { ProgressSpinner } from "primereact/progressspinner";
import { PreviewImage } from "./compo/common/PreviewImage";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { DialogDownloadCv } from "@/components/dialog/DialogDownloadCv";
import { DialogAssistantIa } from "@/components/dialog/DialogAssistantIa";
import { Toast } from "primereact/toast";
import { isTemplateLocked } from "../cv-editor/utils/isTemplateLocked";
import { useSession } from "next-auth/react";

export const ProfilePage = () => {
	const { data: cvs, isLoading } = trpc.cv.allByUser.useQuery();
	console.log("cvs", cvs);
	const { status } = useSession();
	const isLg = useMediaQuery("(min-width: 1024px)");
	const isMd = useMediaQuery("(min-width: 768px)");
	const isSm = useMediaQuery("(min-width: 640px)");
	const [downloadCv, setDownloadCv] = useState<CV | null>(null);
	const [visibleAssistantIa, setVisibleAssistantIa] = useState(false);
	const toast = useRef<Toast>(null);
	const utils = trpc.useUtils();
	const { data: downloadStatus } = trpc.user.getDownloadStatus.useQuery(
		undefined,
		{ enabled: downloadCv != null },
	);
	const unlockedQuery = trpc.unlockedTemplate.findAll.useQuery(undefined, {
		enabled: status === "authenticated" && downloadCv != null,
	});
	const unlockedIds = useMemo(
		() => new Set((unlockedQuery.data ?? []).map((u) => u.templateId)),
		[unlockedQuery.data],
	);
	const premiumLocked = useMemo(() => {
		if (!downloadCv?.templateId || !downloadCv.template?.isPremium) {
			return false;
		}
		return isTemplateLocked(
			{
				id: downloadCv.templateId,
				isPremium: downloadCv.template.isPremium,
			},
			unlockedIds,
		);
	}, [downloadCv, unlockedIds]);
	const consumeFreeDownloadMutation = trpc.user.consumeFreeDownload.useMutation();
	const consumePaidDownloadMutation = trpc.user.consumePaidDownload.useMutation();
	const unlockTemplateMutation = trpc.unlockedTemplate.unlock.useMutation();

	const downloadPreviewWithLogo = downloadCv
		? (downloadCv.previewUrl ??
			(downloadCv.template?.name
				? `/assets/img/${downloadCv.template.name}.png`
				: null))
		: null;
	const downloadPreviewWithoutLogo =
		downloadCv?.previewUrlClean ?? downloadPreviewWithLogo;

	const downloadMeta = () => {
		if (!downloadCv) return {};
		return {
			cvId: downloadCv.id,
			...(downloadCv.templateId
				? { templateId: downloadCv.templateId }
				: {}),
		};
	};

	const onDownloadFree = async () => {
		try {
			await consumeFreeDownloadMutation.mutateAsync(downloadMeta());
			await utils.user.getDownloadStatus.invalidate();
			toast.current?.show({
				severity: "success",
				summary: "Téléchargement enregistré",
				detail: "1 export avec logo consommé (PDF bientôt).",
				life: 3500,
			});
			setDownloadCv(null);
		} catch (err) {
			toast.current?.show({
				severity: "error",
				summary: "Export impossible",
				detail:
					err instanceof Error
						? err.message
						: "Une erreur est survenue.",
				life: 5000,
			});
		}
	};

	const onDownloadPaid = async () => {
		try {
			await consumePaidDownloadMutation.mutateAsync(downloadMeta());
			await utils.user.getDownloadStatus.invalidate();
			toast.current?.show({
				severity: "success",
				summary: "Téléchargement enregistré",
				detail: "1 crédit sans logo consommé (PDF bientôt).",
				life: 3500,
			});
			setDownloadCv(null);
		} catch (err) {
			toast.current?.show({
				severity: "error",
				summary: "Export impossible",
				detail:
					err instanceof Error
						? err.message
						: "Une erreur est survenue.",
				life: 5000,
			});
		}
	};

	const onUnlockWithCredits = async () => {
		const templateId = downloadCv?.templateId;
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
				detail:
					err instanceof Error
						? err.message
						: "Une erreur est survenue.",
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

	return (
		<FormProfile>
			<Toast ref={toast} position="top-center" />
			<DialogDownloadCv
				visible={downloadCv != null}
				onHide={() => setDownloadCv(null)}
				title={downloadCv?.title || "Votre CV"}
				previewUrlWithLogo={downloadPreviewWithLogo}
				previewUrlWithoutLogo={downloadPreviewWithoutLogo}
				freeDownloadsRemaining={downloadStatus?.freeDownloadsRemaining ?? 0}
				downloadCredits={downloadStatus?.downloadCredits ?? 0}
				premiumLocked={premiumLocked}
				unlockPriceCredits={downloadCv?.template?.priceCredits ?? null}
				unlockPriceCents={downloadCv?.template?.priceCents ?? null}
				loading={
					consumeFreeDownloadMutation.isPending ||
					consumePaidDownloadMutation.isPending ||
					unlockTemplateMutation.isPending
				}
				onDownloadFree={() => {
					void onDownloadFree();
				}}
				onDownloadPaid={() => {
					void onDownloadPaid();
				}}
				onUnlockWithCredits={() => {
					void onUnlockWithCredits();
				}}
				onUnlockWithStripe={onUnlockWithStripe}
				onAdjust={() => setVisibleAssistantIa(true)}
			/>
			<DialogAssistantIa
				visible={visibleAssistantIa}
				onHide={() => setVisibleAssistantIa(false)}
			/>
			<div
				className={"w-full p-4 md:p-8 relative"}
				style={{ /*...ClassikAppColor(),*/ minHeight: "calc(100vh - 70px)" }}
			>
				<div className="w-full flex flex-col-reverse lg:flex-row lg:justify-end gap-6">
					<div
						className="w-full hidden sm:flex flex-col gap-6"
						style={{ minHeight: "calc(100vh - 130px)" }}
					>
						<div className="w-full hidden lg:flex justify-between items-center relative">
							<TitleAppOne firstPart="DASH" secondPart="BOARD" />
						</div>
						<ProfileProvider>
							<CompoPage cvs={cvs ?? []} /*nbCv={nbCv} cv={cv}*/ />
						</ProfileProvider>
					</div>
					<div
						style={{ height: !isLg ? "" : "calc(100vh - 130px)" }}
						className="w-full lg:w-96 flex flex-col gap-4 lg:contents"
					>
						<div className="w-full lg:hidden">
							<TitleAppOne
								firstPart="DASH"
								secondPart="BOARD"
								classNameSize="text-3xl"
							/>
						</div>
						<div
							style={{
								minHeight: !isLg ? "" : "calc(100vh - 130px)",
								width: !isLg ? "100%" : "384px",
							}}
						>
							<AppCard className={"min-h-full flex flex-col gap-4"}>
								<TitleAppTwo
									firstPart={"Vos"}
									secondPart={"CVs"}
									size={"text-2xl"}
									withSpace
								/>
								{isLoading ? (
									<ProgressSpinner
										style={{ width: "50px", height: "50px" }}
										strokeWidth="8"
										fill="var(--surface-ground)"
										animationDuration=".5s"
									/>
								) : (
									<>
										<p>
											Vous avez enregistré {cvs?.length} CV
											{cvs?.length && cvs?.length > 1 ? "s" : ""}
										</p>
										<div className="flex w-full justify-center gap-2">
											{cvs &&
												cvs.length > 0 &&
												cvs.map((cv) => {
													return (
														<div
															key={cv?.id}
															className="w-full flex flex-col items-center gap-4"
														>
															<PreviewImage
																width={!isMd ? "w-full p-2" : "w-2/3"}
																cv={cv}
																action={
																	<>
																		{isMd && (
																			<Button
																				size="small"
																				onClick={() => setDownloadCv(cv)}
																			>
																				Visionner
																			</Button>
																		)}
																		{isMd && (
																			<Link href={`/cv/${cv?.id}`}>
																				<Button size="small">Modifier</Button>
																			</Link>
																		)}
																	</>
																}
															/>
															{isSm && (
																<div className="w-full flex justify-center">
																	<Button
																		onClick={(e) => {
																			e.preventDefault();
																		}}
																	>
																		Récupérer les données du CV
																	</Button>
																</div>
															)}
														</div>
													);
												})}
										</div>
									</>
								)}
							</AppCard>
						</div>
					</div>
				</div>
			</div>
		</FormProfile>
	);
};
