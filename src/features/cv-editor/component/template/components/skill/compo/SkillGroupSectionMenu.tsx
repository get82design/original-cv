import { RadioRhf } from "@/components/input/radio/RadioRhf";
import { moduleField } from "@/features/cv-editor/utils/fields/moduleField";
import { clampItemColumns } from "@/features/cv-editor/utils/utilsCv/cols";
import { Menu } from "primereact/menu";
import { useRef } from "react";
import { useFormContext } from "react-hook-form";

export const SkillGroupSectionMenu = () => {
    const menuRef = useRef<Menu>(null);
	const { watch, setValue, getValues } = useFormContext();
    const modules = watch("modules");
	const pathDesign = moduleField(modules, "skill", "settings", "content");

    const applyGroupColumns = (next: 1 | 2 | 3) => {
        setValue(columnsPath, next, { shouldDirty: true });
        const groups = getValues("datas.skillGroup.content") ?? [];
        groups.forEach((_: unknown, idx: number) => {
          const path = `datas.skillGroup.content.${idx}.content.settings.itemColumns`;
          const current = getValues(path);
          const clamped = clampItemColumns(next, current);
          if (Number(current) !== clamped) {
            setValue(path, clamped, { shouldDirty: true });
          }
        });
    };

	// → modules.{i}.settings.content
	const columnsPath = `${pathDesign}.groupColumns`;
	const watchColumns = watch(columnsPath);
	const items = [
		{
			label: "Options",
			items: [
				{
					template: (
						<div className="flex flex-col py-1 px-4 gap-2">
							<p>Nombre de colonnes</p>
							<div className="grid grid-cols-3 gap-6">
								<RadioRhf
									name={columnsPath}
									label="1"
									value={1}
									checked={Number(watchColumns) === 1}
                                    onChange={() => applyGroupColumns(1)}
								/>
								<RadioRhf
									name={columnsPath}
									label="2"
									value={2}
									checked={Number(watchColumns) === 2}
                                    onChange={() => applyGroupColumns(2)}
								/>
                                <RadioRhf
									name={columnsPath}
									label="3"
									value={3}
									checked={Number(watchColumns) === 3}
                                    onChange={() => applyGroupColumns(3)}
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
}