import Link from "next/link";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { useEffect, useState } from "react";
import type { CvSaveInput } from "../../src/services/schemas/cvSave.schema";
import { mapCvToSaveInput } from "../../src/features/cv-editor/mapCvToSaveInput";

export default function CvPage() {
	const router = useRouter();
	const id = typeof router.query.id === "string" ? router.query.id : undefined;

	const { data: cv, isLoading, error } = trpc.cv.byId.useQuery(
		{ id: id! },
		{ enabled: !!id }, // attend que le router ait l'id
	);

    const utils = trpc.useUtils();
    const [draft, setDraft] = useState<CvSaveInput | null>(null);

    useEffect(() => {
        if (cv) setDraft(mapCvToSaveInput(cv));
    }, [cv]);

    const save = trpc.cv.save.useMutation({
        onSuccess: (saved) => {
            setDraft(mapCvToSaveInput(saved)); // récupère les ids serveur
            void utils.cv.byId.invalidate({ id: saved.id });
            void utils.cv.allByUser.invalidate();
        },
    });

	if (!id || isLoading) return <div>Loading...</div>;
	if (error) return <div>Erreur : {error.message}</div>;
	if (!cv) return <div>CV introuvable</div>;

	return (
		// <div>
		// 	<Link href="/">← Retour</Link>
		// 	<h1>{cv.title}</h1>
		// 	<p>Template : {cv.templateId}</p>
		// 	{/* plus tard : header, modules, etc. */}
		// 	<pre>{JSON.stringify(cv, null, 2)}</pre>
		// 	<pre>{JSON.stringify(draft, null, 2)}</pre>

        //     <input
        //         value={draft?.datas.header?.prenom ?? ""}
        //         onChange={(e) =>
        //             setDraft((d) =>
        //             d
        //                 ? {
        //                     ...d,
        //                     datas: {
        //                     ...d.datas,
        //                     header: {
        //                         ...d.datas.header,
        //                         title: d.datas.header?.title ?? d.title,
        //                         prenom: e.target.value,
        //                     },
        //                     },
        //                 }
        //                 : d,
        //             )
        //         }
        //         />
        //         <button
        //             type="button"
        //             disabled={!draft || save.isPending}
        //             onClick={() => draft && save.mutate(draft)}
        //         >
        //             Sauver
        //     </button>
		// </div>
        <div>
			<Link href="/">← Retour</Link>
			<label>
				Titre CV
				<input
					value={draft?.title ?? ""}
					onChange={(e) =>
						setDraft((d) => (d ? { ...d, title: e.target.value } : d))
					}
				/>
			</label>
			<h1>{draft?.title ?? ""}</h1>
			<p>Template : {draft?.templateId ?? ""}</p>
			<label>
				Prénom
				<input
					value={draft?.datas.header?.prenom ?? ""}
					onChange={(e) =>
						setDraft((d) =>
							d
								? {
										...d,
										datas: {
											...d.datas,
											header: {
												...d.datas.header,
												title: d.datas.header?.title ?? d.title,
												prenom: e.target.value,
											},
										},
									}
								: d,
						)
					}
				/>
			</label>
			<button
				type="button"
				disabled={save.isPending}
				onClick={() => draft && save.mutate(draft)}
			>
				{save.isPending ? "Enregistrement…" : "Sauver"}
			</button>
			{save.isSuccess && !save.isPending && <p>Enregistré</p>}
			{save.error && <p>Erreur save : {save.error.message}</p>}
			{/* debug : état local envoyé au save */}
			<pre>{JSON.stringify(draft, null, 2)}</pre>
		</div>
	);
}