import type { ProfileSaveInput, TagGroupInput } from "@/services/schemas/profileSave.schema";
import type { CvFull } from "@utils/trpc.types";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { Dialog, type DialogProps } from "primereact/dialog";
import { PickList, type PickListChangeEvent } from "primereact/picklist";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

type CvTagGroup = NonNullable<CvFull>["tagGroups"][number];
type ProfileTagGroupItem = NonNullable<ProfileSaveInput["tagGroups"]>[number];

function cvTagGroupToProfile(exp: CvTagGroup): ProfileTagGroupItem {
	return {
		clientKey: `tagGroup-${uuid()}`,
		order: exp.order,
		content: {
			title: exp.title,
			tags: exp.tags.map((t) => ({
				clientKey: `tag-${uuid()}`,
				order: t.order,
				content: { name: t.tag.name, tagId: t.tagId },
			})),
		},
	};
}

interface DialogSelectTagGroupProps extends DialogProps {
	listTagGroupFromCv: CvTagGroup[];
	listTagGroupInProfile: ProfileTagGroupItem[];
	setListTagGroup: (list: ProfileTagGroupItem[]) => void;
}

export const DialogSelectTagGroup = ({
	visible,
	onHide,
	listTagGroupFromCv,
	listTagGroupInProfile,
	setListTagGroup,
}: DialogSelectTagGroupProps) => {
	const [source, setSource] = useState<ProfileTagGroupItem[]>([]);
	const [target, setTarget] = useState<ProfileTagGroupItem[]>([]);

	const onChange = (event: PickListChangeEvent) => {
		setSource(event.source);
		setTarget(event.target);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset picklist uniquement à l'ouverture du dialog
	useEffect(() => {
		if (!visible) return;
		setTarget(listTagGroupInProfile);
		const already = new Set(listTagGroupInProfile.map((e) => `${e.content.title}`));
		setSource(
			listTagGroupFromCv
				.map((exp) => cvTagGroupToProfile(exp))
				.filter((e) => !already.has(`${e.content.title}`)),
		);
	}, [visible]);

	const templateFooter = () => {
		return (
			<div className="w-full flex justify-end gap-2">
				<Button outlined label="Annuler" onClick={onHide} size="small" />
				<Button
					label="Valider"
					size="small"
					onClick={() => {
						setListTagGroup(target);
						onHide();
					}}
				/>
			</div>
		);
	};
	return (
		<Dialog
			visible={visible}
			onHide={onHide}
			className="dialog-profile-from-cv"
			header="Selectionnez vos groupes de tags"
			style={{ minWidth: "1100px" }}
			footer={templateFooter}
		>
			<PickList
				dataKey="clientKey"
				source={source}
				target={target}
				onChange={onChange}
				itemTemplate={(exp: ListItem<TagGroupInput>) => (
					<p className="font-semibold">{exp.content.title}</p>
				)}
				breakpoint="1280px"
				sourceHeader="A rajouter"
				targetHeader="A enregistrer"
				sourceStyle={{ height: "24rem" }}
				targetStyle={{ height: "24rem" }}
			/>
		</Dialog>
	);
};
