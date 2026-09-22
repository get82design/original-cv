import type { LanguageInput, ProfileSaveInput } from "@/services/schemas/profileSave.schema";
import type { CvFull } from "@utils/trpc.types";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { Dialog, type DialogProps } from "primereact/dialog";
import { PickList, type PickListChangeEvent } from "primereact/picklist";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

type CvLanguage = NonNullable<CvFull>["languages"][number];
type ProfileLanguageItem = NonNullable<ProfileSaveInput["languages"]>[number];

function cvLanguageToProfile(exp: CvLanguage): ProfileLanguageItem {
	return {
		clientKey: `language-${uuid()}`,
		order: exp.order,
		content: {
			name: exp.name,
			level: exp.level,
		},
	};
}

interface DialogSelectLanguageProps extends DialogProps {
	listLanguageFromCv: CvLanguage[];
	listLanguageInProfile: ProfileLanguageItem[];
	setListLanguage: (list: ProfileLanguageItem[]) => void;
}

export function DialogSelectLanguage({
	visible,
	onHide,
	listLanguageFromCv,
	listLanguageInProfile,
	setListLanguage,
}: DialogSelectLanguageProps) {
	const [source, setSource] = useState<ProfileLanguageItem[]>([]);
	const [target, setTarget] = useState<ProfileLanguageItem[]>([]);

	const onChange = (event: PickListChangeEvent) => {
		setSource(event.source);
		setTarget(event.target);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!visible) return;
		setTarget(listLanguageInProfile);
		const already = new Set(
			listLanguageInProfile.map((e) => `${e.content.name}|${e.content.level ?? ""}`),
		);
		setSource(
			listLanguageFromCv
				.map((exp) => cvLanguageToProfile(exp))
				.filter((e) => !already.has(`${e.content.name}|${e.content.level ?? ""}`)),
		);
	}, [visible, listLanguageFromCv]);

	const templateFooter = () => {
		return (
			<div className="w-full flex justify-end gap-2">
				<Button outlined label="Annuler" onClick={onHide} size="small" />
				<Button
					label="Valider"
					size="small"
					onClick={() => {
						setListLanguage(target);
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
			header="Selectionnez vos langues"
			style={{ minWidth: "1100px" }}
			footer={templateFooter}
		>
			<PickList
				dataKey="clientKey"
				source={source}
				target={target}
				onChange={onChange}
				itemTemplate={(exp: ListItem<LanguageInput>) => (
					<p className="font-semibold">{exp.content.name}</p>
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
