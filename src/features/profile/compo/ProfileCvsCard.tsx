import { AppCard } from "@/components/card/AppCard";
import { TitleAppTwo } from "@/components/title/TitleAppTwo";
import type { ProfileSaveInput } from "@/services/schemas/profileSave.schema";
import { trpc } from "@utils/trpc";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { CV } from "../CompoPage";
import { PreviewImage } from "./common/PreviewImage";
import { mapCvToProfileFormValues } from "../mapCvToProfileFormValues";
import Link from "next/link";

type ProfileCvsCardProps = {
	cvs: CV[] | undefined;
	isLoading: boolean;
	isMd: boolean;
	isSm: boolean;
	onVisionner: (cv: CV) => void;
};

export const ProfileCvsCard = ({
	cvs,
	isLoading,
	isMd,
	isSm,
	onVisionner,
}: ProfileCvsCardProps) => {
	const toast = useRef<Toast>(null);
	const utils = trpc.useUtils();
	const { getValues, reset } = useFormContext<ProfileSaveInput & { id?: string }>();
	const [loadingCvId, setLoadingCvId] = useState<string | null>(null);

	const recoverFromCv = async (cvId: string) => {
		setLoadingCvId(cvId);
		try {
			const cv = await utils.cv.byId.fetch({ id: cvId });
			if (!cv) {
				throw new Error("CV introuvable");
			}
			const current = getValues();
			const mapped = mapCvToProfileFormValues(cv);
			reset(
				{
					...mapped,
					...(current.id != null ? { id: current.id } : {}),
					...(mapped.description != null
						? {
								description: {
									description: mapped.description.description,
									...(current.description?.id != null ? { id: current.description.id } : {}),
								},
							}
						: { description: null }),
					...(mapped.philosophy != null
						? {
								philosophy: {
									citation: mapped.philosophy.citation,
									author: mapped.philosophy.author ?? null,
									...(current.philosophy?.id != null ? { id: current.philosophy.id } : {}),
								},
							}
						: { philosophy: null }),
				},
				{ keepDefaultValues: false },
			);
			toast.current?.show({
				severity: "success",
				summary: "Données récupérées",
				detail: "Le formulaire profil a été rempli avec ce CV. Pensez à enregistrer.",
				life: 4500,
			});
		} catch (err) {
			toast.current?.show({
				severity: "error",
				summary: "Récupération impossible",
				detail: err instanceof Error ? err.message : "Une erreur est survenue.",
				life: 5000,
			});
		} finally {
			setLoadingCvId(null);
		}
	};

	return (
		<>
			<Toast ref={toast} position="top-center" />
			<AppCard className={"min-h-full flex flex-col gap-4"}>
				<TitleAppTwo firstPart={"Vos"} secondPart={"CVs"} size={"text-2xl"} withSpace />
				{isLoading ? (
					<ProgressSpinner
						style={{ width: "50px", height: "50px" }}
						strokeWidth="8"
						fill="var(--surface-ground)"
						animationDuration=".5s"
					/>
				) : (
					<>
						<p>
							Vous avez enregistré {cvs?.length ?? 0} CV
							{(cvs?.length ?? 0) > 1 ? "s" : ""}
						</p>
						<div className="flex w-full justify-center gap-2">
							{cvs &&
								cvs.length > 0 &&
								cvs.map((cv) => {
									const busy = loadingCvId === cv.id;
									return (
										<div key={cv?.id} className="w-full flex flex-col items-center gap-4">
											<PreviewImage
												width={!isMd ? "w-full p-2" : "w-2/3"}
												cv={cv}
												action={
													<>
														{isMd && (
															<Button size="small" onClick={() => onVisionner(cv)}>
																Visionner
															</Button>
														)}
														{isMd && (
															<Link href={`/cv/${cv?.id}`}>
																<Button size="small">Modifier</Button>
															</Link>
														)}
													</>
												}
											/>
											{isSm && (
												<div className="w-full flex justify-center">
													<Button
														loading={busy}
														disabled={loadingCvId != null}
														onClick={(e) => {
															e.preventDefault();
															if (cv.id) void recoverFromCv(cv.id);
														}}
													>
														Récupérer les données du CV
													</Button>
												</div>
											)}
										</div>
									);
								})}
						</div>
					</>
				)}
			</AppCard>
		</>
	);
};
