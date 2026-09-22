import type { CompetenceGroupInput, ProfileSaveInput } from "@/services/schemas/profileSave.schema";
import type { CvFull } from "@utils/trpc.types";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { Dialog, type DialogProps } from "primereact/dialog";
import { PickList, type PickListChangeEvent } from "primereact/picklist";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

type CvCompetenceGroup = NonNullable<CvFull>["competences"][number];
type ProfileCompetenceGroupItem = NonNullable<ProfileSaveInput["competenceGroups"]>[number];

function cvCompetenceGroupToProfile(exp: CvCompetenceGroup): ProfileCompetenceGroupItem {
	return {
		clientKey: `competenceGroup-${uuid()}`,
		order: exp.order,
		content: {
			title: exp.title,
			competences:
				exp.cvCompetences?.map((c) => ({
					clientKey: `competence-${uuid()}`,
					order: c.order,
					content: { name: c.competence.name, competenceId: c.competenceId },
				})) ?? [],
		},
	};
}

interface DialogSelectCompetenceGroupProps extends DialogProps {
	listCompetenceGroupFromCv: CvCompetenceGroup[];
	listCompetenceGroupInProfile: ProfileCompetenceGroupItem[];
	setListCompetenceGroup: (list: ProfileCompetenceGroupItem[]) => void;
}

export const DialogSelectCompetenceGroup = ({
	visible,
	onHide,
	listCompetenceGroupFromCv,
	listCompetenceGroupInProfile,
	setListCompetenceGroup,
}: DialogSelectCompetenceGroupProps) => {
	const [source, setSource] = useState<ProfileCompetenceGroupItem[]>([]);
	const [target, setTarget] = useState<ProfileCompetenceGroupItem[]>([]);

	const onChange = (event: PickListChangeEvent) => {
		setSource(event.source);
		setTarget(event.target);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!visible) return;
		setTarget(listCompetenceGroupInProfile);
		const already = new Set(listCompetenceGroupInProfile.map((e) => `${e.content.title}`));
		setSource(
			listCompetenceGroupFromCv
				.map((exp) => cvCompetenceGroupToProfile(exp))
				.filter((e) => !already.has(`${e.content.title}`)),
		);
	}, [visible, listCompetenceGroupFromCv]);

	const templateFooter = () => {
		return (
			<div className="w-full flex justify-end gap-2">
				<Button outlined label="Annuler" onClick={onHide} size="small" />
				<Button
					label="Valider"
					size="small"
					onClick={() => {
						setListCompetenceGroup(target);
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
			header="Selectionnez vos compétences"
			style={{ minWidth: "1100px" }}
			footer={templateFooter}
		>
			<PickList
				dataKey="clientKey"
				source={source}
				target={target}
				onChange={onChange}
				itemTemplate={(exp: ListItem<CompetenceGroupInput>) => (
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
