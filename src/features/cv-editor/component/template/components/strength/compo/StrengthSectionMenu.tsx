import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";
import { Menu } from "primereact/menu";
import { useFormContext } from "react-hook-form";
import { useRef } from "react";
import { RadioRhf } from "@/components/input/radio/RadioRhf";

export const StrengthSectionMenu = () => {
    const menuRef = useRef<Menu>(null);
	const { watch } = useFormContext();
	const modules = watch("modules");
	const pathDesign = moduleField(modules, "strength", "settings", "content");

	const strengthMod = modules?.find((m: { type: string }) => m.type === "strength");
    const inSidebar = (strengthMod?.column ?? 0) === 0;

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
			<button
				type="button"
				className="p-2 cursor-pointer"
				onClick={(e) => {
					e.stopPropagation();
					menuRef.current?.toggle(e);
				}}
			>
				options
			</button>
			<Menu model={items} popup ref={menuRef} style={{ width: 300 }} />
		</>
	);
}