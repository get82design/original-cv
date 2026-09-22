import type {
	PassionInput,
	ProfileSaveInput,
} from "@/services/schemas/profileSave.schema";
import type { CvFull } from "@utils/trpc.types";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { Dialog, type DialogProps } from "primereact/dialog";
import { PickList, type PickListChangeEvent } from "primereact/picklist";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

type CvPassion = NonNullable<CvFull>["passions"][number];
type ProfilePassionItem = NonNullable<ProfileSaveInput["passions"]>[number];

function cvPassionToProfile(exp: CvPassion): ProfilePassionItem {
	return {
		clientKey: `passion-${uuid()}`,
		order: exp.order,
		content: {
			title: exp.title,
			icon: exp.icon,
		},
	};
}

interface DialogSelectPassionProps extends DialogProps {
	listPassionFromCv: CvPassion[];
	listPassionInProfile: ProfilePassionItem[];
	setListPassion: (list: ProfilePassionItem[]) => void;
}

export function DialogSelectPassion({
	visible,
	onHide,
	listPassionFromCv,
	listPassionInProfile,
	setListPassion,
}: DialogSelectPassionProps) {
	const [source, setSource] = useState<ProfilePassionItem[]>([]);
	const [target, setTarget] = useState<ProfilePassionItem[]>([]);

	const onChange = (event: PickListChangeEvent) => {
		setSource(event.source);
		setTarget(event.target);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!visible) return;
		setTarget(listPassionInProfile);
		const already = new Set(
			listPassionInProfile.map(
				(e) => `${e.content.title}|${e.content.icon ?? ""}`,
			),
		);
		setSource(
			listPassionFromCv
				.map((exp) => cvPassionToProfile(exp))
				.filter(
					(e) => !already.has(`${e.content.title}|${e.content.icon ?? ""}`),
				),
		);
	}, [visible, listPassionFromCv]);

	const templateFooter = () => {
		return (
			<div className="w-full flex justify-end gap-2">
				<Button outlined label="Annuler" onClick={onHide} size="small" />
				<Button
					label="Valider"
					size="small"
					onClick={() => {
						setListPassion(target);
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
			header="Selectionnez vos passions"
			style={{ minWidth: "1100px" }}
			footer={templateFooter}
		>
			<PickList
				dataKey="clientKey"
				source={source}
				target={target}
				onChange={onChange}
				itemTemplate={(exp: ListItem<PassionInput>) => (
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
