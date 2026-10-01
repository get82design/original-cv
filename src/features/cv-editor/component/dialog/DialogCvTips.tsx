import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Accordion, AccordionTab } from "primereact/accordion";
import Image from "next/image";
import { CV_TIP_GROUPS, type CvTipMedia } from "./cvTips";
import { CV_ONBOARDING_STEPS } from "./cvOnboarding";

/** Bascule light/dark en CSS : pas de hook, donc pas de flash à l'hydratation. */
const TipIllustration = ({ media }: { media: CvTipMedia }) => {
	const className =
		"mt-2.5 h-auto w-full rounded-md border border-zinc-200 dark:border-zinc-700";
	return (
		<>
			<Image
				src={media.src}
				alt={media.alt}
				width={media.width}
				height={media.height}
				className={media.srcDark ? `${className} dark:hidden` : className}
			/>
			{media.srcDark && (
				<Image
					src={media.srcDark}
					alt={media.alt}
					width={media.width}
					height={media.height}
					className={`${className} hidden dark:block`}
				/>
			)}
		</>
	);
};

const AccordionHeader = ({ icon, title }: { icon: string; title: string }) => (
	<span className="inline-flex items-center gap-2 text-sm font-semibold">
		<i className={`${icon} text-sm`} aria-hidden />
		{title}
	</span>
);

interface DialogCvTipsProps {
	visible: boolean;
	onHide: () => void;
}

export const DialogCvTips = ({ visible, onHide }: DialogCvTipsProps) => {
	const footer = (
		<div className="flex justify-end">
			<Button
				type="button"
				label="J’ai compris"
				onClick={onHide}
				className="bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
			/>
		</div>
	);

	return (
		<Dialog
			visible={visible}
			onHide={onHide}
			header="Quelques tips"
			style={{ width: "840px", maxWidth: "96vw" }}
			className="dialog-cv-tips"
			footer={footer}
		>
			<div className="flex flex-col gap-4 p-2 text-zinc-900 dark:text-zinc-100">
				<p className="m-0 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
					Guide de l’éditeur et repères pour un CV qui passe le premier filtre —
					disponible à tout moment via le SpeedDial.
				</p>

				<Accordion activeIndex={0} className="cv-tips-accordion">
					{/* Même contenu que le stepper 1ère utilisation — source unique `cvOnboarding.ts`. */}
					<AccordionTab
						header={
							<AccordionHeader
								icon="pi pi-compass"
								title="Guide de l’éditeur"
							/>
						}
					>
						<ul className="m-0 p-0 list-none flex flex-col gap-2">
							{CV_ONBOARDING_STEPS.map((step) => (
								<li
									key={step.id}
									className="rounded-lg border border-zinc-200 bg-white px-3.5 py-3 dark:border-zinc-700 dark:bg-zinc-900"
								>
									<p className="m-0 flex items-center gap-2 text-sm font-semibold">
										<i
											className={`${step.icon} text-primary dark:text-primary-dark text-sm`}
											aria-hidden
										/>
										{step.title}
									</p>
									<p className="m-0 mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
										{step.text}
									</p>
								</li>
							))}
						</ul>
					</AccordionTab>

					{CV_TIP_GROUPS.map((group) => (
						<AccordionTab
							key={group.id}
							header={<AccordionHeader icon={group.icon} title={group.title} />}
						>
							<ul className="m-0 p-0 list-none flex flex-col gap-2">
								{group.tips.map((tip) => (
									<li
										key={tip.id}
										className="rounded-lg border border-zinc-200 bg-white px-3.5 py-3 dark:border-zinc-700 dark:bg-zinc-900"
									>
										<p className="m-0 text-sm font-semibold">{tip.title}</p>
										<p className="m-0 mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
											{tip.text}
										</p>
										{tip.media && <TipIllustration media={tip.media} />}
									</li>
								))}
							</ul>
						</AccordionTab>
					))}
				</Accordion>
			</div>
		</Dialog>
	);
};
