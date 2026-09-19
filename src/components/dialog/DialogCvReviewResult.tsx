import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import type { CvReview } from "@/services/schemas/cvReview.schema";

interface DialogCvReviewResultProps {
	visible: boolean;
	review: CvReview | null;
	loading?: boolean;
	onHide: () => void;
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
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

const priorityLabel: Record<string, string> = {
	haute: "Haute",
	moyenne: "Moyenne",
	basse: "Basse",
};

/**
 * Affiche le résultat d’une relecture générale IA (lecture seule V0).
 */
export const DialogCvReviewResult = ({
	visible,
	review,
	loading = false,
	onHide,
}: DialogCvReviewResultProps) => {
	const footer = (
		<div className="flex flex-wrap justify-end gap-2">
			<Button
				type="button"
				label="Fermer"
				onClick={onHide}
				disabled={loading}
				className="bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
			/>
		</div>
	);

	return (
		<Dialog
			visible={visible}
			onHide={onHide}
			header="Relecture générale IA"
			style={{ width: "40rem", maxWidth: "94vw" }}
			className="dialog-cv-review-result"
			footer={footer}
			closable={!loading}
		>
			<div className="flex max-h-[min(70vh,32rem)] flex-col gap-3 overflow-y-auto p-1 text-zinc-900 dark:text-zinc-100">
				{loading ? (
					<p className="m-0 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
						<span className="pi pi-spin pi-spinner" aria-hidden />
						Analyse du CV en cours…
					</p>
				) : !review ? (
					<p className="m-0 text-sm text-zinc-500">
						Aucun résultat pour le moment.
					</p>
				) : (
					<>
						{typeof review.score === "number" ? (
							<p className="m-0 text-sm">
								<span className="font-semibold">Note : </span>
								{review.score}
								<span className="text-zinc-500 dark:text-zinc-400">
									{" "}
									/ 10
								</span>
							</p>
						) : null}

						<Section title="Synthèse">
							<p className="m-0 whitespace-pre-wrap text-sm leading-relaxed">
								{review.summary}
							</p>
						</Section>

						{review.strengths.length > 0 ? (
							<Section title="Points forts">
								<ul className="m-0 list-disc space-y-1 pl-4 text-sm">
									{review.strengths.map((s, i) => (
										<li key={i}>{s}</li>
									))}
								</ul>
							</Section>
						) : null}

						{review.improvements.length > 0 ? (
							<Section title="Pistes d’amélioration">
								<ul className="m-0 flex list-none flex-col gap-2.5 p-0">
									{review.improvements.map((item, i) => (
										<li key={i} className="text-sm">
											<p className="m-0 font-semibold">
												{item.area}
												{item.priority ? (
													<span className="ml-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
														{priorityLabel[item.priority] ??
															item.priority}
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

						{review.quickWins.length > 0 ? (
							<Section title="Quick wins">
								<ul className="m-0 list-disc space-y-1 pl-4 text-sm">
									{review.quickWins.map((q, i) => (
										<li key={i}>{q}</li>
									))}
								</ul>
							</Section>
						) : null}
					</>
				)}
			</div>
		</Dialog>
	);
};
