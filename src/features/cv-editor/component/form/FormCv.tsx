import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { CvFormValues } from "../../../../services/schemas/cvSave.schema";
import { formCvDefaultValue } from "./defaultValue";
import { trpc } from "@utils/trpc";
import type { Color, TemplateCv } from "@utils/trpc.types";
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
import { captureCvPreview } from "../../utils/captureCvPreview";
import { useModelAndColorContext } from "../context/ModelAndColorContext";

interface FormCvProviderProps extends PropsWithChildren {
	idCv: string | null;
	template: string | null;
	color?: string | null;
}

export const FormCv = ({ children, idCv, template, color }: FormCvProviderProps) => {
	const { status } = useSession();
	const { modeles, colors } = useModelAndColorContext();
	const appliedFromUrl = useRef(false);
	const [visibleSelectModel, setVisibleSelectModel] = useState(false);
	const [modelSelect, setModelSelect] = useState<TemplateCv>();
	const [draft, setDraft] = useState<CvFormValues | undefined>(undefined);
	const loadedStampRef = useRef<string | null>(null);
	const utils = trpc.useUtils();
	const { data: dataCv } = trpc.cv.byId.useQuery(
		{ id: idCv as string },
		{ enabled: idCv !== "0", refetchOnMount: "always" },
	);
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

	const methods = useForm<CvFormValues>({
		// resolver: yupResolver(validationSchema),
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

	const showError = () => {
		toast?.current?.show({
			severity: "error",
			summary: "Erreur",
			detail: "Une erreur est survenue lors de la sauvegarde du CV",
			life: 3000,
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

	// useEffect(() => {
	// 	if (idCv !== "0" || template) return;

	// 	const oldDraft = loadGuestCvDraft();
	// 	setDraft(oldDraft?.templateId ? oldDraft : undefined);
	// 	setVisibleSelectModel(true); // toujours
	// }, [idCv, template]);

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

	const onSelectModel = () => {
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

	const onSubmit = async (cv: CvFormValues) => {
		try {
			const saved = await saveCv.mutateAsync(mapFormToSaveInput(cv));
			try {
				const previewUrl = await captureCvPreview();
				if (previewUrl) {
					await setPreview.mutateAsync({ cvId: saved.id, previewUrl });
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
		} catch (err) {
			console.error(err);
			showError();
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

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(onSubmit)}>
				{children}
				<Toast ref={toast} />
				{visibleSelectModel && (
					<DialogSelectModel
						visible={visibleSelectModel}
						onHide={() => setVisibleSelectModel(false)}
						modelSelect={modelSelect}
						setModelSelect={setModelSelect}
						onSelectModel={onSelectModel}
						onResumeDraft={onResumeDraft}
						draft={draft}
					/>
				)}
			</form>
		</FormProvider>
	);
};
