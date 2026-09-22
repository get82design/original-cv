import { useRef } from "react";
import { Menu } from "primereact/menu";
import { useFormContext } from "react-hook-form";
import { RadioRhf } from "@/components/input/radio/RadioRhf";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";
import { ToolbarOptionsButton } from "@/features/cv-editor/component/template/components/common-compo/section/ToolbarOptionsButton";

export const LanguageSectionMenu = () => {
	const menuRef = useRef<Menu>(null);
	const { watch } = useFormContext();
	const modules = watch("modules");
	const pathDesign = moduleField(modules, "language", "settings", "content");

	const languageMod = modules?.find((m: { type: string }) => m.type === "language");
	const inSidebar = (languageMod?.column ?? 0) === 0;

	// → modules.{i}.settings.content
	const designPath = `${pathDesign}.design`;
	const columnsPath = `${pathDesign}.columns`;
	const watchDesign = watch(designPath);
	const watchColumns = watch(columnsPath);
	const items = [
		{
			label: "Options",
			items: [
				{
					template: (
						<div className="flex flex-col py-1 px-4 gap-2">
							<p>Affichage du niveau</p>
							<div className="grid grid-cols-2 gap-2">
								<RadioRhf
									name={designPath}
									label="Stars"
									value="stars"
									checked={watchDesign === "stars"}
								/>
								<RadioRhf
									name={designPath}
									label="Dots"
									value="dots"
									checked={watchDesign === "dots"}
								/>
								<RadioRhf
									name={designPath}
									label="Bars"
									value="bars"
									checked={watchDesign === "bars"}
								/>
							</div>
						</div>
					),
				},
				...(!inSidebar
					? [
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
						]
					: []),
			],
		},
	];
	return (
		<>
			<ToolbarOptionsButton menuRef={menuRef} />
			<Menu model={items} popup ref={menuRef} style={{ width: 300 }} />
		</>
	);
};
