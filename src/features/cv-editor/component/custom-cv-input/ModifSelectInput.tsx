import { useFormContext, type Path } from "react-hook-form";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { BreadCrumb } from "primereact/breadcrumb";
import { changeNameSection, changeNameSelectInput } from "@/features/cv-editor/utils/changeName";
import { SelectSize } from "./panel-modif/SelectSize";
import { SelectWeight } from "./panel-modif/SelectHeight";
import { SelectAlign } from "./panel-modif/SelectAlign";
import { SelectColor } from "./panel-modif/SelectColor";
import { SelectAfficherCacher } from "./panel-modif/SelectAfficherCacher";
import { InputSwitch } from "primereact/inputswitch";
import { useEffect, useRef, useState } from "react";
import {
	isSectionTitlePath,
	parseItemSettingsPath,
	syncItemSettingsProp,
	syncSectionTitleProp,
} from "../../utils/utilsCv/syncModif";
import type { CvFormValues } from "@/services/schemas/cvSave.schema";
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema";

export const ModifSelectInput = () => {
	const { watch, setValue, getValues } = useFormContext<CvFormValues>();
	const { selectModifInput, sectionSelected } = useCreateCvContext();
	const watchSelectInput = selectModifInput
		? (watch(selectModifInput as Path<CvFormValues>) as BaseTextSettings | undefined)
		: undefined;
	const modelBreadCrumb = [
		{ label: changeNameSection(sectionSelected) },
		{ label: changeNameSelectInput(selectModifInput) },
	];
	const [sync, setSync] = useState(false);
	const canSyncSection = isSectionTitlePath(selectModifInput);
	const canSyncItem = !!parseItemSettingsPath(selectModifInput);
	const canSync = canSyncSection || canSyncItem;
	const sizeSelect = watchSelectInput?.sizeSelect;
	const weightSelect = watchSelectInput?.weightSelect;
	const colorSelect = watchSelectInput?.colorSelect;
	const textAlign = watchSelectInput?.textAlign;
	const prev = useRef({ sizeSelect, weightSelect, colorSelect, textAlign });

	useEffect(() => {
		if (!sync || !canSync) return;
		const p = prev.current;
		if (sizeSelect !== p.sizeSelect) {
			if (canSyncSection) syncSectionTitleProp(setValue, "sizeSelect", sizeSelect);
			if (canSyncItem)
				syncItemSettingsProp(getValues, setValue, selectModifInput, "sizeSelect", sizeSelect);
		}
		if (weightSelect !== p.weightSelect) {
			if (canSyncSection) syncSectionTitleProp(setValue, "weightSelect", weightSelect);
			if (canSyncItem)
				syncItemSettingsProp(getValues, setValue, selectModifInput, "weightSelect", weightSelect);
		}
		if (colorSelect !== p.colorSelect) {
			if (canSyncSection) syncSectionTitleProp(setValue, "colorSelect", colorSelect);
			if (canSyncItem)
				syncItemSettingsProp(getValues, setValue, selectModifInput, "colorSelect", colorSelect);
		}
		if (textAlign !== p.textAlign) {
			if (canSyncSection) syncSectionTitleProp(setValue, "textAlign", textAlign);
			if (canSyncItem)
				syncItemSettingsProp(getValues, setValue, selectModifInput, "textAlign", textAlign);
		}
		prev.current = { sizeSelect, weightSelect, colorSelect, textAlign };
	}, [sync, canSync, sizeSelect, weightSelect, colorSelect, textAlign, setValue]);

	useEffect(() => {
		prev.current = { sizeSelect, weightSelect, colorSelect, textAlign };
	}, [selectModifInput]); // eslint: intentionnelvolontairement pas watchSelectInput ici

	return (
		<div className="w-full flex flex-col gap-2">
			{selectModifInput !== "" ? (
				<>
					<div className="w-full flex items-center justify-between gap-2">
						<BreadCrumb
							model={modelBreadCrumb}
							className="text-xs mt-1 min-w-0 flex-1 p-0 border-none bg-transparent"
							pt={{
								root: { className: "text-xs py-0" },
								menu: { className: "text-xs gap-0" },
								menuitem: { className: "text-xs" },
								action: { className: "text-xs py-0 px-1" },
								separator: { className: "text-xs mx-0" },
							}}
						/>
						{canSync && (
							<div className="flex flex-col items-center gap-0 shrink-0">
								<span className="text-xs leading-none mb-0.5">Sync</span>
								<InputSwitch
									checked={sync}
									onChange={(e) => setSync(!!e.value)}
									className="scale-75 origin-center"
								/>
							</div>
						)}
					</div>
					<div className="w-full grid grid-cols-1 gap-4">
						<div className="w-full flex justify-between">
							{watchSelectInput?.sizeSelect ? (
								<SelectSize watchSelectInput={watchSelectInput} select={selectModifInput} />
							) : null}
							{watchSelectInput?.weightSelect ? (
								<SelectWeight watchSelectInput={watchSelectInput} select={selectModifInput} />
							) : null}
						</div>
						<div className="w-full flex justify-between gap-2">
							{watchSelectInput?.textAlign ? (
								<SelectAlign
									watchSelectInput={{ textAlign: watchSelectInput.textAlign }}
									select={selectModifInput}
								/>
							) : null}
							{watchSelectInput?.colorSelect ? (
								<SelectColor watchSelectInput={watchSelectInput} select={selectModifInput} />
							) : null}
							<SelectAfficherCacher select={selectModifInput} />
						</div>
					</div>
				</>
			) : (
				<p className="text-sm text-center mt-2">Aucun élément sélectionné</p>
			)}
		</div>
	);
};
