import type { ProfileSaveInput, PublicationInput } from "@/services/schemas/profileSave.schema";
import type { CvFull } from "@utils/trpc.types";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { Dialog, type DialogProps } from "primereact/dialog";
import { v4 as uuid } from "uuid";
import { PickList, type PickListChangeEvent } from "primereact/picklist";
import type { ListItem } from "@utils/type";

type CvPublication = NonNullable<CvFull>["publications"][number];
type ProfilePublicationItem = NonNullable<ProfileSaveInput["publications"]>[number];

function cvPublicationToProfile(exp: CvPublication): ProfilePublicationItem {
	return {
		clientKey: `publication-${uuid()}`,
		order: exp.order,
		content: {
			title: exp.title,
			start: exp.start,
			end: exp.end,
			journalName: exp.journalName,
			description: exp.description,
			url: exp.url,
		},
	};
}

interface DialogSelectPublicationProps extends DialogProps {
	listPublicationFromCv: CvPublication[];
	listPublicationInProfile: ProfilePublicationItem[];
	setListPublication: (list: ProfilePublicationItem[]) => void;
}

export const DialogSelectPublication = ({
	visible,
	onHide,
	listPublicationFromCv,
	listPublicationInProfile,
	setListPublication,
}: DialogSelectPublicationProps) => {
	const [source, setSource] = useState<ProfilePublicationItem[]>([]);
	const [target, setTarget] = useState<ProfilePublicationItem[]>([]);

	const onChange = (event: PickListChangeEvent) => {
		setSource(event.source);
		setTarget(event.target);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset picklist uniquement à l'ouverture du dialog
	useEffect(() => {
		if (!visible) return;
		setTarget(listPublicationInProfile);
		const already = new Set(
			listPublicationInProfile.map((e) => `${e.content.title}|${e.content.journalName ?? ""}`),
		);
		setSource(
			listPublicationFromCv
				.map((exp) => cvPublicationToProfile(exp))
				.filter((e) => !already.has(`${e.content.title}|${e.content.journalName ?? ""}`)),
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
						setListPublication(target);
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
			header="Selectionnez vos publications"
			style={{ minWidth: "1100px" }}
			footer={templateFooter}
		>
			<PickList
				dataKey="clientKey"
				source={source}
				target={target}
				onChange={onChange}
				itemTemplate={(exp: ListItem<PublicationInput>) => (
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
