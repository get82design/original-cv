import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameStat } from "@/features/cv-editor/utils/fields/fieldNameStat";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { StatItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ListItem } from "@utils/type";
import { Menu } from "primereact/menu";
import { useRef, type JSX } from "react";
import { useFormContext } from "react-hook-form";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell";
import { TextareaCv } from "@/components/input-writer/input-textarea-cv/InputTextareaCv";
import { ToolbarOptionsButton } from "@/features/cv-editor/component/template/components/common-compo/section/ToolbarOptionsButton";
import { commitCvFormHistory } from "@/features/cv-editor/utils/cvFormHistoryCommit";

export interface CardStatOneProps {
	index: number;
	item: ListItem<StatItemContentInput>;
	itemSelected: string;
	setItemSelected: (item: string) => void;
	itemsMenu: (idx: number) => {
		label: string;
		items: {
			template: JSX.Element;
		}[];
	}[];
}

export const CardStatOne = ({
	index,
	item,
	itemSelected,
	setItemSelected,
	itemsMenu,
}: CardStatOneProps) => {
	const { watch, setValue, getValues } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();

	const pathContent = dataFieldContent("datas.stat.content", index, "content");
	const menuLeft = useRef<Menu>(null);

	const watchModelValue = watch(`${pathContent}.settings.value`);
	const watchModelLabel = watch(`${pathContent}.settings.label`);

	const deleteStat = (itemToDelete: ListItem<StatItemContentInput>) => {
		const list = (getValues(FieldNameStat.content) ?? []) as ListItem<StatItemContentInput>[];

		const newList = list
			.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
			.map((entry, i) => ({ ...entry, order: i + 1 }));

		commitCvFormHistory();
		setValue(FieldNameStat.content, newList, {
			shouldDirty: true,
			shouldTouch: true,
		});

		const selectionWasInGroup = itemSelected === itemToDelete.clientKey;

		if (selectionWasInGroup) {
			setItemSelected(newList[0]?.clientKey ?? "");
		}
	};

	return (
		<SectionItemShell
			sectionId="stat"
			clientKey={item.clientKey}
			containerId="stat"
			path={FieldNameStat.content}
			itemSelected={itemSelected}
			setItemSelected={setItemSelected}
			className="flex gap-2"
			sortableType="card"
			onDelete={() => deleteStat(item)}
			toolbarExtra={
				itemsMenu ? (
					<>
						<ToolbarOptionsButton menuRef={menuLeft} />
						<Menu model={itemsMenu(index)} popup ref={menuLeft} style={{ width: 300 }} />
					</>
				) : null
			}
		>
			<div className="w-full flex flex-col gap-0 items-center pb-1 px-2 relative mt-1 text-center">
				{item.content.settings?.withValue && (
					<TextareaCv
						placeholder="+50"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.value`);
							setSelectInputForm(`${pathContent}.settings.withValue`);
						}}
						name={`${pathContent}.value`}
						textColor={watchModelValue?.colorSelect}
						dataInput={{
							changeSize: "1px",
							model: watchModelValue,
						}}
						textAlign={watchModelValue?.textAlign ?? "center"}
					/>
				)}
				{item.content.settings?.withLabel && (
					<TextareaCv
						name={`${pathContent}.label`}
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.label`);
							setSelectInputForm(`${pathContent}.settings.withLabel`);
						}}
						placeholder="projets livrés"
						textColor={watchModelLabel?.colorSelect}
						textAlign={watchModelLabel?.textAlign ?? "center"}
						autoResize
						dataInput={{
							changeSize: "1px",
							model: watchModelLabel,
						}}
					/>
				)}
			</div>
		</SectionItemShell>
	);
};
