import type { ListItem } from "@utils/type";
import type { PassionItemContentInput } from "@/services/schemas/cvSave.schema";
import { useRef, type JSX } from "react";
import { useFormContext } from "react-hook-form";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import { Menu } from "primereact/menu";
import { FieldNamePassion } from "@/features/cv-editor/utils/fields/fieldNamePassion";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell";
import { CommonListLigne } from "../../common-compo/list/CommonListLigne";
import { SelectBasicIcon } from "@/components/icon/SelectIcon";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import { CommonPointList } from "../../common-compo/list/CommonPointList";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import { TextareaCv } from "@/components/input-writer/input-textarea-cv/InputTextareaCv";
import { ToolbarOptionsButton } from "@/features/cv-editor/component/template/components/common-compo/section/ToolbarOptionsButton";

export interface CardPassionOneProps {
	index: number;
	item: ListItem<PassionItemContentInput>;
	itemSelected: string;
	setItemSelected: (e: string) => void;
	itemsMenu: (idx: number) => {
		label: string;
		items: {
			template: JSX.Element;
		}[];
	}[];
}

export const CardPassionOne = ({
	index,
	item,
	itemSelected,
	setItemSelected,
	itemsMenu,
}: CardPassionOneProps) => {
	const { watch, setValue, getValues } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();

	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const pathContent = dataFieldContent("datas.passion.content", index, "content");
	const watchWithIcon = watchGeneral?.titleSection.withIcon;
	const watchListStyle = watchGeneral?.listStyle;
	const menuLeft = useRef<Menu>(null);

	const watchModelTitleOfPassion = watch(`${pathContent}.settings.passion`);

	const deletePassion = (itemToDelete: ListItem<PassionItemContentInput>) => {
		const list = (getValues(FieldNamePassion.content) ?? []) as ListItem<PassionItemContentInput>[];

		const newList = list
			.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
			.map((entry, i) => ({ ...entry, order: i + 1 }));

		setValue(FieldNamePassion.content, newList, {
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
			sectionId="passion"
			clientKey={item.clientKey}
			containerId="passion"
			path={FieldNamePassion.content}
			itemSelected={itemSelected}
			setItemSelected={setItemSelected}
			className="flex gap-2"
			sortableType="card"
			leading={
				<CommonListLigne
					watchWithIcon={watchWithIcon}
					watchListStyle={watchListStyle}
					color="gray-500"
				/>
			}
			onDelete={() => deletePassion(item)}
			toolbarExtra={
				itemsMenu ? (
					<>
						<ToolbarOptionsButton menuRef={menuLeft} />
						<Menu model={itemsMenu(index)} popup ref={menuLeft} style={{ width: 300 }} />
					</>
				) : null
			}
		>
			<ContentPassionContainer
				general={watchGeneral}
				item={item}
				iconCompo={
					<SelectBasicIcon
						icon={item.content.icon ?? ""}
						color={item.content?.settings?.iconColor ?? "primaryColor"}
						setIcon={(icon) => {
							setValue(`${pathContent}.icon`, icon);
						}}
						fieldName={`${pathContent}.icon`}
						afficherCacher={`${pathContent}.settings.withIcon`}
					/>
				}
				passionCompo={
					<TextareaCv
						placeholder="Passion / intérêt"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.passion`);
							setSelectInputForm("");
						}}
						name={`${pathContent}.title`}
						textColor={watchModelTitleOfPassion?.colorSelect}
						dataInput={{
							changeSize: "1px",
							model: watchModelTitleOfPassion,
						}}
						textAlign={watchModelTitleOfPassion?.textAlign ?? "left"}
					/>
				}
			/>
		</SectionItemShell>
	);
};

interface ContentPassionContainerProps {
	general: TemplateLayout;
	item: ListItem<PassionItemContentInput>;
	iconCompo: JSX.Element;
	passionCompo: JSX.Element;
}

export const ContentPassionContainer = ({
	general,
	item,
	iconCompo,
	passionCompo,
}: ContentPassionContainerProps) => {
	return (
		<div className="w-full flex gap-2 px-2 relative passion-correctif-apercu">
			<CommonPointList
				general={general}
				// withoutLigne
				// withIconMarge={item.content.withIcon}
			/>
			<div className="w-full flex gap-2 items-center mt-1 passion-correctif-apercu-plus bottom-two-correctif">
				{item?.content?.settings?.withIcon && iconCompo}
				{passionCompo}
			</div>
		</div>
	);
};
