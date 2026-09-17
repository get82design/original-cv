import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { FieldNameStrength } from "@/features/cv-editor/utils/fields/fieldNameStrength";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { StrengthItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ListItem } from "@utils/type";
import { Menu } from "primereact/menu";
import { useRef, type JSX } from "react";
import { useFormContext } from "react-hook-form";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell";
import { CommonListLigne } from "../../common-compo/list/CommonListLigne";
import { SelectBasicIcon } from "@/components/icon/SelectIcon";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import { TextareaCv } from "@/components/input-writer/input-textarea-cv/InputTextareaCv";
import { CommonPointList } from "../../common-compo/list/CommonPointList";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import { ToolbarOptionsButton } from "@/features/cv-editor/component/template/components/common-compo/section/ToolbarOptionsButton";

export interface CardStrengthOneProps {
	index: number;
	item: ListItem<StrengthItemContentInput>;
	itemSelected: string;
	setItemSelected: (item: string) => void;
	itemsMenu: (idx: number) => {
		label: string;
		items: {
			template: JSX.Element;
		}[];
	}[];
}

export const CardStrengthOne = ({
	index,
	item,
	itemSelected,
	setItemSelected,
	itemsMenu,
}: CardStrengthOneProps) => {
	const { watch, setValue, getValues } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();

	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const pathContent = dataFieldContent(
		"datas.strength.content",
		index,
		"content",
	);
	const watchWithIcon = watchGeneral?.titleSection.withIcon;
	const watchListStyle = watchGeneral?.listStyle;
	const menuLeft = useRef<Menu>(null);

	const watchModelStrength = watch(`${pathContent}.settings.strength`);
	const watchModelDescription = watch(`${pathContent}.settings.description`);

	const deleteStrength = (itemToDelete: ListItem<StrengthItemContentInput>) => {
		const list = (getValues(FieldNameStrength.content) ??
			[]) as ListItem<StrengthItemContentInput>[];

		const newList = list
			.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
			.map((entry, i) => ({ ...entry, order: i + 1 }));

		setValue(FieldNameStrength.content, newList, {
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
			sectionId="strength"
			clientKey={item.clientKey}
			containerId="strength"
			path={FieldNameStrength.content}
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
			onDelete={() => deleteStrength(item)}
			toolbarExtra={
				itemsMenu ? (
					<>
						<ToolbarOptionsButton menuRef={menuLeft} />
						<Menu
							model={itemsMenu(index)}
							popup
							ref={menuLeft}
							style={{ width: 300 }}
						/>
					</>
				) : null
			}
		>
			<ContentStrengthContainer
				general={watchGeneral}
				item={item}
				iconComponent={
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
				titleCompo={
					<TextareaCv
						placeholder="Quel est votre atout ?"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.strength`);
							setSelectInputForm(`${pathContent}.settings.withStrength`);
						} }
						name={`${pathContent}.title`}
						textColor={watchModelStrength?.colorSelect}
						dataInput={{
							changeSize: "1px",
							model: watchModelStrength,
						}} 
						textAlign={watchModelStrength.textAlign}					/>
				}
				descriptionCompo={
					<TextareaCv
						name={`${pathContent}.description`}
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.description`);
							setSelectInputForm(`${pathContent}.settings.withDescription`);
						}}
						placeholder="Décrivez nous cette compétence et comment vous l'avez acquise?"
						textColor={watchModelDescription?.colorSelect}
						textAlign={watchModelDescription?.textAlign}
						autoResize
						dataInput={{
							changeSize: "1px",
							model: watchModelDescription,
						}}
					/>
				}
			/>
		</SectionItemShell>
	);
};

interface ContentStrngthContainerProps {
	general: TemplateLayout;
	item: ListItem<StrengthItemContentInput>;
	iconComponent: JSX.Element;
	titleCompo: JSX.Element;
	descriptionCompo: JSX.Element;
}

export const ContentStrengthContainer = ({
	general,
	item,
	iconComponent,
	titleCompo,
	descriptionCompo,
}: ContentStrngthContainerProps) => {
	return (
		<div className="flex gap-3 items-start pb-1 px-2 relative mt-1">
			<CommonPointList general={general} withIconMarge />
			{item.content.settings?.withIcon && iconComponent}
			<div className="w-full flex flex-col gap-0">
				{item.content.settings?.withStrength && titleCompo}
				{item.content.settings?.withDescription && descriptionCompo}
			</div>
		</div>
	);
};
