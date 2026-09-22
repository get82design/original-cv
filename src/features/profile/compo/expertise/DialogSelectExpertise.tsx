import type { ExpertiseInput, ProfileSaveInput } from "@/services/schemas/profileSave.schema";
import type { CvFull } from "@utils/trpc.types";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { Dialog, type DialogProps } from "primereact/dialog";
import { PickList, type PickListChangeEvent } from "primereact/picklist";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

type CvExpertise = NonNullable<CvFull>["expertises"][number];
type ProfileExpertiseItem = NonNullable<ProfileSaveInput["expertises"]>[number];

function cvExpertiseToProfile(exp: CvExpertise): ProfileExpertiseItem {
	return {
		clientKey: `expertise-${uuid()}`,
		order: exp.order,
		content: {
			title: exp.title,
			level: exp.level,
		},
	};
}

interface DialogSelectExpertiseProps extends DialogProps {
	listExpertiseFromCv: CvExpertise[];
	listExpertiseInProfile: ProfileExpertiseItem[];
	setListExpertise: (list: ProfileExpertiseItem[]) => void;
}

export const DialogSelectExpertise = ({
	visible,
	onHide,
	listExpertiseFromCv,
	listExpertiseInProfile,
	setListExpertise,
}: DialogSelectExpertiseProps) => {
	const [source, setSource] = useState<ProfileExpertiseItem[]>([]);
	const [target, setTarget] = useState<ProfileExpertiseItem[]>([]);

	const onChange = (event: PickListChangeEvent) => {
		setSource(event.source);
		setTarget(event.target);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!visible) return;
		setTarget(listExpertiseInProfile);
		const already = new Set(
			listExpertiseInProfile.map((e) => `${e.content.title}|${e.content.level ?? ""}`),
		);
		setSource(
			listExpertiseFromCv
				.map((exp) => cvExpertiseToProfile(exp))
				.filter((e) => !already.has(`${e.content.title}|${e.content.level ?? ""}`)),
		);
	}, [visible, listExpertiseFromCv]);

	const templateFooter = () => {
		return (
			<div className="w-full flex justify-end gap-2">
				<Button outlined label="Annuler" onClick={onHide} size="small" />
				<Button
					label="Valider"
					size="small"
					onClick={() => {
						setListExpertise(target);
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
			header="Selectionnez vos expertises"
			style={{ minWidth: "1100px" }}
			footer={templateFooter}
		>
			<PickList
				dataKey="clientKey"
				source={source}
				target={target}
				onChange={onChange}
				itemTemplate={(exp: ListItem<ExpertiseInput>) => (
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
