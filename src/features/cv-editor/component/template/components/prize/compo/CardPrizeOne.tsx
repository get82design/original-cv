import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { FieldNamePrize } from "@/features/cv-editor/utils/fields/fieldNamePrize";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { PrizeItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ListItem } from "@utils/type";
import { Menu } from "primereact/menu";
import { useRef, type JSX } from "react";
import { useFormContext } from "react-hook-form";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell";
import { CommonListLigne } from "../../common-compo/list/CommonListLigne";
import { SelectBasicIcon } from "@/components/icon/SelectIcon";
import { TextareaCv } from "@/components/input-writer/input-textarea-cv/InputTextareaCv";
import { CommonPointList } from "../../common-compo/list/CommonPointList";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import { ToolbarOptionsButton } from "@/features/cv-editor/component/template/components/common-compo/section/ToolbarOptionsButton";

export interface CardPrizeOneProps {
	index: number;
	item: ListItem<PrizeItemContentInput>;
	itemSelected: string;
	setItemSelected: (item: string) => void;
	itemsMenu: (idx: number) => {
		label: string;
		items: {
			template: JSX.Element;
		}[];
	}[];
}

export const CardPrizeOne = ({
	index,
	item,
	itemSelected,
	setItemSelected,
	itemsMenu,
}: CardPrizeOneProps) => {
	const { watch, setValue, getValues } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();

	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const pathContent = dataFieldContent("datas.prize.content", index, "content");
	const watchWithIcon = watchGeneral?.titleSection.withIcon;
	const watchListStyle = watchGeneral?.listStyle;
	const menuLeft = useRef<Menu>(null);

	const watchModelPrize = watch(`${pathContent}.settings.title`);
	const watchModelDomaine = watch(`${pathContent}.settings.domaine`);

	const deletePrize = (itemToDelete: ListItem<PrizeItemContentInput>) => {
		const list = (getValues(FieldNamePrize.content) ??
			[]) as ListItem<PrizeItemContentInput>[];

		const newList = list
			.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
			.map((entry, i) => ({ ...entry, order: i + 1 }));

		setValue(FieldNamePrize.content, newList, {
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
			sectionId="prize"
			clientKey={item.clientKey}
			containerId="prize"
			path={FieldNamePrize.content}
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
			onDelete={() => deletePrize(item)}
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
			<ContentPrizeContainer
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
				prixNameCompo={
					<TextareaCv
						name={`${pathContent}.title`}
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.title`);
							setSelectInputForm(`${pathContent}.settings.withTitle`);
						}}
						placeholder="Votre prix"
						textColor={watchModelPrize?.colorSelect}
						textAlign={watchModelPrize?.textAlign}
						autoResize
						dataInput={{
							changeSize: "1px",
							model: watchModelPrize,
						}}
					/>
				}
				prixDomaineCompo={
					<TextareaCv
						name={`${pathContent}.domaine`}
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.domaine`);
							setSelectInputForm(`${pathContent}.settings.withDomain`);
						}}
						className="-mt-2"
						placeholder="dicerné par"
						textColor={watchModelDomaine?.colorSelect}
						textAlign={watchModelDomaine?.textAlign}
						autoResize
						dataInput={{
							changeSize: "1px",
							model: watchModelDomaine,
						}}
					/>
				}
			/>
		</SectionItemShell>
	);
};

interface ContentPrizeContainerProps {
	general: TemplateLayout;
	prixNameCompo: JSX.Element;
	prixDomaineCompo: JSX.Element;
	item: ListItem<PrizeItemContentInput>;
	iconCompo: JSX.Element;
}

export const ContentPrizeContainer = ({
	general,
	prixNameCompo,
	prixDomaineCompo,
	item,
	iconCompo,
}: ContentPrizeContainerProps) => {
	return (
		<div className="w-full flex gap-2 px-2 items-center relative mt-1">
			<CommonPointList general={general} withoutLigne withIconMarge />
			{item.content?.settings?.withIcon && iconCompo}
			<div className="w-full flex flex-col gap-0 -mt-1">
				{item.content?.settings?.withTitle && prixNameCompo}
				{item.content?.settings?.withDomain && prixDomaineCompo}
			</div>
		</div>
	);
};
