import type { PrizeInput, ProfileSaveInput } from "@/services/schemas/profileSave.schema";
import type { CvFull } from "@utils/trpc.types";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { Dialog, type DialogProps } from "primereact/dialog";
import { PickList, type PickListChangeEvent } from "primereact/picklist";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

type CvPrize = NonNullable<CvFull>["prizes"][number];
type ProfilePrizeItem = NonNullable<ProfileSaveInput["prizes"]>[number];

function cvPrizeToProfile(exp: CvPrize): ProfilePrizeItem {
	return {
		clientKey: `prize-${uuid()}`,
		order: exp.order,
		content: {
			title: exp.title,
			icon: exp.icon ?? "faTrophy",
			domaine: exp.domaine,
		},
	};
}

interface DialogSelectPrizeProps extends DialogProps {
	listPrizeFromCv: CvPrize[];
	listPrizeInProfile: ProfilePrizeItem[];
	setListPrize: (list: ProfilePrizeItem[]) => void;
}

export const DialogSelectPrize = ({
	visible,
	onHide,
	listPrizeFromCv,
	listPrizeInProfile,
	setListPrize,
}: DialogSelectPrizeProps) => {
	const [source, setSource] = useState<ProfilePrizeItem[]>([]);
	const [target, setTarget] = useState<ProfilePrizeItem[]>([]);

	const onChange = (event: PickListChangeEvent) => {
		setSource(event.source);
		setTarget(event.target);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!visible) return;
		setTarget(listPrizeInProfile);
		const already = new Set(
			listPrizeInProfile.map((e) => `${e.content.title}|${e.content.domaine ?? ""}`),
		);
		setSource(
			listPrizeFromCv
				.map((exp) => cvPrizeToProfile(exp))
				.filter((e) => !already.has(`${e.content.title}|${e.content.domaine ?? ""}`)),
		);
	}, [visible, listPrizeFromCv]);

	const templateFooter = () => {
		return (
			<div className="w-full flex justify-end gap-2">
				<Button outlined label="Annuler" onClick={onHide} size="small" />
				<Button
					label="Valider"
					size="small"
					onClick={() => {
						setListPrize(target);
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
			header="Selectionnez vos prix"
			style={{ minWidth: "1100px" }}
			footer={templateFooter}
		>
			<PickList
				dataKey="clientKey"
				source={source}
				target={target}
				onChange={onChange}
				itemTemplate={(exp: ListItem<PrizeInput>) => (
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
