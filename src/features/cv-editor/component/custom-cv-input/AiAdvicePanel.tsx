import { Button } from "primereact/button";
import {
	useAiAdvice,
	type AiAdviceEntry,
	type AiAdviceKind,
} from "@/features/cv-editor/component/context/AiAdviceContext";
import type { CvCoverLetter } from "@/services/schemas/cvCoverLetter.schema";
import type { CvMatchJob } from "@/services/schemas/cvMatchJob.schema";

function formatTime(ts: number) {
	return new Date(ts).toLocaleTimeString("fr-FR", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

const AI_ACTION_LABELS: Record<AiAdviceKind, string> = {
	"review-cv": "Relecture",
	"rewrite-section": "Reformulation",
	"cover-letter": "Lettre de motivation",
	"match-job": "Comparaison annonce",
	"match-rome-fiche": "Fiche métier",
};

function AdviceCard({
	entry,
	onRemove,
	onReopenCoverLetter,
	onReopenMatchJob,
	onReopenMatchRomeFiche,
}: {
	entry: AiAdviceEntry;
	onRemove: () => void;
	onReopenCoverLetter?: ((coverLetter: CvCoverLetter) => void) | undefined;
	onReopenMatchJob?: ((match: CvMatchJob) => void) | undefined;
	onReopenMatchRomeFiche?: ((match: CvMatchJob) => void) | undefined;
}) {
	const { review } = entry;
	const actionLabel = AI_ACTION_LABELS[entry.kind];
	const canReopenLetter = !!(entry.coverLetter && onReopenCoverLetter);
	const canReopenMatch = !!(
		entry.matchJob && (entry.matchRomeFiche ? onReopenMatchRomeFiche : onReopenMatchJob)
	);

	return (
		<article className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2 dark:border-zinc-700 dark:bg-zinc-900/60">
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0 flex-1">
					<p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
						{actionLabel}
					</p>
					<p className="m-0 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
						{entry.title}
					</p>
					<p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">
						{formatTime(entry.createdAt)}
						{typeof review.score === "number" ? ` · ${review.score}/10` : ""}
					</p>
					<p className="m-0 mt-1 line-clamp-2 text-xs leading-snug text-zinc-600 dark:text-zinc-300">
						{review.summary}
					</p>
				</div>
				<Button
					type="button"
					text
					rounded
					size="small"
					icon="pi pi-times"
					aria-label="Retirer ce conseil"
					onClick={onRemove}
					className="!h-7 !w-7 shrink-0 !text-zinc-500"
				/>
			</div>
			{(canReopenLetter || canReopenMatch) && (
				<div className="mt-1.5 flex justify-end">
					{canReopenLetter ? (
						<Button
							type="button"
							text
							size="small"
							icon="pi pi-external-link"
							label="Voir"
							aria-label="Rouvrir la lettre de motivation"
							onClick={() => {
								if (entry.coverLetter) onReopenCoverLetter?.(entry.coverLetter);
							}}
							className="!p-0 !text-xs !text-zinc-600 dark:!text-zinc-300"
						/>
					) : null}
					{canReopenMatch ? (
						<Button
							type="button"
							text
							size="small"
							icon="pi pi-external-link"
							label="Voir"
							aria-label={
								entry.matchRomeFiche
									? "Rouvrir la comparaison à la fiche métier"
									: "Rouvrir la comparaison à l’annonce"
							}
							onClick={() => {
								if (!entry.matchJob) return;
								if (entry.matchRomeFiche) onReopenMatchRomeFiche?.(entry.matchJob);
								else onReopenMatchJob?.(entry.matchJob);
							}}
							className="!p-0 !text-xs !text-zinc-600 dark:!text-zinc-300"
						/>
					) : null}
				</div>
			)}
		</article>
	);
}

interface AiAdvicePanelProps {
	onReopenCoverLetter?: ((coverLetter: CvCoverLetter) => void) | undefined;
	onReopenMatchJob?: ((match: CvMatchJob) => void) | undefined;
	onReopenMatchRomeFiche?: ((match: CvMatchJob) => void) | undefined;
}

/**
 * Contenu de l’onglet IA — pile compacte (session).
 * Pas de scroll interne : le scroll unique est celui du TabView du dock.
 */
export function AiAdvicePanel({
	onReopenCoverLetter,
	onReopenMatchJob,
	onReopenMatchRomeFiche,
}: AiAdvicePanelProps) {
	const { entries, removeAdvice, clearAdvice } = useAiAdvice();

	if (entries.length === 0) return null;

	return (
		<div className="flex flex-col gap-2 px-0.5 py-0.5 text-zinc-900 dark:text-zinc-100">
			<div className="flex items-center justify-between gap-2">
				<p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">
					{entries.length} conseil{entries.length > 1 ? "s" : ""}
				</p>
				<Button
					type="button"
					text
					size="small"
					label="Tout effacer"
					onClick={clearAdvice}
					className="!p-0 !text-xs !text-zinc-500"
				/>
			</div>
			<div className="flex flex-col gap-1.5">
				{entries.map((entry) => (
					<AdviceCard
						key={entry.id}
						entry={entry}
						onRemove={() => removeAdvice(entry.id)}
						onReopenCoverLetter={onReopenCoverLetter}
						onReopenMatchJob={onReopenMatchJob}
						onReopenMatchRomeFiche={onReopenMatchRomeFiche}
					/>
				))}
			</div>
		</div>
	);
}
