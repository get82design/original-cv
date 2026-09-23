import type { ProfileSaveInput, VolunteeringInput } from "@/services/schemas/profileSave.schema";
import type { CvFull } from "@utils/trpc.types";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { Dialog, type DialogProps } from "primereact/dialog";
import { PickList, type PickListChangeEvent } from "primereact/picklist";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

type CvVolunteering = NonNullable<CvFull>["volunteerings"][number];
type ProfileVolunteeringItem = NonNullable<ProfileSaveInput["volunteerings"]>[number];

function cvVolunteeringToProfile(exp: CvVolunteering): ProfileVolunteeringItem {
	return {
		clientKey: `volunteering-${uuid()}`,
		order: exp.order,
		content: {
			title: exp.title,
			start: exp.start,
			end: exp.end,
			location: exp.location,
			description: exp.description,
			organisation: exp.organisation,
			missions:
				exp.cvMissions?.map((m) => ({
					clientKey: `mission-${uuid()}`,
					order: m.order,
					content: { content: m.content },
				})) ?? [],
		},
	};
}

interface DialogSelectVolunteeringProps extends DialogProps {
	listVolunteeringFromCv: CvVolunteering[];
	listVolunteeringInProfile: ProfileVolunteeringItem[];
	setListVolunteering: (list: ProfileVolunteeringItem[]) => void;
}

export const DialogSelectVolunteering = ({
	visible,
	onHide,
	listVolunteeringFromCv,
	listVolunteeringInProfile,
	setListVolunteering,
}: DialogSelectVolunteeringProps) => {
	const [source, setSource] = useState<ProfileVolunteeringItem[]>([]);
	const [target, setTarget] = useState<ProfileVolunteeringItem[]>([]);

	const onChange = (event: PickListChangeEvent) => {
		setSource(event.source);
		setTarget(event.target);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset picklist uniquement à l'ouverture du dialog
	useEffect(() => {
		if (!visible) return;
		setTarget(listVolunteeringInProfile);
		const already = new Set(
			listVolunteeringInProfile.map((e) => `${e.content.title}|${e.content.organisation ?? ""}`),
		);
		setSource(
			listVolunteeringFromCv
				.map((exp) => cvVolunteeringToProfile(exp))
				.filter((e) => !already.has(`${e.content.title}|${e.content.organisation ?? ""}`)),
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
						setListVolunteering(target);
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
				itemTemplate={(exp: ListItem<VolunteeringInput>) => (
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
