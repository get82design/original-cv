import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useEffect, useState } from "react";
import type { CvMatchJob } from "@/services/schemas/cvMatchJob.schema";

export type MatchJobFormValues = {
	companyName: string;
	jobTitle: string;
	jobOffer: string;
};

type Step = "form" | "loading" | "result";

interface DialogMatchJobProps {
	visible: boolean;
	loading?: boolean;
	result: CvMatchJob | null;
	onHide: () => void;
	/** Ouvre le dialog de paiement avec le ciblage saisi (annonce requise). */
	onGenerate: (values: MatchJobFormValues) => void;
	/** Repart du formulaire (garde le résultat effacé côté parent). */
	onBackToForm: () => void;
}

const EMPTY_FORM: MatchJobFormValues = {
	companyName: "",
	jobTitle: "",
	jobOffer: "",
};

const priorityLabel: Record<string, string> = {
	haute: "Haute",
	moyenne: "Moyenne",
	basse: "Basse",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="flex flex-col gap-1.5">
			<p className="m-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
				{title}
			</p>
			<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/60">
				{children}
			</div>
		</section>
	);
}

/**
 * Comparaison CV ↔ annonce : formulaire (annonce requise) → loading → résultat.
 */
export const DialogMatchJob = ({
	visible,
	loading = false,
	result,
	onHide,
	onGenerate,
	onBackToForm,
}: DialogMatchJobProps) => {
	const [form, setForm] = useState<MatchJobFormValues>(EMPTY_FORM);
	const [formError, setFormError] = useState<string | null>(null);

	const step: Step = loading ? "loading" : result ? "result" : "form";

	useEffect(() => {
		if (!visible) {
			setForm(EMPTY_FORM);
			setFormError(null);
		}
	}, [visible]);

	const handleHide = () => {
		if (loading) return;
		onHide();
	};

	const handleGenerate = () => {
		if (!form.jobOffer.trim()) {
			setFormError("Colle le texte de l’annonce pour lancer la comparaison.");
			return;
		}
		setFormError(null);
		onGenerate(form);
	};

	const footer =
		step === "result" ? (
			<div className="flex flex-wrap justify-end gap-2">
				<Button
					type="button"
					label="Nouvelle comparaison"
					outlined
					onClick={() => {
						onBackToForm();
					}}
					className="!text-zinc-600 dark:!text-zinc-300 !border-zinc-300 dark:!border-zinc-600"
				/>
				<Button
					type="button"
					label="Fermer"
					onClick={handleHide}
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
					label="Comparer"
					icon="pi pi-sparkles"
					onClick={handleGenerate}
					className="bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
				/>
			</div>
		) : null;

	return (
		<Dialog
			visible={visible}
			onHide={handleHide}
			header="Comparer à une annonce"
			style={{ width: "40rem", maxWidth: "94vw" }}
			className="dialog-match-job"
			footer={footer}
			closable={!loading}
		>
			<div className="flex max-h-[min(70vh,32rem)] flex-col gap-3 overflow-y-auto p-1 text-zinc-900 dark:text-zinc-100">
				{step === "loading" ? (
					<p className="m-0 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
						<span className="pi pi-spin pi-spinner" aria-hidden />
						Analyse d’adéquation en cours…
					</p>
				) : step === "result" && result ? (
					<>
						{typeof result.score === "number" ? (
							<p className="m-0 text-sm">
								<span className="font-semibold">Adéquation : </span>
								{result.score}
								<span className="text-zinc-500 dark:text-zinc-400"> / 10</span>
							</p>
						) : null}

						<Section title="Synthèse">
							<p className="m-0 whitespace-pre-wrap text-sm leading-relaxed">{result.summary}</p>
						</Section>

						{result.matched.length > 0 ? (
							<Section title="Points qui collent">
								<ul className="m-0 list-disc space-y-1 pl-4 text-sm">
									{result.matched.map((s) => (
										<li key={s}>{s}</li>
									))}
								</ul>
							</Section>
						) : null}

						{result.gaps.length > 0 ? (
							<Section title="Écarts / manques">
								<ul className="m-0 flex list-none flex-col gap-2.5 p-0">
									{result.gaps.map((item) => (
										<li key={item.area + item.suggestion} className="text-sm">
											<p className="m-0 font-semibold">
												{item.area}
												{item.priority ? (
													<span className="ml-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
														{priorityLabel[item.priority] ?? item.priority}
													</span>
												) : null}
											</p>
											<p className="m-0 mt-0.5 text-zinc-700 dark:text-zinc-300">
												{item.suggestion}
											</p>
										</li>
									))}
								</ul>
							</Section>
						) : null}

						{result.keywordsToAdd.length > 0 ? (
							<Section title="Mots-clés à renforcer">
								<ul className="m-0 list-disc space-y-1 pl-4 text-sm">
									{result.keywordsToAdd.map((q) => (
										<li key={q}>{q}</li>
									))}
								</ul>
							</Section>
						) : null}
					</>
				) : (
					<>
						<p className="m-0 text-sm text-zinc-600 dark:text-zinc-400">
							Colle l’annonce (obligatoire). Entreprise et intitulé sont optionnels pour affiner
							l’analyse.
						</p>
						<label className="flex flex-col gap-1" htmlFor="match-job-company">
							<span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
								Entreprise
							</span>
							<InputText
								id="match-job-company"
								value={form.companyName}
								onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
								maxLength={120}
								placeholder="Ex. Acme"
								className="w-full"
							/>
						</label>
						<label className="flex flex-col gap-1" htmlFor="match-job-job-title">
							<span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
								Intitulé du poste
							</span>
							<InputText
								id="match-job-job-title"
								value={form.jobTitle}
								onChange={(e) => setForm((prev) => ({ ...prev, jobTitle: e.target.value }))}
								maxLength={120}
								placeholder="Ex. Développeur full-stack"
								className="w-full"
							/>
						</label>
						<label className="flex flex-col gap-1" htmlFor="match-job-job-offer">
							<span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
								Annonce <span className="font-normal text-zinc-400">(obligatoire)</span>
							</span>
							<InputTextarea
								id="match-job-job-offer"
								value={form.jobOffer}
								onChange={(e) => {
									setFormError(null);
									setForm((prev) => ({ ...prev, jobOffer: e.target.value }));
								}}
								rows={6}
								autoResize
								maxLength={10_000}
								placeholder="Colle le texte de l’offre (missions, compétences, exigences…)"
								className="w-full"
							/>
						</label>
						{formError ? (
							<p className="m-0 text-xs text-red-600 dark:text-red-400">{formError}</p>
						) : null}
					</>
				)}
			</div>
		</Dialog>
	);
};
