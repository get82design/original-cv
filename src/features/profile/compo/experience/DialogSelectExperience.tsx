import type { ExperienceInput, ProfileSaveInput } from "@/services/schemas/profileSave.schema";
import type { CvFull } from "@utils/trpc.types";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { Dialog, type DialogProps } from "primereact/dialog";
import { PickList, type PickListChangeEvent } from "primereact/picklist";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

type CvExperience = NonNullable<CvFull>["experiences"][number];
type ProfileExperienceItem = NonNullable<ProfileSaveInput["experiences"]>[number];

function cvExperienceToProfile(exp: CvExperience): ProfileExperienceItem {
	return {
		clientKey: `experience-${uuid()}`,
		order: exp.order,
		content: {
			title: exp.title,
			start: exp.start,
			end: exp.end,
			location: exp.location,
			description: exp.description,
			company: exp.company,
			missions:
				exp.cvMissions?.map((m) => ({
					clientKey: `mission-${uuid()}`,
					order: m.order,
					content: { content: m.content },
				})) ?? [],
		},
	};
}

interface DialogSelectExperienceProps extends DialogProps {
	listExperienceFromCv: CvExperience[];
	listExperienceInProfile: ProfileExperienceItem[];
	setListExperience: (list: ProfileExperienceItem[]) => void;
}

export const DialogSelectExperience = ({
	visible,
	onHide,
	listExperienceFromCv,
	listExperienceInProfile,
	setListExperience,
}: DialogSelectExperienceProps) => {
	const [source, setSource] = useState<ProfileExperienceItem[]>([]);
	const [target, setTarget] = useState<ProfileExperienceItem[]>([]);

	const onChange = (event: PickListChangeEvent) => {
		setSource(event.source);
		setTarget(event.target);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!visible) return;
		setTarget(listExperienceInProfile);
		const already = new Set(
			listExperienceInProfile.map((e) => `${e.content.title}|${e.content.company ?? ""}`),
		);
		setSource(
			listExperienceFromCv
				.map((exp) => cvExperienceToProfile(exp))
				.filter((e) => !already.has(`${e.content.title}|${e.content.company ?? ""}`)),
		);
	}, [visible, listExperienceFromCv]);

	const templateFooter = () => {
		return (
			<div className="w-full flex justify-end gap-2">
				<Button outlined label="Annuler" onClick={onHide} size="small" />
				<Button
					label="Valider"
					size="small"
					onClick={() => {
						setListExperience(target);
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
			header="Selectionnez vos expériences"
			style={{ minWidth: "1100px" }}
			footer={templateFooter}
		>
			<PickList
				dataKey="clientKey"
				source={source}
				target={target}
				onChange={onChange}
				itemTemplate={(exp: ListItem<ExperienceInput>) => (
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
