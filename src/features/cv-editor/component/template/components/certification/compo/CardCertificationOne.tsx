import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameCertification } from "@/features/cv-editor/utils/fields/fieldNameCertification";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { CertificationItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ListItem } from "@utils/type";
import { Menu } from "primereact/menu";
import { useRef, type JSX } from "react";
import { useFormContext } from "react-hook-form";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell";
import { CommonListLigne } from "../../common-compo/list/CommonListLigne";
import { TextareaCv } from "@/components/input-writer/input-textarea-cv/InputTextareaCv";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import { CommonPointList } from "../../common-compo/list/CommonPointList";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import { ToolbarOptionsButton } from "@/features/cv-editor/component/template/components/common-compo/section/ToolbarOptionsButton";

export interface CardCertificationOneProps {
	index: number;
	item: ListItem<CertificationItemContentInput>;
	itemSelected: string;
	setItemSelected: (e: string) => void;
	itemsMenu: (idx: number) => {
		label: string;
		items: {
			template: JSX.Element;
		}[];
	}[];
}

export const CardCertificationOne = ({
	index,
	item,
	itemSelected,
	setItemSelected,
	itemsMenu,
}: CardCertificationOneProps) => {
	const { watch, setValue, getValues } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();

	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const pathContent = dataFieldContent(
		"datas.certification.content",
		index,
		"content",
	);
	const watchWithIcon = watchGeneral?.titleSection.withIcon;
	const watchListStyle = watchGeneral?.listStyle;
	const menuLeft = useRef<Menu>(null);

	const watchModelTitleOfCertification = watch(`${pathContent}.settings.title`);
	const watchModelOrganismeCertification = watch(
		`${pathContent}.settings.organismeCertification`,
	);

	const deleteCertification = (
		itemToDelete: ListItem<CertificationItemContentInput>,
	) => {
		const list = (getValues(FieldNameCertification.content) ??
			[]) as ListItem<CertificationItemContentInput>[];

		const newList = list
			.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
			.map((entry, i) => ({ ...entry, order: i + 1 }));

		setValue(FieldNameCertification.content, newList, {
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
			sectionId="certification"
			clientKey={item.clientKey}
			containerId="certification"
			path={FieldNameCertification.content}
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
			onDelete={() => deleteCertification(item)}
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
			<ContentCertificationContainer
				general={watchGeneral}
				item={item}
				certificationNameCompo={
					<TextareaCv
						placeholder="Intitulé de la certification"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.title`);
							setSelectInputForm("");
						}}
						name={`${pathContent}.title`}
						textColor={watchModelTitleOfCertification?.colorSelect}
						dataInput={{
							changeSize: "2px",
							model: watchModelTitleOfCertification,
						}}
						textAlign={"left"}
					/>
				}
				certificationOrganismeCompo={
					<InputTextCv
						placeholder="Organisme de la certification"
						onClick={() => {
							setSelectModifInput(
								`${pathContent}.settings.organismeCertification`,
							);
							setSelectInputForm(
								`${pathContent}.settings.withOrganismeCertification`,
							);
						}}
						name={`${pathContent}.organismeCertification`}
						textColor={watchModelOrganismeCertification?.colorSelect}
						dataInput={{
							changeSize: "1px",
							model: watchModelOrganismeCertification,
						}}
					/>
				}
			/>
		</SectionItemShell>
	);
};

interface ContentCertificationContainerProps {
	general: TemplateLayout;
	item: ListItem<CertificationItemContentInput>;
	certificationNameCompo: JSX.Element;
	certificationOrganismeCompo: JSX.Element;
}

export const ContentCertificationContainer = ({
	general,
	certificationNameCompo,
	certificationOrganismeCompo,
	item,
}: ContentCertificationContainerProps) => {
	return (
		<div className="w-full flex flex-col gap-0 px-2 relative mt-1">
			<CommonPointList general={general} />
			{item?.content?.settings?.withTitle && certificationNameCompo}
			{item?.content?.settings?.withOrganismeCertification &&
				certificationOrganismeCompo}
		</div>
	);
};
