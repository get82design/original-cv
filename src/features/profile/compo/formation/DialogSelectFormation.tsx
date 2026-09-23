import type { FormationInput, ProfileSaveInput } from "@/services/schemas/profileSave.schema";
import type { CvFull } from "@utils/trpc.types";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { Dialog, type DialogProps } from "primereact/dialog";
import { PickList, type PickListChangeEvent } from "primereact/picklist";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

type CvFormation = NonNullable<CvFull>["formations"][number];
type ProfileFormationItem = NonNullable<ProfileSaveInput["formations"]>[number];

function cvFormationToProfile(exp: CvFormation): ProfileFormationItem {
	return {
		clientKey: `formation-${uuid()}`,
		order: exp.order,
		content: {
			title: exp.title,
			start: exp.start,
			end: exp.end,
			organismeFormation: exp.organismeFormation,
			status: exp.status ?? "COMPLETED",
		},
	};
}

interface DialogSelectFormationProps extends DialogProps {
	listFormationFromCv: CvFormation[];
	listFormationInProfile: ProfileFormationItem[];
	setListFormation: (list: ProfileFormationItem[]) => void;
}

export function DialogSelectFormation({
	visible,
	onHide,
	listFormationFromCv,
	listFormationInProfile,
	setListFormation,
}: DialogSelectFormationProps) {
	const [source, setSource] = useState<ProfileFormationItem[]>([]);
	const [target, setTarget] = useState<ProfileFormationItem[]>([]);

	const onChange = (event: PickListChangeEvent) => {
		setSource(event.source);
		setTarget(event.target);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset picklist uniquement à l'ouverture du dialog
	useEffect(() => {
		if (!visible) return;
		setTarget(listFormationInProfile);
		const already = new Set(
			listFormationInProfile.map((e) => `${e.content.title}|${e.content.organismeFormation ?? ""}`),
		);
		setSource(
			listFormationFromCv
				.map((form) => cvFormationToProfile(form))
				.filter((e) => !already.has(`${e.content.title}|${e.content.organismeFormation ?? ""}`)),
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
						setListFormation(target);
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
			header="Selectionnez vos formations"
			style={{ minWidth: "1100px" }}
			footer={templateFooter}
		>
			<PickList
				dataKey="clientKey"
				source={source}
				target={target}
				onChange={onChange}
				itemTemplate={(exp: ListItem<FormationInput>) => (
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
}
