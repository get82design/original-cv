import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameSocialMedia } from "@/features/cv-editor/utils/fields/fieldNameSocialMedia";
import type { SocialMediaItemContentInput } from "@/services/schemas/cvSave.schema";
import {
	horizontalListSortingStrategy,
	SortableContext,
} from "@dnd-kit/sortable";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { useFormContext } from "react-hook-form";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import type { SocialMediaCardProps } from "../../../register/social-media/SocialMediaCardRegister";
import { COL_CLASS } from "@/features/cv-editor/utils/utilsCv/cols";
import type { SocialMediaContentSettings } from "@/services/schemas/cvTemplate.schema";

interface SocialMediaDndProps {
	watchSocialMedias: ListItem<SocialMediaItemContentInput>[];
	itemSelected: string;
	setItemSelected: (sectionSelected: string) => void;
	createNewItem: () => ListItem<SocialMediaItemContentInput>;
	colOfSocialMedia: SocialMediaContentSettings["columns"];
	CardComponent: React.ComponentType<SocialMediaCardProps>;
}

export const SocialMediaDnd = ({
	watchSocialMedias,
	itemSelected,
	setItemSelected,
	createNewItem,
	colOfSocialMedia,
	CardComponent,
}: SocialMediaDndProps) => {
	const { setSectionSelected, sectionSelected } = useCreateCvContext();
	const showAddSocialMedia = sectionSelected === "section-socialMedia";
	return (
		<SortableContext
			items={watchSocialMedias.map((s) => s.clientKey)}
			strategy={horizontalListSortingStrategy}
		>
			<div
				className={`socialMedia-grid grid ${COL_CLASS[colOfSocialMedia as keyof typeof COL_CLASS] ?? "grid-cols-3"} ${colOfSocialMedia === 1 ? "gap-1" : "gap-x-4 gap-y-1"} min-h-[30px]`}
			>
				<CompoSocialMediaDnd
					socialMedias={watchSocialMedias}
					itemSelected={itemSelected}
					setItemSelected={setItemSelected}
					setSectionSelected={setSectionSelected}
					showAddSocialMedia={showAddSocialMedia}
					createNewItem={createNewItem}
					CardComponent={CardComponent}
				/>
			</div>
		</SortableContext>
	);
};

interface CompoSocialMediaDndProps {
	socialMedias: ListItem<SocialMediaItemContentInput>[];
	itemSelected: string;
	setItemSelected: (e: string) => void;
	setSectionSelected: (e: string) => void;
	showAddSocialMedia: boolean;
	createNewItem: () => ListItem<SocialMediaItemContentInput>;
	CardComponent: React.ComponentType<SocialMediaCardProps>;
}

export const CompoSocialMediaDnd = ({
	socialMedias,
	itemSelected,
	setItemSelected,
	setSectionSelected,
	showAddSocialMedia,
	createNewItem,
	CardComponent,
}: CompoSocialMediaDndProps) => {
	const { setValue } = useFormContext();
	const itemsMenu = (idx: number) => {
		const pathContent = dataFieldContent(
			"datas.socialMedia.content",
			idx,
			"content.settings",
		);
		return [
			{
				label: "Options",
				items: [
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Réseau social</p>
								<ToggleAfficherCacher
									name={`${pathContent}.withSocialNetwork`}
								/>
							</div>
						),
					},
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Nom d'utilisateur</p>
								<ToggleAfficherCacher name={`${pathContent}.withUsername`} />
							</div>
						),
					},
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Icône</p>
								<ToggleAfficherCacher name={`${pathContent}.withIcon`} />
							</div>
						),
					},
				],
			},
		];
	};
	return (
		<>
			{socialMedias.map((socialMedia, index) => (
				<div
					// role="button"
					// tabIndex={0}
					className="socialMedia-card w-full"
					key={socialMedia.clientKey}
					// onClick={(e) => {
					// 	e.stopPropagation();
					// 	setItemSelected(socialMedia.clientKey);
					// 	setSectionSelected("section-socialMedia"); // global : sa section
					// }}
				>
					<CardComponent
						index={index}
						item={socialMedia}
						itemSelected={itemSelected} // local
						setItemSelected={setItemSelected} // local
						itemsMenu={itemsMenu}
					/>
				</div>
			))}
			{showAddSocialMedia && (
				<Button
					type="button"
					outlined
					icon="pi pi-plus"
					size="small"
					onClick={(e) => {
						e.stopPropagation();
						const fresh = createNewItem();
						setValue(
							FieldNameSocialMedia.content,
							[...socialMedias, { ...fresh, order: socialMedias.length + 1 }],
							{ shouldDirty: true },
						);
					}}
				/>
			)}
		</>
	);
};
