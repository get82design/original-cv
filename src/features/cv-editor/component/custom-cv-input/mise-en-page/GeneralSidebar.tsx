import { SelectButtonRhf } from "@/components/input/select-button/SelectButton";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { useFormContext } from "react-hook-form";

export const GeneralSidebar = () => {
	const { watch } = useFormContext();
	const pageLayout = watch(FieldNameLayoutGeneral.pageLayout);
	const isTwoCol = pageLayout === "TwoColumnSideBar";
	const sidebarSideOptions = [
		{ value: "left", name: "Sidebar gauche" },
		{ value: "right", name: "Sidebar droite" },
	];
	const sidebarSideTemplate = (option: { value: string; name: string }) => {
		return <div className="text-xs">{option.name}</div>;
	};
	return (
		<>
			{isTwoCol && (
				<div className="flex gap-3 items-center">
					<p className="my-0 font-semibold text-xs">Sidebar</p>
					<SelectButtonRhf
						name={FieldNameLayoutGeneral.sidebarSide}
						value={watch(FieldNameLayoutGeneral.sidebarSide) ?? "left"}
						itemTemplate={sidebarSideTemplate}
						optionValue="value"
						options={sidebarSideOptions}
						unselectable={false}
						pt={{
							button: {
								className: "p-button-sm text-xs py-1 px-2.5 min-h-[2rem]",
							},
						}}
					/>
				</div>
			)}
		</>
	);
};
