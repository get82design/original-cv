import Image from "next/image";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import {
	CV_SIGNATURE_VARIANTS,
	type CvSignatureVariantId,
} from "@/features/cv-editor/utils/cvSignatureVariants";

export type DownloadCvMode = "free" | "paid";

/** Vignette schématique d'une variante — dessinée, pas capturée (ouverture de modale rapide). */
const SignatureVariantThumb = ({ id }: { id: CvSignatureVariantId }) => (
	<span className="relative block h-14 w-10 overflow-hidden rounded-sm border border-zinc-300 bg-white dark:border-zinc-500">
		<span className="absolute left-1.5 right-4 top-2 h-1 rounded-full bg-zinc-300" />
		<span className="absolute left-1.5 right-2 top-4 h-0.5 rounded-full bg-zinc-200" />
		<span className="absolute left-1.5 right-3 top-6 h-0.5 rounded-full bg-zinc-200" />
		{id === "band" && <span className="absolute inset-x-0 bottom-0 h-3.5 bg-primary/30" />}
		{id === "corners" && (
			<svg
				className="absolute inset-x-0 bottom-0 w-full"
				height="10"
				viewBox="0 0 100 32"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				<polygon points="0,32 0,0 34,32" style={{ fill: "var(--primary-color)" }} />
				<polygon
					points="100,32 100,0 62,32"
					style={{ fill: "var(--primary-color)", fillOpacity: 0.4 }}
				/>
			</svg>
		)}
		<span
			className={`absolute right-1 h-1.5 w-2.5 rounded-sm bg-primary ${
				id === "corners" ? "bottom-3" : "bottom-1"
			}`}
		/>
	</span>
);

export interface DialogDownloadCvProps {
	visible: boolean;
	onHide: () => void;
	/** Preview avec logo (export gratuit) */
	previewUrlWithLogo?: string | null;
	/** Preview sans logo (export payant) */
	previewUrlWithoutLogo?: string | null;
	previewLoading?: boolean;
	title?: string;
	freeDownloadsRemaining?: number;
	downloadCredits?: number;
	loading?: boolean;
	/** Modèle premium non débloqué — export bloqué */
	premiumLocked?: boolean;
	/** Prix unlock en crédits (catalogue) */
	unlockPriceCredits?: number | null;
	/** Prix unlock en centimes (catalogue) — Stripe plus tard */
	unlockPriceCents?: number | null;
	onUnlockWithCredits?: () => void;
	/** Placeholder Stripe — pas encore branché */
	onUnlockWithStripe?: () => void;
	/** Habillage de la signature (export gratuit) — sélecteur masqué si non fourni */
	signatureVariant?: CvSignatureVariantId;
	onSignatureVariantChange?: (variant: CvSignatureVariantId) => void;
	/** Visuel only pour l’instant — callbacks stubs OK */
	onDownloadFree?: () => void;
	onDownloadPaid?: () => void;
	onBuyCredits?: () => void;
	/** Ouvre l’assistant IA pour peaufiner avant export */
	onAdjust?: () => void;
}

function formatEuros(cents: number) {
	return new Intl.NumberFormat("fr-FR", {
		style: "currency",
		currency: "EUR",
	}).format(cents / 100);
}

export const DialogDownloadCv = ({
	visible,
	onHide,
	previewUrlWithLogo = null,
	previewUrlWithoutLogo = null,
	previewLoading = false,
	title = "Votre CV",
	freeDownloadsRemaining = 0,
	downloadCredits = 0,
	loading = false,
	premiumLocked = false,
	unlockPriceCredits = null,
	unlockPriceCents = null,
	onUnlockWithCredits,
	onUnlockWithStripe,
	signatureVariant = "minimal",
	onSignatureVariantChange,
	onDownloadFree,
	onDownloadPaid,
	onBuyCredits,
	onAdjust,
}: DialogDownloadCvProps) => {
	const [mode, setMode] = useState<DownloadCvMode | null>(null);
	const selectedVariant = CV_SIGNATURE_VARIANTS.find((v) => v.id === signatureVariant);
	const canFree = freeDownloadsRemaining > 0 && !premiumLocked;
	const canPaid = downloadCredits > 0 && !premiumLocked;

	const canUnlockCredits =
		unlockPriceCredits != null && unlockPriceCredits > 0 && downloadCredits >= unlockPriceCredits;
	const hasCreditsPrice = unlockPriceCredits != null && unlockPriceCredits > 0;
	const hasEuroPrice = unlockPriceCents != null && unlockPriceCents > 0;

	const previewUrl =
		mode === "paid"
			? (previewUrlWithoutLogo ?? previewUrlWithLogo)
			: (previewUrlWithLogo ?? previewUrlWithoutLogo);

	const handleHide = () => {
		setMode(null);
		onHide();
	};

	const handleAdjust = () => {
		handleHide();
		onAdjust?.();
	};

	const handleConfirm = () => {
		if (mode === "free") onDownloadFree?.();
		if (mode === "paid") onDownloadPaid?.();
	};

	const confirmDisabled =
		loading ||
		premiumLocked ||
		!mode ||
		(mode === "free" && !canFree) ||
		(mode === "paid" && !canPaid);

	const footer = (
		<div className="flex w-full flex-wrap items-center justify-between gap-2">
			<div>
				{onAdjust && (
					<Button
						type="button"
						label="Ajustements IA"
						text
						onClick={handleAdjust}
						disabled={loading}
						className="!text-zinc-600 dark:!text-zinc-300 hover:!bg-zinc-100 dark:hover:!bg-zinc-800"
					/>
				)}
			</div>
			<div className="flex flex-wrap justify-end gap-2">
				<Button
					type="button"
					label="Annuler"
					outlined
					onClick={handleHide}
					disabled={loading}
					className="!text-zinc-600 dark:!text-zinc-300 !border-zinc-300 dark:!border-zinc-600 hover:!bg-zinc-100 dark:hover:!bg-zinc-800"
				/>
				{!premiumLocked && !canPaid && (
					<Button
						type="button"
						label="Acheter des crédits"
						outlined
						onClick={onBuyCredits}
						disabled={loading}
						className="!border-primary !text-primary dark:!border-primary-dark dark:!text-primary-dark"
					/>
				)}
				{!premiumLocked ? (
					<Button
						type="button"
						label={
							mode === "free"
								? "Télécharger avec logo"
								: mode === "paid"
									? "Télécharger sans logo"
									: "Choisir une option"
						}
						disabled={confirmDisabled}
						loading={loading}
						onClick={handleConfirm}
						className="bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
					/>
				) : null}
			</div>
		</div>
	);

	return (
		<Dialog
			visible={visible}
			onHide={handleHide}
			header="Télécharger votre CV"
			style={{ width: "920px", maxWidth: "94vw" }}
			className="dialog-download-cv"
			footer={footer}
			closable={!loading}
		>
			<div className="flex flex-col gap-5 p-2 text-zinc-900 dark:text-zinc-100 lg:flex-row lg:gap-6">
				{/* Aperçu */}
				<div className="flex flex-col gap-2 lg:w-[42%] shrink-0">
					<p className="m-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
						Aperçu
					</p>
					<div className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900">
						{previewUrl ? (
							// <img
							// 	src={previewUrl}
							// 	alt={title}
							// 	className="block w-full aspect-[1/1.414] object-cover object-top"
							// />
							<Image
								src={previewUrl}
								alt={title}
								width={794} // ~A4 à 96dpi en largeur
								height={1123} // 794 × 1.414
								className="block w-full aspect-[1/1.414] object-cover object-top"
								unoptimized // si blob: / data URL
							/>
						) : null}
						{previewUrl && previewLoading ? (
							// Recapture après changement d'habillage : on garde l'aperçu sous le voile.
							<div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-zinc-900/60">
								<i className="pi pi-spin pi-spinner text-2xl text-primary dark:text-primary-dark" />
							</div>
						) : null}
						{!previewUrl ? (
							<div className="flex aspect-[1/1.414] w-full flex-col items-center justify-center gap-2 px-6 text-center">
								{previewLoading ? (
									<>
										<i className="pi pi-spin pi-spinner text-2xl text-primary dark:text-primary-dark" />
										<p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">
											Génération de l’aperçu…
										</p>
									</>
								) : (
									<>
										<p className="m-0 text-sm font-medium text-zinc-600 dark:text-zinc-300">
											{title}
										</p>
										<p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">
											Aperçu indisponible pour le moment.
										</p>
									</>
								)}
							</div>
						) : null}
					</div>
				</div>

				{/* Choix */}
				<div className="flex min-w-0 flex-1 flex-col gap-3">
					{premiumLocked ? (
						<>
							<div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-3 text-sm text-amber-800 dark:text-amber-200">
								<p className="m-0 font-semibold">Modèle premium</p>
								<p className="m-0 mt-1 text-xs leading-relaxed opacity-90">
									Vous pouvez éditer ce CV librement. Débloquez le modèle pour télécharger l’export.
								</p>
							</div>

							{hasCreditsPrice ? (
								<div className="rounded-lg border border-zinc-200 bg-white px-3.5 py-3 dark:border-zinc-700 dark:bg-zinc-900">
									<p className="m-0 text-sm font-semibold">Débloquer avec des crédits</p>
									<p className="m-0 mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
										{unlockPriceCredits} crédit
										{(unlockPriceCredits ?? 0) > 1 ? "s" : ""} — vous en avez {downloadCredits}.
									</p>
									<Button
										type="button"
										label={
											canUnlockCredits
												? `Débloquer (${unlockPriceCredits} cr.)`
												: "Crédits insuffisants"
										}
										className="mt-3 w-full bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
										disabled={loading || !canUnlockCredits}
										loading={loading}
										onClick={onUnlockWithCredits}
									/>
									{!canUnlockCredits && onBuyCredits ? (
										<Button
											type="button"
											label="Acheter des crédits"
											outlined
											className="mt-2 w-full !border-primary !text-primary dark:!border-primary-dark dark:!text-primary-dark"
											disabled={loading}
											onClick={onBuyCredits}
										/>
									) : null}
								</div>
							) : null}

							{hasEuroPrice ? (
								<div className="rounded-lg border border-zinc-200 bg-white px-3.5 py-3 dark:border-zinc-700 dark:bg-zinc-900">
									<p className="m-0 text-sm font-semibold">Payer en euros</p>
									<p className="m-0 mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
										{formatEuros(unlockPriceCents!)} — paiement sécurisé (bientôt).
									</p>
									<Button
										type="button"
										label={`Payer ${formatEuros(unlockPriceCents!)}`}
										outlined
										className="mt-3 w-full"
										disabled={loading}
										onClick={onUnlockWithStripe}
									/>
								</div>
							) : null}

							{!hasCreditsPrice && !hasEuroPrice ? (
								<p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">
									Aucun tarif de déblocage configuré pour ce modèle.
								</p>
							) : null}
						</>
					) : (
						<>
							<p className="m-0 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
								Deux formats d’export : gratuit avec la signature OriginalCV, ou sans logo en
								consommant un crédit.
							</p>

							<button
								type="button"
								disabled={loading}
								onClick={() => setMode("free")}
								className={`w-full rounded-lg border px-3.5 py-3 text-left transition-colors ${
									mode === "free"
										? "border-primary bg-primary/10 dark:border-primary-dark dark:bg-primary-dark/15"
										: "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500"
								}`}
							>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<p className="m-0 text-sm font-semibold">Gratuit — avec logo</p>
										<p className="m-0 mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
											Export PDF/JPEG avec la signature OriginalCV en bas de page. Idéal pour tester
											ou partager rapidement.
										</p>
										<p className="m-0 mt-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
											{canFree
												? `${freeDownloadsRemaining} téléchargement${freeDownloadsRemaining > 1 ? "s" : ""} gratuit${freeDownloadsRemaining > 1 ? "s" : ""} restant${freeDownloadsRemaining > 1 ? "s" : ""}`
												: "Aucun téléchargement gratuit disponible"}
										</p>
									</div>
									<span
										className={`mt-1 size-3.5 shrink-0 rounded-full border ${
											mode === "free"
												? "border-primary bg-primary dark:border-primary-dark dark:bg-primary-dark"
												: "border-zinc-300 dark:border-zinc-600"
										}`}
										aria-hidden
									/>
								</div>
							</button>

							<button
								type="button"
								disabled={loading}
								onClick={() => setMode("paid")}
								className={`w-full rounded-lg border px-3.5 py-3 text-left transition-colors ${
									mode === "paid"
										? "border-primary bg-primary/10 dark:border-primary-dark dark:bg-primary-dark/15"
										: "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500"
								}`}
							>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<p className="m-0 text-sm font-semibold">Sans logo — 1 crédit</p>
										<p className="m-0 mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
											Version propre, sans signature, prête pour un envoi recruteur.
										</p>
										<p className="m-0 mt-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
											{canPaid
												? `${downloadCredits} crédit${downloadCredits > 1 ? "s" : ""} disponible${downloadCredits > 1 ? "s" : ""}`
												: "Aucun crédit disponible"}
										</p>
									</div>
									<span
										className={`mt-1 size-3.5 shrink-0 rounded-full border ${
											mode === "paid"
												? "border-primary bg-primary dark:border-primary-dark dark:bg-primary-dark"
												: "border-zinc-300 dark:border-zinc-600"
										}`}
										aria-hidden
									/>
								</div>
							</button>

							{mode === "free" && onSignatureVariantChange && (
								<div className="rounded-lg border border-zinc-200 bg-white px-3.5 py-3 dark:border-zinc-700 dark:bg-zinc-900">
									<p className="m-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
										Habillage de la signature
									</p>
									<div className="mt-2.5 flex gap-2">
										{CV_SIGNATURE_VARIANTS.map((variant) => {
											const selected = variant.id === signatureVariant;
											return (
												<button
													key={variant.id}
													type="button"
													disabled={loading}
													onClick={() => onSignatureVariantChange(variant.id)}
													aria-pressed={selected}
													className={`rounded-lg border px-2.5 py-2 text-center transition-colors ${
														selected
															? "border-primary bg-primary/10 dark:border-primary-dark dark:bg-primary-dark/15"
															: "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-500"
													}`}
												>
													<SignatureVariantThumb id={variant.id} />
													<span className="mt-1.5 block text-[11px] font-medium">
														{variant.label}
													</span>
												</button>
											);
										})}
									</div>
									{selectedVariant && (
										<p className="m-0 mt-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
											{selectedVariant.description}
										</p>
									)}
								</div>
							)}

							{mode === "free" && !canFree && (
								<p className="m-0 text-xs text-amber-700 dark:text-amber-300">
									Plus de téléchargements gratuits. Choisissez l’export sans logo ou obtenez un
									crédit.
								</p>
							)}
							{mode === "paid" && !canPaid && (
								<p className="m-0 text-xs text-amber-700 dark:text-amber-300">
									Pas de crédit pour l’instant. Vous pouvez en acheter, ou utiliser un export
									gratuit s’il vous en reste.
								</p>
							)}
						</>
					)}
				</div>
			</div>
		</Dialog>
	);
};
