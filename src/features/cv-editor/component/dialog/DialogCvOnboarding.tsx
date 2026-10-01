import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Steps } from "primereact/steps";
import { Checkbox } from "primereact/checkbox";
import { CV_ONBOARDING_STEPS } from "./cvOnboarding";

interface DialogCvOnboardingProps {
	visible: boolean;
	onHide: () => void;
	/** Persiste hideCvOnboarding côté compte (Terminer, ou Passer si checkbox cochée). */
	onDismissPermanently: () => void;
}

export const DialogCvOnboarding = ({
	visible,
	onHide,
	onDismissPermanently,
}: DialogCvOnboardingProps) => {
	const [activeIndex, setActiveIndex] = useState(0);
	const [dontShowAgain, setDontShowAgain] = useState(false);

	const lastIndex = CV_ONBOARDING_STEPS.length - 1;
	const step = CV_ONBOARDING_STEPS[activeIndex] ?? CV_ONBOARDING_STEPS[0];
	const isLast = activeIndex >= lastIndex;

	const stepsModel = CV_ONBOARDING_STEPS.map((s) => ({
		label: s.title,
	}));

	const handleClose = () => {
		setActiveIndex(0);
		setDontShowAgain(false);
		onHide();
	};

	const handleSkip = () => {
		if (dontShowAgain) {
			onDismissPermanently();
		}
		handleClose();
	};

	const handleFinish = () => {
		onDismissPermanently();
		handleClose();
	};

	const footer = (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
			<label
				htmlFor="cv-onboarding-dont-show"
				className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer select-none"
			>
				<Checkbox
					inputId="cv-onboarding-dont-show"
					checked={dontShowAgain}
					onChange={(e) => setDontShowAgain(Boolean(e.checked))}
				/>
				<span>Ne plus afficher</span>
			</label>
			<div className="flex flex-wrap items-center justify-end gap-2">
				<Button
					type="button"
					label="Passer"
					text
					severity="secondary"
					onClick={handleSkip}
					className="text-zinc-600 dark:text-zinc-300"
				/>
				{activeIndex > 0 && (
					<Button
						type="button"
						label="Précédent"
						outlined
						onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
					/>
				)}
				{isLast ? (
					<Button
						type="button"
						label="Terminer"
						onClick={handleFinish}
						className="bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
					/>
				) : (
					<Button
						type="button"
						label="Suivant"
						onClick={() => setActiveIndex((i) => Math.min(lastIndex, i + 1))}
						className="bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
					/>
				)}
			</div>
		</div>
	);

	return (
		<Dialog
			visible={visible}
			onHide={handleClose}
			header="Premiers pas"
			style={{ width: "760px", maxWidth: "96vw" }}
			className="dialog-cv-onboarding"
			footer={footer}
		>
			<div className="flex flex-col gap-4 p-1 text-zinc-900 dark:text-zinc-100">
				<Steps
					model={stepsModel}
					activeIndex={activeIndex}
					onSelect={(e) => setActiveIndex(e.index)}
					readOnly={false}
					className="cv-onboarding-steps"
				/>
				<div className="rounded-lg border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-900">
					<p className="m-0 flex items-center gap-2 text-base font-semibold">
						<i className={`${step.icon} text-primary dark:text-primary-dark`} aria-hidden />
						{step.title}
					</p>
					<p className="m-0 mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
						{step.text}
					</p>
					<p className="m-0 mt-3 text-xs text-zinc-500 dark:text-zinc-500">
						Étape {activeIndex + 1} / {CV_ONBOARDING_STEPS.length}
					</p>
				</div>
			</div>
		</Dialog>
	);
};
