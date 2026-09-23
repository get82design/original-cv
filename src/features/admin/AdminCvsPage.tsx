import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { SelectButton } from "primereact/selectbutton";
import { TitleAppOne } from "@/components/title/TitleAppOne";
import { AppCard } from "@/components/card/AppCard";
import { trpc } from "@utils/trpc";
import type { AdminDashboardPeriod } from "@/services/admin/adminDashboardService";
import type { AdminTopTemplateSort } from "@/services/admin/adminCvService";

type CvView = "feed" | "templates" | "colors";

const PERIOD_OPTIONS: { label: string; value: AdminDashboardPeriod }[] = [
	{ label: "24 h", value: "1d" },
	{ label: "7 j", value: "7d" },
	{ label: "30 j", value: "30d" },
	{ label: "90 j", value: "90d" },
	{ label: "1 an", value: "365d" },
	{ label: "Toujours", value: "all" },
];

const VIEW_OPTIONS: { label: string; value: CvView }[] = [
	{ label: "Créations", value: "feed" },
	{ label: "Top modèles", value: "templates" },
	{ label: "Top couleurs", value: "colors" },
];

const TEMPLATE_SORT_OPTIONS: {
	label: string;
	value: AdminTopTemplateSort;
}[] = [
	{ label: "Popularité", value: "popularityScore" },
	{ label: "Achats / unlocks", value: "unlockCount" },
	{ label: "CV créés", value: "cvCount" },
	{ label: "DL total", value: "downloadCount" },
	{ label: "DL gratuits", value: "freeDownloadCount" },
	{ label: "DL payants", value: "paidDownloadCount" },
];

function formatDate(d: Date | string | null | undefined) {
	if (!d) return "—";
	const date = typeof d === "string" ? new Date(d) : d;
	return date.toLocaleString("fr-FR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function parseView(raw: string | string[] | undefined): CvView {
	const v = Array.isArray(raw) ? raw[0] : raw;
	if (v === "templates" || v === "colors" || v === "feed") return v;
	return "feed";
}

export function AdminCvsPage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const isAdmin = session?.user?.role === "ADMIN";

	const [view, setView] = useState<CvView>("feed");
	const [period, setPeriod] = useState<AdminDashboardPeriod>("7d");
	const [templateSort, setTemplateSort] = useState<AdminTopTemplateSort>("popularityScore");
	const [templateId, setTemplateId] = useState<string | null>(null);
	const [primaryColorName, setPrimaryColorName] = useState<string | null>(null);
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const pageSize = 20;

	useEffect(() => {
		if (!router.isReady) return;
		setView(parseView(router.query.view));
	}, [router.isReady, router.query.view]);

	useEffect(() => {
		if (status === "loading") return;
		if (status !== "authenticated" || !isAdmin) {
			void router.replace("/");
		}
	}, [status, isAdmin, router]);

	useEffect(() => {
		const t = setTimeout(() => {
			setSearch(searchInput.trim());
			setPage(1);
		}, 300);
		return () => clearTimeout(t);
	}, [searchInput]);

	const enabled = status === "authenticated" && isAdmin;

	const filtersQuery = trpc.admin.listCvFilters.useQuery(undefined, {
		enabled: enabled && view === "feed",
	});

	const listQuery = trpc.admin.listCvs.useQuery(
		{
			period,
			page,
			pageSize,
			...(templateId ? { templateId } : {}),
			...(primaryColorName ? { primaryColorName } : {}),
			...(search ? { search } : {}),
		},
		{ enabled: enabled && view === "feed" },
	);

	const topTemplatesQuery = trpc.admin.listTopTemplates.useQuery(
		{ period, sortBy: templateSort },
		{ enabled: enabled && view === "templates" },
	);

	const topColorsQuery = trpc.admin.listTopColors.useQuery(
		{ period },
		{ enabled: enabled && view === "colors" },
	);

	const templateOptions = [
		{ label: "Tous", value: null as string | null },
		...(filtersQuery.data?.templates.map((t) => ({
			label: t.name,
			value: t.id as string | null,
		})) ?? []),
	];

	const colorOptions = [
		{ label: "Toutes", value: null as string | null },
		...(filtersQuery.data?.colors.map((c) => ({
			label: c.name,
			value: c.name as string | null,
		})) ?? []),
	];

	const total = listQuery.data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	const setViewAndUrl = (next: CvView) => {
		setView(next);
		void router.replace({ pathname: "/admin/cvs", query: { view: next } }, undefined, {
			shallow: true,
		});
	};

	if (status === "loading") {
		return (
			<div className="mx-auto max-w-6xl px-4 py-10">
				<p className="text-sm text-zinc-500">Chargement…</p>
			</div>
		);
	}

	if (status !== "authenticated" || !isAdmin) {
		return (
			<div className="mx-auto max-w-6xl px-4 py-10">
				<p className="text-sm text-zinc-500">Accès réservé aux admins.</p>
			</div>
		);
	}

	const summary =
		view === "feed"
			? `${total} CV`
			: view === "templates"
				? `${topTemplatesQuery.data?.length ?? 0} modèles`
				: `${topColorsQuery.data?.length ?? 0} couleurs`;

	return (
		<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
			<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<Link
						href="/admin"
						className="mb-2 inline-block text-xs text-zinc-500 hover:text-primary dark:hover:text-primary-dark"
					>
						← Dashboard
					</Link>
					<TitleAppOne
						firstPart="Admin"
						secondPart="CV"
						withSpace
						classNameSize="text-3xl sm:text-4xl"
					/>
				</div>
				<p className="m-0 text-sm text-zinc-500 dark:text-zinc-400">{summary}</p>
			</div>

			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<SelectButton
					value={view}
					onChange={(e) => {
						if (e.value == null) return;
						setViewAndUrl(e.value as CvView);
					}}
					options={VIEW_OPTIONS}
					optionLabel="label"
					optionValue="value"
					allowEmpty={false}
				/>
				<SelectButton
					value={period}
					onChange={(e) => {
						if (e.value == null) return;
						setPeriod(e.value as AdminDashboardPeriod);
						setPage(1);
					}}
					options={PERIOD_OPTIONS}
					optionLabel="label"
					optionValue="value"
					allowEmpty={false}
				/>
			</div>

			{view === "feed" ? (
				<>
					<AppCard className="admin-filters mb-4">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
							<div className="min-w-0 flex-1 sm:max-w-md">
								<label htmlFor="admin-cvs-search" className="mb-1 block text-xs text-zinc-500">Recherche</label>
								<div className="relative w-full">
									<i className="pi pi-search pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-sm text-zinc-500 dark:text-zinc-400" />
									<InputText
										id="admin-cvs-search"
										value={searchInput}
										onChange={(e) => setSearchInput(e.target.value)}
										placeholder="Email utilisateur…"
										className="w-full !pl-10"
									/>
								</div>
							</div>
							<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
								<div className="w-full sm:w-52">
									<label htmlFor="admin-cvs-template" className="mb-1 block text-xs text-zinc-500">Template</label>
									<Dropdown
										id="admin-cvs-template"
										value={templateId}
										options={templateOptions}
										onChange={(e) => {
											setTemplateId(e.value as string | null);
											setPage(1);
										}}
										optionLabel="label"
										optionValue="value"
										className="w-full"
									/>
								</div>
								<div className="w-full sm:w-44">
									<label htmlFor="admin-cvs-color" className="mb-1 block text-xs text-zinc-500">Couleur</label>
									<Dropdown
										id="admin-cvs-color"
										value={primaryColorName}
										options={colorOptions}
										onChange={(e) => {
											setPrimaryColorName(e.value as string | null);
											setPage(1);
										}}
										optionLabel="label"
										optionValue="value"
										className="w-full"
									/>
								</div>
							</div>
						</div>
					</AppCard>

					<AppCard className="overflow-x-auto !p-0">
						<table className="w-full min-w-[48rem] border-collapse text-left text-sm">
							<thead>
								<tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
									<th className="px-4 py-3 font-semibold">Date</th>
									<th className="px-3 py-3 font-semibold">User</th>
									<th className="px-3 py-3 font-semibold">CV</th>
									<th className="px-3 py-3 font-semibold">Template</th>
									<th className="px-3 py-3 font-semibold">Couleur</th>
								</tr>
							</thead>
							<tbody>
								{listQuery.isLoading ? (
									<tr>
										<td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
											Chargement…
										</td>
									</tr>
								) : (listQuery.data?.items.length ?? 0) === 0 ? (
									<tr>
										<td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
											Aucun CV.
										</td>
									</tr>
								) : (
									listQuery.data!.items.map((cv) => (
										<tr key={cv.id} className="border-b border-zinc-100 dark:border-zinc-800">
											<td className="px-4 py-3 text-xs whitespace-nowrap text-zinc-500">
												{formatDate(cv.createdAt)}
											</td>
											<td className="px-3 py-3">
												{cv.userEmail ? (
													<Link
														href={`/admin/users/${cv.userId}`}
														className="font-medium text-primary hover:underline dark:text-primary-dark"
													>
														{cv.userEmail}
													</Link>
												) : (
													<span className="text-zinc-500">—</span>
												)}
											</td>
											<td className="px-3 py-3 text-zinc-800 dark:text-zinc-200">{cv.title}</td>
											<td className="px-3 py-3 text-xs text-zinc-600 dark:text-zinc-400">
												{cv.templateName}
											</td>
											<td className="px-3 py-3">
												{cv.primaryColorName ? (
													<span className="inline-flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
														<span
															className="inline-block h-3 w-3 shrink-0 rounded-full border border-zinc-200 dark:border-zinc-600"
															style={{
																backgroundColor: `var(--${cv.primaryColorName}${cv.colorPrimary ?? "-600"})`,
															}}
															title={`${cv.primaryColorName}${cv.colorPrimary ?? ""}`}
														/>
														{cv.primaryColorName}
													</span>
												) : (
													<span className="text-xs text-zinc-500">—</span>
												)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</AppCard>

					{totalPages > 1 ? (
						<div className="mt-4 flex items-center justify-between gap-3">
							<p className="m-0 text-xs text-zinc-500">
								Page {page} / {totalPages}
							</p>
							<div className="flex gap-2">
								<Button
									type="button"
									size="small"
									outlined
									label="Précédent"
									disabled={page <= 1 || listQuery.isFetching}
									onClick={() => setPage((p) => Math.max(1, p - 1))}
								/>
								<Button
									type="button"
									size="small"
									outlined
									label="Suivant"
									disabled={page >= totalPages || listQuery.isFetching}
									onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								/>
							</div>
						</div>
					) : null}
				</>
			) : null}

			{view === "templates" ? (
				<>
					<AppCard className="admin-filters mb-4">
						<div className="w-full sm:w-56">
							<label htmlFor="admin-cvs-sort" className="mb-1 block text-xs text-zinc-500">Trier par</label>
							<Dropdown
								id="admin-cvs-sort"
								value={templateSort}
								options={TEMPLATE_SORT_OPTIONS}
								onChange={(e) => setTemplateSort(e.value as AdminTopTemplateSort)}
								optionLabel="label"
								optionValue="value"
								className="w-full"
							/>
						</div>
					</AppCard>

					<AppCard className="overflow-x-auto !p-0">
						<table className="w-full min-w-[48rem] border-collapse text-left text-sm">
							<thead>
								<tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
									<th className="px-4 py-3 font-semibold">#</th>
									<th className="px-3 py-3 font-semibold">Modèle</th>
									<th className="px-3 py-3 font-semibold">Pop.</th>
									<th className="px-3 py-3 font-semibold">Achats</th>
									<th className="px-3 py-3 font-semibold">CV</th>
									<th className="px-3 py-3 font-semibold">DL total</th>
									<th className="px-3 py-3 font-semibold">Gratuit</th>
									<th className="px-3 py-3 font-semibold">Payant</th>
								</tr>
							</thead>
							<tbody>
								{topTemplatesQuery.isLoading ? (
									<tr>
										<td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
											Chargement…
										</td>
									</tr>
								) : (topTemplatesQuery.data?.length ?? 0) === 0 ? (
									<tr>
										<td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
											Aucun modèle.
										</td>
									</tr>
								) : (
									topTemplatesQuery.data!.map((t, i) => (
										<tr
											key={t.templateId}
											className="border-b border-zinc-100 dark:border-zinc-800"
										>
											<td className="px-4 py-3 text-xs text-zinc-500">{i + 1}</td>
											<td className="px-3 py-3 font-medium text-zinc-900 dark:text-zinc-100">
												{t.name}
											</td>
											<td className="px-3 py-3 font-medium text-zinc-800 dark:text-zinc-200">
												{t.popularityScore.toFixed(1)}
											</td>
											<td className="px-3 py-3 text-zinc-700 dark:text-zinc-300">
												{t.unlockCount}
											</td>
											<td className="px-3 py-3 text-zinc-700 dark:text-zinc-300">{t.cvCount}</td>
											<td className="px-3 py-3 text-zinc-700 dark:text-zinc-300">
												{t.downloadCount}
											</td>
											<td className="px-3 py-3 text-emerald-600 dark:text-emerald-400">
												{t.freeDownloadCount}
											</td>
											<td className="px-3 py-3 text-amber-600 dark:text-amber-400">
												{t.paidDownloadCount}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</AppCard>
				</>
			) : null}

			{view === "colors" ? (
				<AppCard className="overflow-x-auto !p-0">
					<table className="w-full min-w-[28rem] border-collapse text-left text-sm">
						<thead>
							<tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
								<th className="px-4 py-3 font-semibold">#</th>
								<th className="px-3 py-3 font-semibold">Couleur</th>
								<th className="px-3 py-3 font-semibold">Popularité</th>
								<th className="px-3 py-3 font-semibold">CV</th>
								<th className="px-3 py-3 font-semibold">DL</th>
							</tr>
						</thead>
						<tbody>
							{topColorsQuery.isLoading ? (
								<tr>
									<td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
										Chargement…
									</td>
								</tr>
							) : (topColorsQuery.data?.length ?? 0) === 0 ? (
								<tr>
									<td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
										Aucune couleur.
									</td>
								</tr>
							) : (
								topColorsQuery.data!.map((c, i) => (
									<tr key={c.name} className="border-b border-zinc-100 dark:border-zinc-800">
										<td className="px-4 py-3 text-xs text-zinc-500">{i + 1}</td>
										<td className="px-3 py-3">
											<span className="inline-flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
												<span
													className="inline-block h-3 w-3 shrink-0 rounded-full border border-zinc-200 dark:border-zinc-600"
													style={{
														backgroundColor: `var(--${c.name}${c.primary ?? "-600"})`,
													}}
													title={`${c.name}${c.primary ?? ""}`}
												/>
												{c.name}
											</span>
										</td>
										<td className="px-3 py-3 font-medium text-zinc-800 dark:text-zinc-200">
											{c.popularityScore.toFixed(1)}
										</td>
										<td className="px-3 py-3 text-zinc-700 dark:text-zinc-300">{c.cvCount}</td>
										<td className="px-3 py-3 text-zinc-700 dark:text-zinc-300">
											{c.downloadCount}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</AppCard>
			) : null}
		</div>
	);
}
