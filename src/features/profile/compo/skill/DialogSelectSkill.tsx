import type { ProfileSaveInput, SkillGroupInput } from "@/services/schemas/profileSave.schema";
import type { CvFull } from "@utils/trpc.types";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { Dialog, type DialogProps } from "primereact/dialog";
import { PickList, type PickListChangeEvent } from "primereact/picklist";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

type CvSkillGroup = NonNullable<CvFull>["skillGroups"][number];
type ProfileSkillGroupItem = NonNullable<ProfileSaveInput["skillGroups"]>[number];

function cvSkillGroupToProfile(exp: CvSkillGroup): ProfileSkillGroupItem {
	return {
		clientKey: `skillGroup-${uuid()}`,
		order: exp.order,
		content: {
			title: exp.title,
			skills: exp.skills.map((s) => ({
				clientKey: `skill-${uuid()}`,
				order: s.order,
				content: { name: s.skill.name, level: s.level },
			})),
		},
	};
}

interface DialogSelectSkillGroupProps extends DialogProps {
	listSkillGroupFromCv: CvSkillGroup[];
	listSkillGroupInProfile: ProfileSkillGroupItem[];
	setListSkillGroup: (list: ProfileSkillGroupItem[]) => void;
}

export const DialogSelectSkillGroup = ({
	visible,
	onHide,
	listSkillGroupFromCv,
	listSkillGroupInProfile,
	setListSkillGroup,
}: DialogSelectSkillGroupProps) => {
	const [source, setSource] = useState<ProfileSkillGroupItem[]>([]);
	const [target, setTarget] = useState<ProfileSkillGroupItem[]>([]);

	const onChange = (event: PickListChangeEvent) => {
		setSource(event.source);
		setTarget(event.target);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!visible) return;
		setTarget(listSkillGroupInProfile);
		const already = new Set(listSkillGroupInProfile.map((e) => `${e.content.title}`));
		setSource(
			listSkillGroupFromCv
				.map((exp) => cvSkillGroupToProfile(exp))
				.filter((e) => !already.has(`${e.content.title}`)),
		);
	}, [visible, listSkillGroupFromCv]);

	const templateFooter = () => {
		return (
			<div className="w-full flex justify-end gap-2">
				<Button outlined label="Annuler" onClick={onHide} size="small" />
				<Button
					label="Valider"
					size="small"
					onClick={() => {
						setListSkillGroup(target);
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
			header="Selectionnez vos groupes de compétences"
			style={{ minWidth: "1100px" }}
			footer={templateFooter}
		>
			<PickList
				dataKey="clientKey"
				source={source}
				target={target}
				onChange={onChange}
				itemTemplate={(exp: ListItem<SkillGroupInput>) => (
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
