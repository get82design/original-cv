import type {
	ProfileSaveInput,
	SocialMediaInput,
} from "@/services/schemas/profileSave.schema";
import type { CvFull } from "@utils/trpc.types";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { Dialog, type DialogProps } from "primereact/dialog";
import { PickList, type PickListChangeEvent } from "primereact/picklist";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

type CvSocialMedia = NonNullable<CvFull>["socialMedias"][number];
type ProfileSocialMediaItem = NonNullable<
	ProfileSaveInput["socialMedias"]
>[number];

function cvSocialMediaToProfile(exp: CvSocialMedia): ProfileSocialMediaItem {
	return {
		clientKey: `socialMedia-${uuid()}`,
		order: exp.order,
		content: {
			icon: exp.icon,
			socialNetwork: exp.socialNetwork ?? "",
			username: exp.username,
		},
	};
}

interface DialogSelectSocialMediaProps extends DialogProps {
	listSocialMediaFromCv: CvSocialMedia[];
	listSocialMediaInProfile: ProfileSocialMediaItem[];
	setListSocialMedia: (list: ProfileSocialMediaItem[]) => void;
}

export function DialogSelectSocialMedia({
	visible,
	onHide,
	listSocialMediaFromCv,
	listSocialMediaInProfile,
	setListSocialMedia,
}: DialogSelectSocialMediaProps) {
	const [source, setSource] = useState<ProfileSocialMediaItem[]>([]);
	const [target, setTarget] = useState<ProfileSocialMediaItem[]>([]);

	const onChange = (event: PickListChangeEvent) => {
		setSource(event.source);
		setTarget(event.target);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!visible) return;
		setTarget(listSocialMediaInProfile);
		const already = new Set(
			listSocialMediaInProfile.map(
				(e) => `${e.content.icon}|${e.content.socialNetwork ?? ""}`,
			),
		);
		setSource(
			listSocialMediaFromCv
				.map((exp) => cvSocialMediaToProfile(exp))
				.filter(
					(e) =>
						!already.has(`${e.content.icon}|${e.content.socialNetwork ?? ""}`),
				),
		);
	}, [visible, listSocialMediaFromCv]);

	const templateFooter = () => {
		return (
			<div className="w-full flex justify-end gap-2">
				<Button color="light" label="Annuler" onClick={onHide} size="small" />
				<Button
					label="Valider"
					size="small"
					onClick={() => {
						setListSocialMedia(target);
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
			header="Selectionnez vos réseaux sociaux"
			style={{ minWidth: "1100px" }}
			footer={templateFooter}
		>
			<PickList
				dataKey="clientKey"
				source={source}
				target={target}
				onChange={onChange}
				itemTemplate={(exp: ListItem<SocialMediaInput>) => (
					<p className="font-semibold">{exp.content.socialNetwork}</p>
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
