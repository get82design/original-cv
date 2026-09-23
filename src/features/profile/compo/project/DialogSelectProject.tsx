import type { ProfileSaveInput, ProjectInput } from "@/services/schemas/profileSave.schema";
import type { CvFull } from "@utils/trpc.types";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { Dialog, type DialogProps } from "primereact/dialog";
import { PickList, type PickListChangeEvent } from "primereact/picklist";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

type CvProject = NonNullable<CvFull>["projects"][number];
type ProfileProjectItem = NonNullable<ProfileSaveInput["projects"]>[number];

function cvProjectToProfile(exp: CvProject): ProfileProjectItem {
	return {
		clientKey: `project-${uuid()}`,
		order: exp.order,
		content: {
			title: exp.title,
			start: exp.start,
			end: exp.end,
			location: exp.location,
			technology: exp.technology,
			description: exp.description,
			missions:
				exp.cvMissions?.map((m) => ({
					clientKey: `mission-${uuid()}`,
					order: m.order,
					content: { content: m.content },
				})) ?? [],
		},
	};
}

interface DialogSelectProjectProps extends DialogProps {
	listProjectFromCv: CvProject[];
	listProjectInProfile: ProfileProjectItem[];
	setListProject: (list: ProfileProjectItem[]) => void;
}

export function DialogSelectProject({
	visible,
	onHide,
	listProjectFromCv,
	listProjectInProfile,
	setListProject,
}: DialogSelectProjectProps) {
	const [source, setSource] = useState<ProfileProjectItem[]>([]);
	const [target, setTarget] = useState<ProfileProjectItem[]>([]);

	const onChange = (event: PickListChangeEvent) => {
		setSource(event.source);
		setTarget(event.target);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset picklist uniquement à l'ouverture du dialog
	useEffect(() => {
		if (!visible) return;
		setTarget(listProjectInProfile);
		const already = new Set(
			listProjectInProfile.map((e) => `${e.content.title}|${e.content.location ?? ""}`),
		);
		setSource(
			listProjectFromCv
				.map((exp) => cvProjectToProfile(exp))
				.filter((e) => !already.has(`${e.content.title}|${e.content.location ?? ""}`)),
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
						setListProject(target);
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
			header="Selectionnez vos projets"
			style={{ minWidth: "1100px" }}
			footer={templateFooter}
		>
			<PickList
				dataKey="clientKey"
				source={source}
				target={target}
				onChange={onChange}
				itemTemplate={(exp: ListItem<ProjectInput>) => (
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
