import { useMemo } from "react";
import { buildItemUse } from "./SectionCatalog";
import { useFormContext } from "react-hook-form";

export function useCvSectionItems(column?: number) {
	const { watch } = useFormContext();
	const watchModules = watch("modules");
	const watchTemplateConfig = watch("layoutGeneral.defaultStyles");
	return useMemo(
		() => buildItemUse(watchModules ?? [], watchTemplateConfig, column),
		[watchModules, watchTemplateConfig, column],
	);
}
