import type { AchievementInput, ProfileSaveInput } from "@/services/schemas/profileSave.schema";
import type { CvFull } from "@utils/trpc.types";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { Dialog, type DialogProps } from "primereact/dialog";
import { PickList, type PickListChangeEvent } from "primereact/picklist";
import { useState } from "react";
import { useEffect } from "react";
import { v4 as uuid } from "uuid";

type CvAchievement = NonNullable<CvFull>["achievements"][number];
type ProfileAchievementItem = NonNullable<ProfileSaveInput["achievements"]>[number];

function cvAchievementToProfile(exp: CvAchievement): ProfileAchievementItem {
	return {
		clientKey: `achievement-${uuid()}`,
		order: exp.order,
		content: {
			title: exp.title,
			description: exp.description,
			technology: exp.technology,
			year: exp.year,
		},
	};
}

interface DialogSelectAchievementProps extends DialogProps {
	listAchievementFromCv: CvAchievement[];
	listAchievementInProfile: ProfileAchievementItem[];
	setListAchievement: (list: ProfileAchievementItem[]) => void;
}

export const DialogSelectAchievement = ({
	visible,
	onHide,
	listAchievementFromCv,
	listAchievementInProfile,
	setListAchievement,
}: DialogSelectAchievementProps) => {
	const [source, setSource] = useState<ProfileAchievementItem[]>([]);
	const [target, setTarget] = useState<ProfileAchievementItem[]>([]);

	const onChange = (event: PickListChangeEvent) => {
		setSource(event.source);
		setTarget(event.target);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!visible) return;
		setTarget(listAchievementInProfile);
		const already = new Set(
			listAchievementInProfile.map((e) => `${e.content.title}|${e.content.technology ?? ""}`),
		);
		setSource(
			listAchievementFromCv
				.map((exp) => cvAchievementToProfile(exp))
				.filter((e) => !already.has(`${e.content.title}|${e.content.technology ?? ""}`)),
		);
	}, [visible, listAchievementFromCv]);

	const templateFooter = () => {
		return (
			<div className="w-full flex justify-end gap-2">
				<Button outlined label="Annuler" onClick={onHide} size="small" />
				<Button
					label="Valider"
					size="small"
					onClick={() => {
						setListAchievement(target);
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
			header="Selectionnez vos réalisations"
			style={{ minWidth: "1100px" }}
			footer={templateFooter}
		>
			<PickList
				dataKey="clientKey"
				source={source}
				target={target}
				onChange={onChange}
				itemTemplate={(exp: ListItem<AchievementInput>) => (
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
