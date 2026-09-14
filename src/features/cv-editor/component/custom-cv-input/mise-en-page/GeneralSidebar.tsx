import { SelectButtonRhf } from "@/components/input/select-button/SelectButton";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { useFormContext } from "react-hook-form";

export const GeneralSidebar = () => {
    const { watch } = useFormContext();
    const pageLayout = watch(FieldNameLayoutGeneral.pageLayout);
    const isTwoCol = pageLayout === "TwoColumnSideBar";
    console.log("isTwoCol", isTwoCol, pageLayout);
    const sidebarSideOptions = [
        { value: "left", name: "Sidebar gauche" },
        { value: "right", name: "Sidebar droite" },
    ];
    const sidebarSideTemplate = (option: { value: string; name: string }) => {
        return <div className="text-sm">{option.name}</div>;
    };
	return (
		<>
			{isTwoCol && (
				<div className="flex gap-6 items-center">
					<p className="my-0 font-semibold text-sm">Sidebar</p>
                    <SelectButtonRhf
                        name={FieldNameLayoutGeneral.sidebarSide}
                        value={watch(FieldNameLayoutGeneral.sidebarSide) ?? "left"}
                        itemTemplate={sidebarSideTemplate}
                        optionValue="value"
                        options={sidebarSideOptions}
                        unselectable={false}
                    />
				</div>
			)}
		</>
	);
};