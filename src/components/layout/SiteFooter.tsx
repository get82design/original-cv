import Link from "next/link";

const linkClass = "text-primary hover:underline dark:text-primary-dark";

/**
 * Pied de page site — liens légaux toujours accessibles.
 */
export const SiteFooter = () => {
	const year = new Date().getFullYear();

	return (
		<footer className="w-full border-t border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950/80">
			<div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
				<p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">
					© {year} OriginalCV
				</p>
				<nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
					<Link href="/cgu" className={linkClass}>
						CGU
					</Link>
					<Link href="/politique-de-confidentialite" className={linkClass}>
						Confidentialité
					</Link>
					<Link href="/mentions-legales" className={linkClass}>
						Mentions légales
					</Link>
				</nav>
			</div>
		</footer>
	);
};
