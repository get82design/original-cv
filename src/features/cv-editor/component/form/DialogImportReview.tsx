import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import type { CvImportDraft } from "@/services/schemas/cvImportDraft.schema";

interface DialogImportReviewProps {
	visible: boolean;
	draft: CvImportDraft | null;
	onHide: () => void;
	/** Confirmer → apply (étape suivante) */
	onConfirm: () => void;
}

function Section({
	title,
	count,
	children,
}: {
	title: string;
	count?: number;
	children: React.ReactNode;
}) {
	return (
		<section className="flex flex-col gap-1.5">
			<p className="m-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
				{title}
				{typeof count === "number" ? ` (${count})` : ""}
			</p>
			<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/60">
				{children}
			</div>
		</section>
	);
}

function formatDateRange(start?: string | null, end?: string | null): string | null {
	if (!start && !end) return null;
	return [start || "?", end || "présent"].join(" → ");
}

/**
 * Revue du draft Gemini avant injection dans le formulaire CV.
 * Lecture seule pour cette étape — édition fine plus tard si besoin.
 */
export const DialogImportReview = ({
	visible,
	draft,
	onHide,
	onConfirm,
}: DialogImportReviewProps) => {
	if (!draft) return null;

	const identityName =
		[draft.identity?.firstName, draft.identity?.lastName].filter(Boolean).join(" ") || "—";

	const footer = (
		<div className="flex flex-wrap justify-end gap-2">
			<Button
				type="button"
				label="Annuler"
				outlined
				onClick={onHide}
				className="!text-zinc-600 dark:!text-zinc-300 !border-zinc-300 dark:!border-zinc-600 hover:!bg-zinc-100 dark:hover:!bg-zinc-800"
			/>
			<Button
				type="button"
				label="Appliquer au CV"
				icon="pi pi-check"
				onClick={onConfirm}
				className="bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
			/>
		</div>
	);

	return (
		<Dialog
			visible={visible}
			onHide={onHide}
			header="Revue de l’import"
			style={{ width: "40rem", maxWidth: "94vw" }}
			className="dialog-import-review"
			footer={footer}
			closable
		>
			<div className="flex max-h-[min(70vh,32rem)] flex-col gap-3 overflow-y-auto p-1 text-zinc-900 dark:text-zinc-100">
				<p className="m-0 text-sm text-zinc-600 dark:text-zinc-400">
					Vérifiez ce que l’IA a extrait avant de l’injecter dans votre CV.
				</p>

				<Section title="Identité">
					<p className="m-0 text-sm font-semibold">{identityName}</p>
					{draft.identity?.title ? (
						<p className="m-0 text-sm text-zinc-600 dark:text-zinc-400">{draft.identity.title}</p>
					) : null}
					<ul className="m-0 mt-1 list-none space-y-0.5 p-0 text-xs text-zinc-600 dark:text-zinc-400">
						{draft.identity?.email ? <li>{draft.identity.email}</li> : null}
						{draft.identity?.phone ? <li>{draft.identity.phone}</li> : null}
						{draft.identity?.location ? <li>{draft.identity.location}</li> : null}
					</ul>
				</Section>

				{draft.description ? (
					<Section title="Résumé">
						<p className="m-0 whitespace-pre-wrap text-sm">{draft.description}</p>
					</Section>
				) : null}

				{draft.experiences.length > 0 ? (
					<Section title="Expériences" count={draft.experiences.length}>
						<ul className="m-0 flex list-none flex-col gap-2 p-0">
							{draft.experiences.map((exp) => (
								<li key={`${exp.title}-${exp.company}`} className="text-sm">
									<p className="m-0 font-semibold">
										{exp.title}
										{exp.company ? ` · ${exp.company}` : ""}
									</p>
									{formatDateRange(exp.start, exp.end) ? (
										<p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">
											{formatDateRange(exp.start, exp.end)}
										</p>
									) : null}
									{exp.missions.length > 0 ? (
										<ul className="m-0 mt-1 list-disc pl-4 text-xs text-zinc-600 dark:text-zinc-400">
											{exp.missions.slice(0, 4).map((m) => (
												<li key={m.content}>{m.content}</li>
											))}
											{exp.missions.length > 4 ? <li>… +{exp.missions.length - 4}</li> : null}
										</ul>
									) : null}
								</li>
							))}
						</ul>
					</Section>
				) : null}

				{draft.educations.length > 0 ? (
					<Section title="Formations / études" count={draft.educations.length}>
						<ul className="m-0 list-none space-y-1 p-0 text-sm">
							{draft.educations.map((ed) => (
								<li key={`${ed.title}-${ed.school}`}>
									<span className="font-semibold">{ed.title}</span>
									{ed.school ? ` · ${ed.school}` : ""}
								</li>
							))}
						</ul>
					</Section>
				) : null}

				{draft.skills.length > 0 ? (
					<Section title="Compétences" count={draft.skills.length}>
						<p className="m-0 text-sm">{draft.skills.join(" · ")}</p>
					</Section>
				) : null}

				{draft.languages.length > 0 ? (
					<Section title="Langues" count={draft.languages.length}>
						<p className="m-0 text-sm">
							{draft.languages
								.map((l) => (l.level ? `${l.name} (${l.level})` : l.name))
								.join(" · ")}
						</p>
					</Section>
				) : null}

				{draft.certifications.length > 0 ? (
					<Section title="Certifications" count={draft.certifications.length}>
						<ul className="m-0 list-none space-y-1 p-0 text-sm">
							{draft.certifications.map((c) => (
								<li key={`${c.title}-${c.organismeCertification}`}>
									{c.title}
									{c.organismeCertification ? ` · ${c.organismeCertification}` : ""}
								</li>
							))}
						</ul>
					</Section>
				) : null}

				{draft.warnings.length > 0 ? (
					<Section title="Avertissements IA" count={draft.warnings.length}>
						<ul className="m-0 list-disc space-y-1 pl-4 text-xs text-amber-800 dark:text-amber-300">
							{draft.warnings.map((w) => (
								<li key={w}>{w}</li>
							))}
						</ul>
					</Section>
				) : null}
			</div>
		</Dialog>
	);
};
