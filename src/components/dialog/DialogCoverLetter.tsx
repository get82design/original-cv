import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useEffect, useState } from "react";
import type { CvCoverLetter } from "@/services/schemas/cvCoverLetter.schema";

export type CoverLetterFormValues = {
	companyName: string;
	jobTitle: string;
	jobOffer: string;
};

type Step = "form" | "loading" | "result";

interface DialogCoverLetterProps {
	visible: boolean;
	loading?: boolean;
	result: CvCoverLetter | null;
	onHide: () => void;
	/** Ouvre le dialog de paiement avec le ciblage saisi (champs optionnels). */
	onGenerate: (values: CoverLetterFormValues) => void;
	/** Repart du formulaire (garde le résultat effacé côté parent). */
	onBackToForm: () => void;
}

const EMPTY_FORM: CoverLetterFormValues = {
	companyName: "",
	jobTitle: "",
	jobOffer: "",
};

/**
 * Lettre de motivation : ciblage optionnel → loading → résultat + Copier.
 */
export const DialogCoverLetter = ({
	visible,
	loading = false,
	result,
	onHide,
	onGenerate,
	onBackToForm,
}: DialogCoverLetterProps) => {
	const [form, setForm] = useState<CoverLetterFormValues>(EMPTY_FORM);
	const [copied, setCopied] = useState(false);

	const step: Step = loading ? "loading" : result ? "result" : "form";

	useEffect(() => {
		if (!visible) {
			setForm(EMPTY_FORM);
			setCopied(false);
		}
	}, [visible]);

	const handleHide = () => {
		if (loading) return;
		onHide();
	};

	const handleCopy = async () => {
		if (!result?.letter) return;
		try {
			await navigator.clipboard.writeText(result.letter);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
		}
	};

	const footer =
		step === "result" ? (
			<div className="flex flex-wrap justify-end gap-2">
				<Button
					type="button"
					label="Nouvelle lettre"
					outlined
					onClick={() => {
						setCopied(false);
						onBackToForm();
					}}
					className="!text-zinc-600 dark:!text-zinc-300 !border-zinc-300 dark:!border-zinc-600"
				/>
				<Button
					type="button"
					label={copied ? "Copié" : "Copier"}
					icon={copied ? "pi pi-check" : "pi pi-copy"}
					onClick={() => {
						void handleCopy();
					}}
					className="bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
				/>
			</div>
		) : step === "form" ? (
			<div className="flex flex-wrap justify-end gap-2">
				<Button
					type="button"
					label="Fermer"
					outlined
					onClick={handleHide}
					className="!text-zinc-600 dark:!text-zinc-300 !border-zinc-300 dark:!border-zinc-600"
				/>
				<Button
					type="button"
					label="Générer"
					icon="pi pi-sparkles"
					onClick={() => onGenerate(form)}
					className="bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
				/>
			</div>
		) : null;

	return (
		<Dialog
			visible={visible}
			onHide={handleHide}
			header="Lettre de motivation"
			style={{ width: "40rem", maxWidth: "94vw" }}
			className="dialog-cover-letter"
			footer={footer}
			closable={!loading}
		>
			<div className="flex max-h-[min(70vh,32rem)] flex-col gap-3 overflow-y-auto p-1 text-zinc-900 dark:text-zinc-100">
				{step === "loading" ? (
					<p className="m-0 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
						<span className="pi pi-spin pi-spinner" aria-hidden />
						Rédaction de la lettre en cours…
					</p>
				) : step === "result" && result ? (
					<>
						{result.subject ? (
							<section className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/60">
								<p className="m-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
									Objet
								</p>
								<p className="m-0 mt-1 text-sm font-medium">{result.subject}</p>
							</section>
						) : null}
						<section className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/60">
							<p className="m-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
								Lettre
							</p>
							<p className="m-0 mt-1 whitespace-pre-wrap text-sm leading-relaxed">{result.letter}</p>
						</section>
					</>
				) : (
					<>
						<p className="m-0 text-sm text-zinc-600 dark:text-zinc-400">
							Tous les champs sont optionnels. Sans ciblage, la lettre s’appuie uniquement sur ton
							CV.
						</p>
						<label className="flex flex-col gap-1" htmlFor="cover-letter-company">
							<span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
								Entreprise
							</span>
							<InputText
								id="cover-letter-company"
								value={form.companyName}
								onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
								maxLength={120}
								placeholder="Ex. Acme"
								className="w-full"
							/>
						</label>
						<label className="flex flex-col gap-1" htmlFor="cover-letter-job-title">
							<span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
								Intitulé du poste
							</span>
							<InputText
								id="cover-letter-job-title"
								value={form.jobTitle}
								onChange={(e) => setForm((prev) => ({ ...prev, jobTitle: e.target.value }))}
								maxLength={120}
								placeholder="Ex. Développeur full-stack"
								className="w-full"
							/>
						</label>
						<label className="flex flex-col gap-1" htmlFor="cover-letter-job-offer">
							<span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
								Extrait d’annonce
							</span>
							<InputTextarea
								id="cover-letter-job-offer"
								value={form.jobOffer}
								onChange={(e) => setForm((prev) => ({ ...prev, jobOffer: e.target.value }))}
								rows={5}
								autoResize
								maxLength={10_000}
								placeholder="Colle un extrait de l’offre (missions, compétences…)"
								className="w-full"
							/>
						</label>
					</>
				)}
			</div>
		</Dialog>
	);
};
