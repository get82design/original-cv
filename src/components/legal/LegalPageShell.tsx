import Head from "next/head";
import Link from "next/link";
import type { PropsWithChildren } from "react";

type LegalPageShellProps = PropsWithChildren<{
	title: string;
	description: string;
}>;

/**
 * Coquille commune des pages légales (CGU, privacy, mentions).
 */
export const LegalPageShell = ({ title, description, children }: LegalPageShellProps) => {
	return (
		<>
			<Head>
				<title>{title} — OriginalCV</title>
				<meta name="description" content={description} />
				<meta name="robots" content="index,follow" />
			</Head>
			<main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12 text-zinc-900 dark:text-zinc-100">
				<p className="m-0 mb-4 text-xs text-zinc-500 dark:text-zinc-400">
					<Link
						href="/"
						className="text-primary hover:underline dark:text-primary-dark"
					>
						← Accueil
					</Link>
				</p>
				<h1 className="m-0 text-2xl font-bold sm:text-3xl">{title}</h1>
				<p className="mt-2 mb-8 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
				<article className="legal-prose flex flex-col gap-5 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 [&_h2]:m-0 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h2]:dark:text-zinc-50 [&_p]:m-0 [&_ul]:m-0 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
					{children}
				</article>
				<p className="mt-10 text-xs text-zinc-500 dark:text-zinc-400">
					Dernière mise à jour : septembre 2026 — version V1 indicative, à faire valider.
				</p>
			</main>
		</>
	);
};
