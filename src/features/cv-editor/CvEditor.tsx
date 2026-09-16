import { useSession } from "next-auth/react";
import { useMediaQuery } from "@utils/useWindowWidth";
import { TitleAppOne } from "@/components/title/TitleAppOne";
import { useFormContext } from "react-hook-form";
import type { TemplateModule } from "@/services/schemas/cvTemplate.schema";
import { useEffect, useState } from "react";
import { OneColumnModel } from "./component/kit-dnd/one-column-model/OneColumnModel";
import {
	clearEditorSelection,
	useCreateCvContext,
} from "./component/context/CreateCvContext";
import type { ItemGeneralProps } from "@utils/type";
import {
	compactActiveOrders,
	nextActiveOrderInColumn,
} from "@/utils/moduleOrder";
import { PageLayoutRegister } from "./component/kit-dnd/register/PageLayoutRegister";
import { getCvTypographyVars } from "./utils/utilsCv/font";
import type { CvFormValues } from "@/services/schemas/cvSave.schema";
import { trpc } from "@utils/trpc";
import { SpeedDial } from "primereact/speeddial";
import { Tooltip } from "primereact/tooltip";
import { DialogDataFromProfile } from "./component/dialog/dataFromProfile/DialogDataFromProfile";
import {
	CV_MODIF_DOCK_WIDTH,
	CvModifDock,
} from "./component/custom-cv-input/CvModifDock";

export const CvEditor = () => {
	const { data } = trpc.cv.allByUser.useQuery();
	console.log(data);
	const { data: session, status } = useSession();
	const { data: profile } = trpc.profile.completeMe.useQuery();
	const [itemNoUse, setItemNoUse] = useState<TemplateModule[]>([]);
	const [visibleDialogDataFromProfile, setVisibleDialogDataFromProfile] =
		useState(false);
	const [dockOpen, setDockOpen] = useState(false);
	const {
		getValues,
		setValue,
		watch,
		formState: { isSubmitting },
	} = useFormContext();
	const isLg = useMediaQuery("(min-width: 1024px)");
	const isXl = useMediaQuery("(min-width: 1440px)");
	const modules = watch("modules") as TemplateModule[];
	const { setSectionSelected, setSelectModifInput, setSelectInputForm } =
		useCreateCvContext();
	const typography = watch("layoutGeneral.layout.typography");

	// XL : dock toujours ouvert. LG : repliable, fermé par défaut.
	const dockCollapsible = isLg && !isXl;

	useEffect(() => {
		if (isXl) setDockOpen(true);
		else if (dockCollapsible) setDockOpen(false);
	}, [isXl, dockCollapsible]);

	useEffect(() => {
		if (!modules) return;
		setItemNoUse(modules?.filter((module) => module.isActive === false));
	}, [modules]);

	useEffect(() => {
		const onPointerDown = (e: PointerEvent) => {
			const target = e.target as HTMLElement | null;
			if (!target) return;

			// Dock modifications → ne rien faire (ne ferme pas, ne clear pas)
			if (target.closest("#modele-cv-modif")) return;

			if (target.closest(".p-dialog, .p-menu, .p-overlaypanel")) return;

			if (target.closest(".cv-page-document")) {
				if (
					target.closest(
						"input, textarea, .section-card, [data-cv-selectable]",
					)
				)
					return;
			}

			if (target.closest(".p-dialog")) return;

			clearEditorSelection({
				setSelectModifInput,
				setSelectInputForm,
				setSectionSelected,
			});
		};

		document.addEventListener("pointerdown", onPointerDown);
		return () => document.removeEventListener("pointerdown", onPointerDown);
	}, [setSelectModifInput, setSelectInputForm, setSectionSelected]);

	const addItem = (item: TemplateModule) => {
		if (!modules) return;
		if (modules.some((m) => m.type === item.type && m.isActive)) return;
		const target = modules.find((m) => m.type === item.type);
		const column = target?.column ?? 0;
		const newOrder = nextActiveOrderInColumn(modules, column);
		const updated = modules.map((mod) =>
			mod.type === item.type
				? { ...mod, isActive: true, order: newOrder }
				: mod,
		);
		setValue("modules", compactActiveOrders(updated), { shouldDirty: true });
	};

	const deleteSection = (item: ItemGeneralProps) => {
		if (!modules) return;

		const type = item.id.replace("section-", "");
		const deactivated = modules.map((mod) =>
			mod.type === type ? { ...mod, isActive: false } : mod,
		);
		const compacted = compactActiveOrders(deactivated);

		setValue("modules", compacted, { shouldDirty: true });
		setSectionSelected("");
		setSelectInputForm?.("");
		setSelectModifInput("");
	};

	const key =
		watch("layoutGeneral.defaultStyles.components.pageLayout") ??
		"OneColumnModel";
	const PageLayout = PageLayoutRegister[key] ?? OneColumnModel;

	const items = [
		{
			label: "Générer mon QR Code",
			icon: "pi pi-qrcode",
			command: () => {},
		},
		{
			label: "Fiche métier",
			icon: "pi pi-clipboard",
			command: () => {},
		},
		{
			label: "Quelques tips",
			icon: "pi pi-info-circle",
			command: () => {},
		},
		{
			label: "Données du profil",
			icon: "pi pi-refresh",
			command: () => {
				setVisibleDialogDataFromProfile(true);
			},
		},
	];

	const dockVisible = isLg && (isXl || dockOpen);
	const cvWidth = !isLg
		? "100vw"
		: dockVisible
			? `calc(100vw - ${CV_MODIF_DOCK_WIDTH + 80}px)`
			: status === "authenticated"
				? "calc(100vw - 110px)"
				: "100vw";

	return (
		<>
			<div className="my-8 px-8 lg:hidden">
				Pour l&apos;instant vous ne pouvez pas créer de CV en mode mobile.
			</div>
			<div className="hidden w-full lg:flex flex-row-reverse justify-end gap-8 relative">
				{profile && (
					<>
						<DialogDataFromProfile
							visible={visibleDialogDataFromProfile}
							onHide={() => setVisibleDialogDataFromProfile(false)}
							profile={profile}
						/>
						<Tooltip
							target=".speeddial-bottom-right .p-speeddial-action"
							position="left"
						/>
						<SpeedDial
							className="speeddial-bottom-right"
							model={items}
							radius={120}
							type="quarter-circle"
							direction="down-left"
							style={{ position: "fixed", right: 10, top: 88 }}
						/>
					</>
				)}
				<div className="w-full">
					<div className="w-full flex gap-8 my-4">
						<div
							className="flex flex-col items-center gap-12 relative"
							style={{ width: cvWidth }}
						>
							<div className="w-full px-4 xl:px-0 flex justify-between items-center">
								<TitleAppOne
									firstPart="Créer"
									secondPart="votre CV"
									withSpace
								/>
							</div>
							<div
								id="modele-cv-page"
								style={{
									...getCvTypographyVars(typography),
									fontFamily: "var(--cv-font-body)",
								}}
								className="cv-root ml-0 lg:ml-4 xl:ml-0 flex flex-col gap-4"
							>
								<PageLayout deleteSection={deleteSection} />
							</div>
						</div>

						{isLg && (
							<CvModifDock
								open={isXl ? true : dockOpen}
								onOpenChange={setDockOpen}
								collapsible={dockCollapsible}
								itemNoUse={itemNoUse}
								addItem={addItem}
								status={status}
								isSubmitting={isSubmitting}
								getValues={() => getValues() as CvFormValues}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
};
