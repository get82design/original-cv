import { useFormContext } from "react-hook-form";
import { useModelAndColorContext } from "../context/ModelAndColorContext";
import { switchTemplate } from "../../utils/applyTemplateToForm";
import type { CvFormValues } from "@/services/schemas/cvSave.schema";
import { useSession } from "next-auth/react";
import { trpc } from "@utils/trpc";
import { useMemo } from "react";
import { isTemplateLocked } from "../../utils/isTemplateLocked";
import { TemplateCatalogBadges } from "@/components/badge/TemplateCatalogBadges";

export const SelectTemplate = () => {
	const { status } = useSession();
	const { watch, reset, getValues } = useFormContext();
	const watchTemplateId = watch("templateId");
	const { modeles } = useModelAndColorContext();

	const unlockedQuery = trpc.unlockedTemplate.findAll.useQuery(undefined, {
		enabled: status === "authenticated",
	});
	const unlockedIds = useMemo(
		() => new Set((unlockedQuery.data ?? []).map((u) => u.templateId)),
		[unlockedQuery.data],
	);

	return (
		<div className="w-full grid grid-cols-2 gap-4 px-2 py-2">
			{modeles.map((model, idx) => {
				const selected = watchTemplateId === model.id;
				const locked = isTemplateLocked(model, unlockedIds);
				return (
					<div
						className="group w-full h-56 rounded-lg shadow-md relative overflow-hidden cursor-pointer"
						style={{
							border: selected ? "solid 2px var(--primary-color)" : "",
							backgroundImage: `url(/assets/img/${model.name}.png)`,
							backgroundSize: "cover",
							backgroundPosition: "top center",
							backgroundRepeat: "no-repeat",
						}}
						key={idx}
						onClick={() => {
							const next = switchTemplate(getValues() as CvFormValues, model, {
								updateModules: true,
							});
							reset(next);
						}}
					>
						<div className="absolute top-2 right-2 z-20">
							<TemplateCatalogBadges
								isFeatured={model.isFeatured}
								isPremium={model.isPremium}
								locked={locked}
								size="sm"
							/>
						</div>
						<div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/30 transition-colors duration-150 pointer-events-none" />
						<p className="absolute bottom-0 inset-x-0 z-20 text-center text-sm font-semibold px-2 py-1 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150">
							{model.name}
						</p>
					</div>
				);
			})}
		</div>
	);
};
