import type { ProfileSaveInput, StatInput } from "@/services/schemas/profileSave.schema";
import type { CvFull } from "@utils/trpc.types";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { Dialog, type DialogProps } from "primereact/dialog";
import { PickList, type PickListChangeEvent } from "primereact/picklist";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

type CvStat = NonNullable<NonNullable<CvFull>["stats"]>[number];
export type ProfileStatItem = NonNullable<ProfileSaveInput["stats"]>[number];

export interface DialogSelectStatProps extends DialogProps {
	listStatFromCv: CvStat[];
	listStatInProfile: ProfileStatItem[];
	setListStat: (list: ProfileStatItem[]) => void;
}

function cvStatToProfile(stat: CvStat): ProfileStatItem {
	return {
		clientKey: `stat-${uuid()}`,
		order: stat.order,
		content: {
			label: stat.label,
			value: stat.value,
		},
	};
}

export const DialogSelectStat = ({
	visible,
	onHide,
	listStatFromCv,
	listStatInProfile,
	setListStat,
}: DialogSelectStatProps) => {
	const [source, setSource] = useState<ProfileStatItem[]>([]);
	const [target, setTarget] = useState<ProfileStatItem[]>([]);

	const onChange = (event: PickListChangeEvent) => {
		setSource(event.source);
		setTarget(event.target);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset picklist uniquement à l'ouverture du dialog
	useEffect(() => {
		if (!visible) return;
		setTarget(listStatInProfile);
		const already = new Set(
			listStatInProfile.map((e) => `${e.content.label}|${e.content.value}`),
		);
		setSource(
			listStatFromCv
				.map((stat) => cvStatToProfile(stat))
				.filter((e) => !already.has(`${e.content.label}|${e.content.value}`)),
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
						setListStat(target);
						onHide?.();
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
			header="Sélectionnez vos chiffres"
			style={{ minWidth: "1100px" }}
			footer={templateFooter}
		>
			<PickList
				dataKey="clientKey"
				source={source}
				target={target}
				onChange={onChange}
				itemTemplate={(stat: ListItem<StatInput>) => (
					<p className="font-semibold">
						{stat.content.value} — {stat.content.label}
					</p>
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
