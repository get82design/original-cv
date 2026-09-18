import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import { FormProvider, useForm, type FieldErrors, type Resolver } from "react-hook-form";
import type { CvFormValues } from "../../../../services/schemas/cvSave.schema";
import { formCvDefaultValue } from "./defaultValue";
import { trpc } from "@utils/trpc";
import type { TemplateCv } from "@utils/trpc.types";
import { DialogSelectModel } from "./DialogSelectModel";
import { applyTemplateToForm } from "../../utils/applyTemplateToForm";
import {
	clearGuestCvDraft,
	loadGuestCvDraft,
	saveGuestCvDraft,
} from "../../utils/guestCvDraft";
import { mapCvToSaveInput, mapFormToSaveInput } from "../../mapCvToSaveInput";
import { useRouter } from "next/router";
import { Toast } from "primereact/toast";
import { useSession } from "next-auth/react";
import { switchTemplate } from "../../utils/applyTemplateToForm";
import { clearTemplateCache } from "../../utils/templateCache";
import { captureDownloadPreviews } from "../../utils/captureCvPreview";
import { useModelAndColorContext } from "../context/ModelAndColorContext";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@server/api/root";
import { mapProfileToCvDatas } from "./mapProfileToCvDatas";
import { zodResolver } from "@hookform/resolvers/zod";
import { cvValidationSchema } from "./validationSchema";
import { DialogCvLimitReached } from "../dialog/DialogCvLimitReached";

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type ProfileComplete = NonNullable<RouterOutputs["profile"]["completeMe"]>;

const isCvLimitError = (err: unknown) =>
	err instanceof Error && err.message.includes("Limite de CV atteinte");

interface FormCvProviderProps extends PropsWithChildren {
	idCv: string | null;
	template: string | null;
	color?: string | null;
}

function applyProfileToNext(
	next: CvFormValues,
	profile: ProfileComplete,
	model: TemplateCv,
  ) {
	next.photo = profile.photo ?? null;
	next.title = `CV - ${profile.firstName} ${profile.lastName}`;
	next.datas = {
	  ...next.datas,
	  ...mapProfileToCvDatas(profile, model),
	};
	return next;
}

export const FormCv = ({ children, idCv, template, color }: FormCvProviderProps) => {
	const { status } = useSession();
	const { modeles, colors } = useModelAndColorContext();
	const appliedFromUrl = useRef(false);
	const [visibleSelectModel, setVisibleSelectModel] = useState(false);
	const [visibleLimitDialog, setVisibleLimitDialog] = useState(false);
	const [replacingCv, setReplacingCv] = useState(false);
	const [modelSelect, setModelSelect] = useState<TemplateCv>();
	const [draft, setDraft] = useState<CvFormValues | undefined>(undefined);
	const loadedStampRef = useRef<string | null>(null);
	const utils = trpc.useUtils();
	const { data: dataCv } = trpc.cv.byId.useQuery(
		{ id: idCv as string },
		{ enabled: idCv !== "0", refetchOnMount: "always" },
	);
	const { data: userCvs, isLoading: loadingUserCvs } =
		trpc.cv.allByUser.useQuery(undefined, {
			enabled: visibleLimitDialog && status === "authenticated",
		});
	const needsTemplate =
		!!dataCv &&
		(dataCv.layoutGeneral == null ||
			Object.keys(dataCv.layoutGeneral as object).length === 0);
	const { data: dataTemplate } = trpc.cvTemplate.findById.useQuery(
		{ id: dataCv?.templateId ?? "" },
		{ enabled: needsTemplate },
	);
	const router = useRouter();
	const saveCv = trpc.cv.save.useMutation();
	const setPreview = trpc.cv.setPreview.useMutation();
	const toast = useRef<Toast>(null);
	const optionsProfile = [{label: 'Non', value: false}, {label: 'Oui', value: true}];
    const [withProfileValue, setWithProfileValue] = useState(false);
	const { data: profile } = trpc.profile.completeMe.useQuery();
	

	const methods = useForm<CvFormValues>({
		resolver: zodResolver(cvValidationSchema) as Resolver<CvFormValues>,
		shouldFocusError: false, //! Régler l'erreur quand shouldFocus est à true
		mode: "onSubmit",
		defaultValues: formCvDefaultValue,
	});
	const {
		handleSubmit,
		// formState: { errors },
		reset,
		watch,
		getValues,
		setValue,
	} = methods;

	const watchAll = watch();

	const showSuccess = () => {
		toast?.current?.show({
			severity: "success",
			summary: "Succès",
			detail: "Le CV a été sauvegardé avec succès",
			life: 3000,
		});
	};

	const showError = (detail?: string) => {
		toast?.current?.show({
			severity: "error",
			summary: "Erreur",
			detail: detail || "Une erreur est survenue lors de la sauvegarde du CV",
			life: 4000,
		});
	};

	const showInfo = (detail: string) => {
		toast?.current?.show({
			severity: "info",
			summary: "Bientôt",
			detail,
			life: 4000,
		});
	};

	useEffect(() => {
		if (status !== "unauthenticated") return; // pas de save si connecté
		if (idCv !== "0") return; // pas de save si CV existant
		const timeout = setTimeout(() => {
			saveGuestCvDraft(watchAll as CvFormValues);
		}, 10000); // 10s après le dernier changement
		return () => clearTimeout(timeout);
	}, [watchAll, status, idCv]);

	useEffect(() => {
		if (status !== "unauthenticated" || idCv !== "0") return;
		const handler = () => saveGuestCvDraft(getValues() as CvFormValues);
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [status, idCv, getValues]);

	useEffect(() => {
		if (idCv !== "0" || template) return;

		const oldDraft = loadGuestCvDraft();
		setDraft(oldDraft?.templateId ? oldDraft : undefined);
		setVisibleSelectModel(true); // toujours
	}, [idCv, template]);

	useEffect(() => {
		if (idCv !== "0" || !template || appliedFromUrl.current) return;
		if (!modeles.length) return;

		const model = modeles.find((m) => m.name === template);
		if (!model) {
			setVisibleSelectModel(true); // nom inconnu → dialog
			return;
		}
		appliedFromUrl.current = true;
		clearGuestCvDraft();
		clearTemplateCache();

		const next = switchTemplate(formCvDefaultValue, model, {
			updateModules: true,
		});
		if (color && next.layoutGeneral?.defaultStyles) {
			const fromUrl = colors.find((c) => c.name === color);
			if (fromUrl) {
			    next.layoutGeneral.defaultStyles.primaryColor = fromUrl;
			}
		}
		if (profile) {
			applyProfileToNext(next, profile, model);
		}
		reset(next);
	}, [idCv, template, modeles, reset, color, colors]);

	useEffect(() => {
		if (!dataCv) return;
		if (needsTemplate && !dataTemplate) return; // attendre le template
		const stamp = `${dataCv.id}:${new Date(dataCv.updatedAt).toISOString()}`;
		if (loadedStampRef.current === stamp) return;
		loadedStampRef.current = stamp;
		const base = mapCvToSaveInput(dataCv);
		reset(
			needsTemplate && dataTemplate
				? applyTemplateToForm(base, dataTemplate)
				: base,
		);
	}, [dataCv, dataTemplate, needsTemplate, reset]);

	const onSelectModel = (withProfile: boolean) => {
		console.log("withProfile", withProfile);
		if (modelSelect) {
			clearGuestCvDraft();
			clearTemplateCache();
			setDraft(undefined);
			const picked = getValues("layoutGeneral.defaultStyles.primaryColor");
			const next = switchTemplate(formCvDefaultValue, modelSelect, {
				updateModules: true,
			});
			if (next.layoutGeneral?.defaultStyles && picked) {
				next.layoutGeneral.defaultStyles.primaryColor = picked;
			}
			if (profile && withProfile) {
				applyProfileToNext(next, profile, modelSelect);
			}
			reset(next);
			setVisibleSelectModel(false);
		}
	};

	const onResumeDraft = () => {
		if (draft) {
			reset(draft);
			setVisibleSelectModel(false);
		}
	};

	const persistCv = async (cv: CvFormValues) => {
		const saved = await saveCv.mutateAsync(mapFormToSaveInput(cv));
		try {
			const { withLogo, withoutLogo } = await captureDownloadPreviews();
			if (withLogo && withoutLogo) {
				await setPreview.mutateAsync({
					cvId: saved.id,
					previewUrl: withLogo,
					previewUrlClean: withoutLogo,
				});
			}
		} catch {
			// le save a déjà réussi
		}
		reset(mapCvToSaveInput(saved));
		loadedStampRef.current = `${saved.id}:${new Date(saved.updatedAt).toISOString()}`;
		utils.cv.byId.setData({ id: saved.id }, saved);
		await Promise.all([
			utils.cv.byId.invalidate({ id: saved.id }),
			utils.cv.allByUser.invalidate(),
		]);
		clearGuestCvDraft();
		clearTemplateCache();
		if (idCv !== saved.id) await router.replace(`/cv/${saved.id}`);
		showSuccess();
	};

	const onSubmit = async (cv: CvFormValues) => {
		try {
			await persistCv(cv);
		} catch (err) {
			console.error(err);
			if (isCvLimitError(err)) {
				setVisibleLimitDialog(true);
				return;
			}
			const message =
				err instanceof Error && err.message ? err.message : undefined;
			showError(message);
		}
	};

	const onReplaceExistingCv = async (targetCvId: string) => {
		setReplacingCv(true);
		try {
			setValue("cvId", targetCvId, { shouldDirty: true });
			await persistCv({ ...getValues(), cvId: targetCvId });
			setVisibleLimitDialog(false);
		} catch (err) {
			console.error(err);
			const message =
				err instanceof Error && err.message ? err.message : undefined;
			showError(message);
		} finally {
			setReplacingCv(false);
		}
	};

	useEffect(() => {
		const handler = () => clearTemplateCache();
		window.addEventListener("pagehide", handler);
		return () => window.removeEventListener("pagehide", handler);
	}, []);

	const wasAuth = useRef(status === "authenticated");
	useEffect(() => {
		if (wasAuth.current && status === "unauthenticated") {
			clearGuestCvDraft();
			clearTemplateCache();
		}
		wasAuth.current = status === "authenticated";
	}, [status]);

	function flattenErrors(errors: FieldErrors, prefix = ""): string[] {
		const messages: string[] = [];
		for (const [key, value] of Object.entries(errors)) {
		  if (!value) continue;
		  const path = prefix ? `${prefix}.${key}` : key;
		  if (typeof value === "object" && "message" in value && value.message) {
			messages.push(String(value.message));
		  } else if (typeof value === "object") {
			messages.push(...flattenErrors(value as FieldErrors, path));
		  }
		}
		return messages;
	}
	
	const showValidationErrors = (errors: FieldErrors) => {
		const messages = flattenErrors(errors);
		if (!messages.length) return;
		toast.current?.show({
		  severity: "error",
		  summary: "Champs à corriger",
		//   detail: messages.join("\n"),
		  detail: (
			<ul className="m-0 pl-4 list-disc">
			  {messages.map((m) => (
				<li key={m}>{m}</li>
			  ))}
			</ul>
		  ),
		  life: 6000,
		});
	};

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(onSubmit, showValidationErrors)}>
				{children}
				<Toast ref={toast} position="top-center" />
				{visibleSelectModel && (
					<DialogSelectModel
						visible={visibleSelectModel}
						onHide={() => setVisibleSelectModel(false)}
						modelSelect={modelSelect}
						setModelSelect={setModelSelect}
						onSelectModel={onSelectModel}
						onResumeDraft={onResumeDraft}
						draft={draft}
						withProfileValue={withProfileValue}
						setWithProfileValue={setWithProfileValue}
						optionsProfile={optionsProfile}
						profile={profile ?? undefined}
					/>
				)}
				<DialogCvLimitReached
					visible={visibleLimitDialog}
					onHide={() => setVisibleLimitDialog(false)}
					cvs={userCvs ?? []}
					loading={loadingUserCvs}
					replacing={replacingCv}
					onReplace={onReplaceExistingCv}
					onBuySlot={() =>
						showInfo(
							"L'achat d'emplacement de CV sera bientôt disponible.",
						)
					}
				/>
			</form>
		</FormProvider>
	);
};
