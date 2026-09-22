import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { FieldNameSocialMedia } from "@/features/cv-editor/utils/fields/fieldNameSocialMedia";
import type { SocialMediaItemContentInput } from "@/services/schemas/cvSave.schema";
import type { ListItem } from "@utils/type";
import { Menu } from "primereact/menu";
import { useRef, type JSX } from "react";
import { useFormContext } from "react-hook-form";
import { SectionItemShell } from "../../common-compo/section/SectionItemShell";
import { SelectSocialIcon } from "@/components/icon/SelectIcon";
import { InputTextCv } from "@/components/input-writer/input-text-cv/InputTextCv";
import type { TemplateLayout } from "@/services/schemas/cvTemplate.schema";
import { ToolbarOptionsButton } from "@/features/cv-editor/component/template/components/common-compo/section/ToolbarOptionsButton";

export interface CardSocialMediaOneProps {
	item: ListItem<SocialMediaItemContentInput>;
	index: number;
	itemSelected: string;
	setItemSelected: (sectionSelected: string) => void;
	itemsMenu: (idx: number) => {
		label: string;
		items: {
			template: JSX.Element;
		}[];
	}[];
}

export const CardSocialMediaOne = ({
	item,
	index,
	itemSelected,
	setItemSelected,
	itemsMenu,
}: CardSocialMediaOneProps) => {
	const { watch, setValue, getValues } = useFormContext();
	const menuLeft = useRef<Menu>(null);
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();

	const watchGeneral = watch(FieldNameLayoutGeneral.layout);
	const pathContent = `datas.socialMedia.content.${index}.content`;
	const watchModelSocialMedia = watch(`${pathContent}.settings.socialNetwork`);
	const watchModelUsername = watch(`${pathContent}.settings.username`);

	const deleteSocialMedia = (itemToDelete: ListItem<SocialMediaItemContentInput>) => {
		const list = (getValues(FieldNameSocialMedia.content) ??
			[]) as ListItem<SocialMediaItemContentInput>[];

		const newList = list
			.filter((entry) => entry.clientKey !== itemToDelete.clientKey)
			.map((entry, i) => ({ ...entry, order: i + 1 }));

		setValue(FieldNameSocialMedia.content, newList, {
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
			clientKey={item.clientKey}
			sectionId="socialMedia"
			containerId="socialMedia"
			path={FieldNameSocialMedia.content}
			itemSelected={itemSelected}
			setItemSelected={setItemSelected}
			sortableType="card"
			onDelete={() => deleteSocialMedia(item)}
			toolbarExtra={
				itemsMenu ? (
					<>
						<ToolbarOptionsButton menuRef={menuLeft} />
						<Menu model={itemsMenu(index)} popup ref={menuLeft} style={{ width: 300 }} />
					</>
				) : null
			}
		>
			<ContentSocialMediaContainer
				general={watchGeneral}
				item={item}
				iconCompo={
					<SelectSocialIcon
						icon={item.content.icon}
						color={item.content?.settings?.iconColor ?? "primaryColor"}
						setIcon={(icon) => {
							setValue(`${pathContent}.icon`, icon);
						}}
						fieldName={`${pathContent}.icon`}
						afficherCacher={`${pathContent}.settings.withIcon`}
					/>
				}
				socialNetworkCompo={
					<InputTextCv
						placeholder="Réseaux social"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.socialNetwork`);
							setSelectInputForm(`${pathContent}.settings.withSocialNetwork`);
						}}
						name={`${pathContent}.socialNetwork`}
						textColor={watchModelSocialMedia?.colorSelect}
						textAlign="left"
						dataInput={{
							changeSize: "2px",
							model: watchModelSocialMedia,
						}}
					/>
				}
				userNameCompo={
					<InputTextCv
						placeholder="Nom d'utilisateur"
						onClick={() => {
							setSelectModifInput(`${pathContent}.settings.username`);
							setSelectInputForm(`${pathContent}.settings.withUsername`);
						}}
						name={`${pathContent}.username`}
						textColor={watchModelUsername?.colorSelect}
						textAlign="left"
						dataInput={{
							changeSize: "2px",
							model: watchModelUsername,
						}}
					/>
				}
			/>
		</SectionItemShell>
	);
};

interface ContentSocialMediaContainerProps {
	general: TemplateLayout;
	item: ListItem<SocialMediaItemContentInput>;
	iconCompo: JSX.Element;
	socialNetworkCompo: JSX.Element;
	userNameCompo: JSX.Element;
}

export const ContentSocialMediaContainer = ({
	general,
	item,
	iconCompo,
	socialNetworkCompo,
	userNameCompo,
}: ContentSocialMediaContainerProps) => {
	return (
		<div className="w-full flex gap-2 px-2 relative items-center mt-1">
			{item.content?.settings?.withIcon && iconCompo}
			<div className="flex flex-col gap-0">
				{item.content?.settings?.withSocialNetwork && socialNetworkCompo}
				<div className="-mt-1">{item.content?.settings?.withUsername && userNameCompo}</div>
			</div>
		</div>
	);
};
