import { createContext, type PropsWithChildren, useContext, useState } from "react";
import { v4 as uuid } from "uuid";
import type { CvReview } from "@/services/schemas/cvReview.schema";
import type { CvCoverLetter } from "@/services/schemas/cvCoverLetter.schema";
import type { CvMatchJob } from "@/services/schemas/cvMatchJob.schema";
import type { AiActionId } from "@/components/dialog/DialogAssistantIa";

/** Kinds de conseils empilables (session) — prêts pour persistance BDD plus tard. */
export type AiAdviceKind = Extract<
	AiActionId,
	"review-cv" | "rewrite-section" | "cover-letter" | "match-job"
>;

export type AiAdviceEntry = {
	id: string;
	kind: AiAdviceKind;
	/** Libellé affiché (ex. « Relecture générale », « Expérience · Dev ») */
	title: string;
	createdAt: number;
	review: CvReview;
	/** Lettre complète — pour rouvrir la modale sans changer le résumé affiché */
	coverLetter?: CvCoverLetter;
	/** Résultat match-job — pour rouvrir la modale dédiée */
	matchJob?: CvMatchJob;
};

type AiAdvicePushInput = {
	kind: AiAdviceKind;
	title: string;
	review: CvReview;
	coverLetter?: CvCoverLetter;
	matchJob?: CvMatchJob;
};

type AiAdviceContextValue = {
	entries: AiAdviceEntry[];
	pushAdvice: (input: AiAdvicePushInput) => void;
	removeAdvice: (id: string) => void;
	clearAdvice: () => void;
	/** Incrémenté à chaque nouveau conseil — le dock ouvre l’onglet IA */
	iaTabNonce: number;
};

const AiAdviceContext = createContext<AiAdviceContextValue | null>(null);

export const useAiAdvice = () => {
	const ctx = useContext(AiAdviceContext);
	if (!ctx) {
		throw new Error("useAiAdvice must be used within AiAdviceProvider");
	}
	return ctx;
};

export const AiAdviceProvider = ({ children }: PropsWithChildren) => {
	const [entries, setEntries] = useState<AiAdviceEntry[]>([]);
	const [iaTabNonce, setIaTabNonce] = useState(0);

	const pushAdvice = (input: AiAdvicePushInput) => {
		const entry: AiAdviceEntry = {
			id: uuid(),
			kind: input.kind,
			title: input.title,
			createdAt: Date.now(),
			review: input.review,
			...(input.coverLetter ? { coverLetter: input.coverLetter } : {}),
			...(input.matchJob ? { matchJob: input.matchJob } : {}),
		};
		setEntries((prev) => [entry, ...prev]);
		setIaTabNonce((n) => n + 1);
	};

	const removeAdvice = (id: string) => {
		setEntries((prev) => prev.filter((e) => e.id !== id));
	};

	const clearAdvice = () => {
		setEntries([]);
	};

	return (
		<AiAdviceContext.Provider
			value={{
				entries,
				pushAdvice,
				removeAdvice,
				clearAdvice,
				iaTabNonce,
			}}
		>
			{children}
		</AiAdviceContext.Provider>
	);
};
