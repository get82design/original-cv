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

const PERIOD_OPTIONS: { label: string; value: AdminDashboardPeriod }[] = [
	{ label: "24 h", value: "1d" },
	{ label: "7 j", value: "7d" },
	{ label: "30 j", value: "30d" },
	{ label: "90 j", value: "90d" },
	{ label: "1 an", value: "365d" },
	{ label: "Toujours", value: "all" },
];

const CODE_OPTIONS: { label: string; value: string | null }[] = [
	{ label: "Tous", value: null },
	{ label: "INTERNAL_SERVER_ERROR", value: "INTERNAL_SERVER_ERROR" },
	{ label: "TIMEOUT", value: "TIMEOUT" },
	{ label: "TOO_MANY_REQUESTS", value: "TOO_MANY_REQUESTS" },
	{ label: "PAYLOAD_TOO_LARGE", value: "PAYLOAD_TOO_LARGE" },
	{ label: "CLIENT_CLOSED_REQUEST", value: "CLIENT_CLOSED_REQUEST" },
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

function codeBadgeClass(code: string) {
	if (code === "TOO_MANY_REQUESTS") {
		return "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200";
	}
	if (code === "TIMEOUT" || code === "CLIENT_CLOSED_REQUEST") {
		return "bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-200";
	}
	return "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200";
}

export function AdminApiErrorsPage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const isAdmin = session?.user?.role === "ADMIN";

	const [period, setPeriod] = useState<AdminDashboardPeriod>("7d");
	const [code, setCode] = useState<string | null>(null);
	const [pathInput, setPathInput] = useState("");
	const [path, setPath] = useState("");
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
			setPath(pathInput.trim());
			setPage(1);
		}, 300);
		return () => clearTimeout(t);
	}, [searchInput, pathInput]);

	const listQuery = trpc.admin.listApiErrors.useQuery(
		{
			period,
			page,
			pageSize,
			...(code ? { code } : {}),
			...(path ? { path } : {}),
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
						secondPart="Erreurs API"
						withSpace
						classNameSize="text-3xl sm:text-4xl"
					/>
				</div>
				<p className="m-0 text-sm text-zinc-500 dark:text-zinc-400">
					{total} erreur{total > 1 ? "s" : ""}
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
						<label className="mb-1 block text-xs text-zinc-500">
							Recherche
						</label>
						<div className="relative w-full">
							<i className="pi pi-search pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-sm text-zinc-500 dark:text-zinc-400" />
							<InputText
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								placeholder="Email utilisateur…"
								className="w-full !pl-10"
							/>
						</div>
					</div>
					<div className="w-full lg:w-56">
						<label className="mb-1 block text-xs text-zinc-500">
							Procédure
						</label>
						<InputText
							value={pathInput}
							onChange={(e) => setPathInput(e.target.value)}
							placeholder="ex. cv.save"
							className="w-full"
						/>
					</div>
					<div className="w-full lg:w-64">
						<label className="mb-1 block text-xs text-zinc-500">
							Code
						</label>
						<Dropdown
							value={code}
							options={CODE_OPTIONS}
							onChange={(e) => {
								setCode(e.value as string | null);
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
				<table className="w-full min-w-[48rem] border-collapse text-left text-sm">
					<thead>
						<tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
							<th className="px-4 py-3 font-semibold">Date</th>
							<th className="px-3 py-3 font-semibold">Code</th>
							<th className="px-3 py-3 font-semibold">Path</th>
							<th className="px-3 py-3 font-semibold">User</th>
							<th className="px-3 py-3 font-semibold">Message</th>
						</tr>
					</thead>
					<tbody>
						{listQuery.isLoading ? (
							<tr>
								<td
									colSpan={5}
									className="px-4 py-8 text-center text-zinc-500"
								>
									Chargement…
								</td>
							</tr>
						) : (listQuery.data?.items.length ?? 0) === 0 ? (
							<tr>
								<td
									colSpan={5}
									className="px-4 py-8 text-center text-zinc-500"
								>
									Aucune erreur API.
								</td>
							</tr>
						) : (
							listQuery.data!.items.map((e) => (
								<tr
									key={e.id}
									className="border-b border-zinc-100 dark:border-zinc-800"
								>
									<td className="px-4 py-3 text-xs whitespace-nowrap text-zinc-500">
										{formatDate(e.createdAt)}
									</td>
									<td className="px-3 py-3">
										<span
											className={`inline-block rounded px-1.5 py-0.5 text-[0.65rem] font-semibold tracking-wide ${codeBadgeClass(e.code)}`}
										>
											{e.code}
										</span>
									</td>
									<td className="px-3 py-3 font-mono text-xs text-zinc-800 dark:text-zinc-200">
										{e.path}
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
											<span className="text-zinc-500">
												—
											</span>
										)}
									</td>
									<td className="max-w-xs truncate px-3 py-3 text-xs text-zinc-600 dark:text-zinc-400" title={e.message}>
										{e.message}
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
							disabled={
								page >= totalPages || listQuery.isFetching
							}
							onClick={() =>
								setPage((p) => Math.min(totalPages, p + 1))
							}
						/>
					</div>
				</div>
			) : null}
		</div>
	);
}
