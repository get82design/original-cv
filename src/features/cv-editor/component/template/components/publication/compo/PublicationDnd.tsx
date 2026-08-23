import { ToggleAfficherCacher } from "@/components/input/toggle-button/AfficherCacher";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { FieldNamePublication } from "@/features/cv-editor/utils/fields/fieldNamePublication";
import { dataFieldContent } from "@/features/cv-editor/utils/fields/moduleField";
import type { PublicationItemContentInput } from "@/services/schemas/cvSave.schema";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { useFormContext } from "react-hook-form";
import { MdAdd } from "react-icons/md";
import type { PublicationCardProps } from "../../../register/publication/PublicationCardRegister";

interface PublicationDndProps {
	watchPublications: ListItem<PublicationItemContentInput>[];
	itemSelected: string;
	setItemSelected: (e: string) => void;
	createNewItem: () => ListItem<PublicationItemContentInput>;
	CardComponent: React.ComponentType<PublicationCardProps>;
}

export const PublicationDnd = ({
	watchPublications,
	itemSelected,
	setItemSelected,
	createNewItem,
	CardComponent,
}: PublicationDndProps) => {
	const { setSectionSelected, sectionSelected } = useCreateCvContext();
	const { setValue } = useFormContext();
	const itemsMenu = (idx: number) => {
		const pathContent = dataFieldContent(
			"datas.publication.content",
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
								<p>Titre</p>
								<ToggleAfficherCacher name={`${pathContent}.withTitle`} />
							</div>
						),
					},
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Période</p>
								<ToggleAfficherCacher name={`${pathContent}.withPeriode`} />
							</div>
						),
					},
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Nom du journal</p>
								<ToggleAfficherCacher name={`${pathContent}.withJournalName`} />
							</div>
						),
					},
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>Description</p>
								<ToggleAfficherCacher name={`${pathContent}.withDescription`} />
							</div>
						),
					},
					{
						template: (
							<div className="flex justify-between py-1 px-4 items-center">
								<p>URL</p>
								<ToggleAfficherCacher name={`${pathContent}.withUrl`} />
							</div>
						),
					},
				],
			},
		];
	};

	const showAddPublication = sectionSelected === "section-publication";

	return (
		<SortableContext
			items={watchPublications.map((s) => s.clientKey)}
			strategy={verticalListSortingStrategy}
		>
			<div className="publications-grid">
				{watchPublications.map((publication, index) => (
					<button
						type="button"
						className="publication-card w-full"
						key={publication.clientKey}
						onClick={(e) => {
							e.stopPropagation();
							setItemSelected(publication.clientKey);
							setSectionSelected("section-publication"); // global : sa section
						}}
					>
						<CardComponent
							index={index}
							item={publication}
							itemSelected={itemSelected} // local
							setItemSelected={setItemSelected} // local
							itemsMenu={itemsMenu}
						/>
					</button>
				))}
				{showAddPublication && (
					<Button
						type="button"
						outlined
						size="small"
						className="flex gap-2"
						onClick={(e) => {
							e.stopPropagation();
							const fresh = createNewItem();
							setValue(
								FieldNamePublication.content,
								[
									...watchPublications,
									{ ...fresh, order: watchPublications.length + 1 },
								],
								{ shouldDirty: true },
							);
						}}
					>
						<MdAdd /> <span>Ajouter une publication</span>
					</Button>
				)}
			</div>
		</SortableContext>
	);
};
