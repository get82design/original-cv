import type { CertificationInput, ProfileSaveInput } from "@/services/schemas/profileSave.schema";
import type { CvFull } from "@utils/trpc.types";
import type { ListItem } from "@utils/type";
import { Button } from "primereact/button";
import { Dialog, type DialogProps } from "primereact/dialog";
import { PickList, type PickListChangeEvent } from "primereact/picklist";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

type CvCertification = NonNullable<CvFull>["certifications"][number];
type ProfileCertificationItem = NonNullable<ProfileSaveInput["certifications"]>[number];

function cvCertificationToProfile(exp: CvCertification): ProfileCertificationItem {
	return {
		clientKey: `certification-${uuid()}`,
		order: exp.order,
		content: {
			title: exp.title,
			organismeCertification: exp.organismeCertification ?? "",
		},
	};
}

interface DialogSelectCertificationProps extends DialogProps {
	listCertificationFromCv: CvCertification[];
	listCertificationInProfile: ProfileCertificationItem[];
	setListCertification: (list: ProfileCertificationItem[]) => void;
}

export const DialogSelectCertification = ({
	visible,
	onHide,
	listCertificationFromCv,
	listCertificationInProfile,
	setListCertification,
}: DialogSelectCertificationProps) => {
	const [source, setSource] = useState<ProfileCertificationItem[]>([]);
	const [target, setTarget] = useState<ProfileCertificationItem[]>([]);

	const onChange = (event: PickListChangeEvent) => {
		setSource(event.source);
		setTarget(event.target);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset picklist uniquement à l'ouverture du dialog
	useEffect(() => {
		if (!visible) return;
		setTarget(listCertificationInProfile);
		const already = new Set(
			listCertificationInProfile.map(
				(e) => `${e.content.title}|${e.content.organismeCertification ?? ""}`,
			),
		);
		setSource(
			listCertificationFromCv
				.map((exp) => cvCertificationToProfile(exp))
				.filter(
					(e) => !already.has(`${e.content.title}|${e.content.organismeCertification ?? ""}`),
				),
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
						setListCertification(target);
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
			header="Selectionnez vos certifications"
			style={{ minWidth: "1100px" }}
			footer={templateFooter}
		>
			<PickList
				dataKey="clientKey"
				source={source}
				target={target}
				onChange={onChange}
				itemTemplate={(exp: ListItem<CertificationInput>) => (
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
