import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNameLanguage } from "@/features/cv-editor/utils/fields/fieldNameLanguage";
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Button } from "primereact/button";
import { useFormContext } from "react-hook-form";
import type { ListItem } from "@utils/type";
import type { LanguageItemContentInput } from "@/services/schemas/cvSave.schema";
import type { LanguageCardProps } from "../../../register/language/LanguageCardRegister";
import { COL_CLASS } from "@/features/cv-editor/utils/utilsCv/cols";

interface LanguageDndProps {
	watchLanguages: ListItem<LanguageItemContentInput>[];
	itemSelected: string;
	setItemSelected: (e: string) => void;
	createNewItem: () => ListItem<LanguageItemContentInput>;
	colOfLanguage: number;
	CardComponent: React.ComponentType<LanguageCardProps>;
}

export const LanguageDnd = ({
	watchLanguages,
	itemSelected,
	setItemSelected,
	createNewItem,
	colOfLanguage = 4,
	CardComponent,
}: LanguageDndProps) => {
	const { setSectionSelected, sectionSelected } = useCreateCvContext();
	const showAddLanguage = sectionSelected === "section-language";
	return (
		<SortableContext
			items={watchLanguages.map((s) => s.clientKey)}
			strategy={horizontalListSortingStrategy}
		>
			<div
				className={`language-grid grid ${COL_CLASS[colOfLanguage as keyof typeof COL_CLASS] ?? "grid-cols-4"} gap-x-2 gap-y-0 min-h-[30px]`}
			>
				<CompoLanguageDnd
					languages={watchLanguages}
					itemSelected={itemSelected}
					setItemSelected={setItemSelected}
					setSectionSelected={setSectionSelected}
					showAddLanguage={showAddLanguage}
					createNewItem={createNewItem}
					CardComponent={CardComponent}
				/>
			</div>
		</SortableContext>
	);
};

interface CompoLanguageDndProps {
	languages: ListItem<LanguageItemContentInput>[];
	itemSelected: string;
	setItemSelected: (e: string) => void;
	setSectionSelected: (e: string) => void;
	showAddLanguage: boolean;
	createNewItem: () => ListItem<LanguageItemContentInput>;
	CardComponent: React.ComponentType<LanguageCardProps>;
}

export const CompoLanguageDnd = ({
	languages,
	itemSelected,
	setItemSelected,
	setSectionSelected,
	showAddLanguage,
	createNewItem,
	CardComponent,
}: CompoLanguageDndProps) => {
	const { setValue } = useFormContext();
	return (
		<>
			{languages.map((language, index) => (
				<button
					type="button"
					className="language-card"
					key={language.clientKey}
					onClick={(e) => {
						e.stopPropagation();
						setItemSelected(language.clientKey);
						setSectionSelected("section-language"); // global : sa section
					}}
				>
					<CardComponent
						index={index}
						item={language}
						itemSelected={itemSelected} // local
						setItemSelected={setItemSelected} // local
					/>
				</button>
			))}
			{showAddLanguage && (
				<Button
					type="button"
					outlined
					icon="pi pi-plus"
					size="small"
					onClick={(e) => {
						e.stopPropagation();
						const fresh = createNewItem();
						setValue(
							FieldNameLanguage.content,
							[...languages, { ...fresh, order: languages.length + 1 }],
							{ shouldDirty: true },
						);
					}}
				/>
			)}
		</>
	);
};
