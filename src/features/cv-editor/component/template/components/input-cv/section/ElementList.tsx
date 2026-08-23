import { TextareaCv } from "@/components/input-writer/input-textarea-cv/InputTextareaCv";
import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema";
import { useFormContext } from "react-hook-form";
import { DeleteElement } from "./DeleteElement";

interface ElementListProps {
	index: number;
	idx: number;
	itemSelected: string;
	itemClientKey: string;
	deleteMission: (index: number, idx: number) => void;
	watchModel: BaseTextSettings;
	placeholder: string;
	pathContent: string;
}

export const ElementList = ({
	index,
	idx,
	itemSelected,
	itemClientKey,
	deleteMission,
	watchModel,
	placeholder,
	pathContent,
}: ElementListProps) => {
	const { watch, setValue } = useFormContext();
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();
	return (
		<li className="relative -mb-1 flex gap-2" /*key={content.id}*/>
			<p className="-mt-0.5">- </p>
			<TextareaCv
				placeholder={placeholder}
				name={`${pathContent}.missions.${idx}.content.content`}
				onClick={() => {
					setSelectModifInput(`${pathContent}.settings.missions`);
					setSelectInputForm(`${pathContent}.settings.withListMissions`);
				}}
				value={watch(`${pathContent}.missions.${idx}.content.content`)}
				onChange={(e) =>
					setValue(
						`${pathContent}.missions.${idx}.content.content`,
						e.target.value,
					)
				}
				textColor={watchModel?.colorSelect}
				textAlign={watchModel?.textAlign}
				dataInput={{
					changeSize: "1px",
					model: watchModel,
				}}
			/>
			<DeleteElement
				index={index}
				idx={idx}
				itemSelected={itemSelected}
				itemClientKey={itemClientKey}
				deleteElmOfList={deleteMission}
				pathContent={pathContent}
			/>
		</li>
	);
};
