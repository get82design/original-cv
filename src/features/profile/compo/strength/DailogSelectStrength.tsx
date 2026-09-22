import type { ProfileSaveInput, StrengthInput } from "@/services/schemas/profileSave.schema";
import type { CvFull } from "@utils/trpc.types";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { Dialog, type DialogProps } from "primereact/dialog";
import { PickList, type PickListChangeEvent } from "primereact/picklist";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

type CvStrength = NonNullable<CvFull>["strengths"][number];
type ProfileStrengthItem = NonNullable<ProfileSaveInput["strengths"]>[number];

interface DialogSelectStrengthProps extends DialogProps {
	listStrengthFromCv: CvStrength[];
	listStrengthInProfile: ProfileStrengthItem[];
	setListStrength: (list: ProfileStrengthItem[]) => void;
}

function cvStrengthToProfile(exp: CvStrength): ProfileStrengthItem {
	return {
		clientKey: `strength-${uuid()}`,
		order: exp.order,
		content: {
			title: exp.title,
			icon: exp.icon,
			description: exp.description,
		},
	};
}

export function DialogSelectStrength({
	visible,
	onHide,
	listStrengthFromCv,
	listStrengthInProfile,
	setListStrength,
}: DialogSelectStrengthProps) {
	const [source, setSource] = useState<ProfileStrengthItem[]>([]);
	const [target, setTarget] = useState<ProfileStrengthItem[]>([]);

	const onChange = (event: PickListChangeEvent) => {
		setSource(event.source);
		setTarget(event.target);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!visible) return;
		setTarget(listStrengthInProfile);
		const already = new Set(
			listStrengthInProfile.map((e) => `${e.content.title}|${e.content.icon ?? ""}`),
		);
		setSource(
			listStrengthFromCv
				.map((exp) => cvStrengthToProfile(exp))
				.filter((e) => !already.has(`${e.content.title}|${e.content.icon ?? ""}`)),
		);
	}, [visible, listStrengthFromCv]);

	const templateFooter = () => {
		return (
			<div className="w-full flex justify-end gap-2">
				<Button outlined label="Annuler" onClick={onHide} size="small" />
				<Button
					label="Valider"
					size="small"
					onClick={() => {
						setListStrength(target);
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
			header="Selectionnez vos atouts"
			style={{ minWidth: "1100px" }}
			footer={templateFooter}
		>
			<PickList
				dataKey="clientKey"
				source={source}
				target={target}
				onChange={onChange}
				itemTemplate={(exp: ListItem<StrengthInput>) => (
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
