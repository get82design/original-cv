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
import { AiFeature } from "../../../generated/prisma/enums";

const PERIOD_OPTIONS: { label: string; value: AdminDashboardPeriod }[] = [
	{ label: "24 h", value: "1d" },
	{ label: "7 j", value: "7d" },
	{ label: "30 j", value: "30d" },
	{ label: "90 j", value: "90d" },
	{ label: "1 an", value: "365d" },
	{ label: "Toujours", value: "all" },
];

const FEATURE_OPTIONS: { label: string; value: AiFeature | null }[] = [
	{ label: "Toutes", value: null },
	{ label: "Import PDF", value: AiFeature.IMPORT_CV },
	{ label: "Relecture", value: AiFeature.REVIEW_CV },
	{ label: "Reformulation", value: AiFeature.REWRITE_SECTION },
	{ label: "Lettre de motivation", value: AiFeature.COVER_LETTER },
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

function aiFeatureLabel(feature: AiFeature) {
	switch (feature) {
		case "IMPORT_CV":
			return "Import PDF";
		case "REVIEW_CV":
			return "Relecture";
		case "REWRITE_SECTION":
			return "Reformulation";
		case "COVER_LETTER":
			return "Lettre de motivation";
	}
}

export function AdminAiPage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const isAdmin = session?.user?.role === "ADMIN";

	const [period, setPeriod] = useState<AdminDashboardPeriod>("7d");
	const [feature, setFeature] = useState<AiFeature | null>(null);
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const pageSize = 20;

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

	const listQuery = trpc.admin.listAiEvents.useQuery(
		{
			period,
			page,
			pageSize,
			...(feature ? { feature } : {}),
			...(search ? { search } : {}),
		},
		{ enabled: status === "authenticated" && isAdmin },
	);

	const total = listQuery.data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
						secondPart="IA"
						withSpace
						classNameSize="text-3xl sm:text-4xl"
					/>
				</div>
				<p className="m-0 text-sm text-zinc-500 dark:text-zinc-400">
					{total} requête{total > 1 ? "s" : ""}
				</p>
			</div>

			<div className="mb-4">
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

			<AppCard className="admin-filters mb-4">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-end">
					<div className="flex-1">
						<label htmlFor="admin-ai-search" className="mb-1 block text-xs text-zinc-500">Recherche</label>
						<div className="relative w-full">
							<i className="pi pi-search pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-sm text-zinc-500 dark:text-zinc-400" />
							<InputText
								id="admin-ai-search"
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								placeholder="Email utilisateur…"
								className="w-full !pl-10"
							/>
						</div>
					</div>
					<div className="w-full lg:w-48">
						<label htmlFor="admin-ai-feature" className="mb-1 block text-xs text-zinc-500">Fonction</label>
						<Dropdown
						    inputId="admin-ai-feature"
							value={feature}
							options={FEATURE_OPTIONS}
							onChange={(e) => {
								setFeature(e.value as AiFeature | null);
								setPage(1);
							}}
							optionLabel="label"
							optionValue="value"
							className="w-full"
						/>
					</div>
				</div>
			</AppCard>

			<AppCard className="overflow-x-auto !p-0">
				<table className="w-full min-w-[40rem] border-collapse text-left text-sm">
					<thead>
						<tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
							<th className="px-4 py-3 font-semibold">Date</th>
							<th className="px-3 py-3 font-semibold">Fonction</th>
							<th className="px-3 py-3 font-semibold">User</th>
							<th className="px-3 py-3 font-semibold">Détail</th>
						</tr>
					</thead>
					<tbody>
						{listQuery.isLoading ? (
							<tr>
								<td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
									Chargement…
								</td>
							</tr>
						) : (listQuery.data?.items.length ?? 0) === 0 ? (
							<tr>
								<td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
									Aucune requête IA.
								</td>
							</tr>
						) : (
							listQuery.data!.items.map((e) => (
								<tr key={e.id} className="border-b border-zinc-100 dark:border-zinc-800">
									<td className="px-4 py-3 text-xs whitespace-nowrap text-zinc-500">
										{formatDate(e.createdAt)}
									</td>
									<td className="px-3 py-3 text-xs font-medium text-zinc-800 dark:text-zinc-200">
										{aiFeatureLabel(e.feature)}
									</td>
									<td className="px-3 py-3">
										{e.userId && e.userEmail ? (
											<Link
												href={`/admin/users/${e.userId}`}
												className="font-medium text-primary hover:underline dark:text-primary-dark"
											>
												{e.userEmail}
											</Link>
										) : (
											<span className="text-zinc-500">—</span>
										)}
									</td>
									<td className="px-3 py-3 text-xs text-zinc-600 dark:text-zinc-400">
										{e.detail ?? "—"}
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
		</div>
	);
}
