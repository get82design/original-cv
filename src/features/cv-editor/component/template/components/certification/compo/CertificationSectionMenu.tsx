import { RadioRhf } from "@/components/input/radio/RadioRhf";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";
import { Menu } from "primereact/menu";
import { useFormContext } from "react-hook-form";
import { useRef } from "react";
import { ToolbarOptionsButton } from "@/features/cv-editor/component/template/components/common-compo/section/ToolbarOptionsButton";

export const CertificationSectionMenu = () => {
    const menuRef = useRef<Menu>(null);
	const { watch } = useFormContext();
	const modules = watch("modules");
	const pathDesign = moduleField(modules, "certification", "settings", "content");

	const certificationMod = modules?.find((m: { type: string }) => m.type === "certification");
    const inSidebar = (certificationMod?.column ?? 0) === 0;

	// → modules.{i}.settings.content
	const columnsPath = `${pathDesign}.columns`;
	const watchColumns = watch(columnsPath);
	const items = [
		{
			label: "Options",
			items: [
				{
					template: (
						<div className="flex flex-col py-1 px-4 gap-2">
							<p>Nombre de colonnes</p>
							<div className="grid grid-cols-2 gap-6">
								<RadioRhf
									name={columnsPath}
									label="1"
									value="1"
									checked={watchColumns === "1"}
								/>
								<RadioRhf
									name={columnsPath}
									label="2"
									value="2"
									checked={watchColumns === "2"}
								/>
							</div>
						</div>
					),
				},
			],
		},
	];
	
	if (inSidebar) return null;

	return (
		<>
			<ToolbarOptionsButton menuRef={menuRef} />
			<Menu model={items} popup ref={menuRef} style={{ width: 300 }} />
		</>
	);
}