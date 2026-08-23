import { useRef } from "react";
import { Menu } from "primereact/menu";
import { useFormContext } from "react-hook-form";
import { RadioRhf } from "@/components/input/radio/RadioRhf";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";

export const PassionSectionMenu = () => {
	const menuRef = useRef<Menu>(null);
	const { watch } = useFormContext();
	const modules = watch("modules");
	const pathDesign = moduleField(modules, "passion", "settings", "content");

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
							<div className="grid grid-cols-3 gap-2">
								<RadioRhf
									name={columnsPath}
									label="2"
									value="2"
									checked={watchColumns === "2"}
								/>
								<RadioRhf
									name={columnsPath}
									label="3"
									value="3"
									checked={watchColumns === "3"}
								/>
								<RadioRhf
									name={columnsPath}
									label="4"
									value="4"
									checked={watchColumns === "4"}
								/>
							</div>
						</div>
					),
				},
			],
		},
	];
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
};
