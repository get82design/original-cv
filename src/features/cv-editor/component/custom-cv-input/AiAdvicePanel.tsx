import { Button } from "primereact/button";
import {
	useAiAdvice,
	type AiAdviceEntry,
} from "@/features/cv-editor/component/context/AiAdviceContext";

function formatTime(ts: number) {
	return new Date(ts).toLocaleTimeString("fr-FR", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function AdviceCard({ entry, onRemove }: { entry: AiAdviceEntry; onRemove: () => void }) {
	const { review } = entry;
	return (
		<article className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/60">
			<div className="mb-2 flex items-start justify-between gap-2">
				<div className="min-w-0">
					<p className="m-0 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
						{entry.title}
					</p>
					<p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">
						{formatTime(entry.createdAt)}
						{typeof review.score === "number" ? ` · ${review.score}/10` : ""}
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
			<p className="m-0 mb-2 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
				{review.summary}
			</p>
			{review.improvements.length > 0 ? (
				<ul className="m-0 list-disc space-y-1 pl-4 text-xs text-zinc-600 dark:text-zinc-400">
					{review.improvements.slice(0, 4).map((item) => (
						<li key={item.area + item.suggestion}>
							<span className="font-medium text-zinc-800 dark:text-zinc-200">{item.area}</span>
							{" — "}
							{item.suggestion}
						</li>
					))}
					{review.improvements.length > 4 ? <li>… +{review.improvements.length - 4}</li> : null}
				</ul>
			) : null}
			{review.quickWins.length > 0 ? (
				<p className="m-0 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
					<span className="font-medium">Quick wins : </span>
					{review.quickWins.slice(0, 3).join(" · ")}
				</p>
			) : null}
		</article>
	);
}

/**
 * Contenu de l’onglet IA — pile de conseils (session).
 * Visible uniquement s’il y a au moins une entrée.
 */
export function AiAdvicePanel() {
	const { entries, removeAdvice, clearAdvice } = useAiAdvice();

	if (entries.length === 0) return null;

	return (
		<div className="flex flex-col gap-3 px-1 py-1 text-zinc-900 dark:text-zinc-100">
			<div className="flex items-center justify-between gap-2">
				<p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">
					{entries.length} conseil{entries.length > 1 ? "s" : ""} (session)
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
			<div className="flex max-h-[min(52vh,28rem)] flex-col gap-2 overflow-y-auto pr-1">
				{entries.map((entry) => (
					<AdviceCard key={entry.id} entry={entry} onRemove={() => removeAdvice(entry.id)} />
				))}
			</div>
		</div>
	);
}
