import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { InputTextarea } from "primereact/inputtextarea";
import { useState, type JSX } from "react";
import { CommonListContainer } from "../../common-compo/list/CommonListContainer";
import type { ListItem, WithMissions } from "@utils/type";

type MissionItem = ListItem<{ content: unknown }>;

interface ListInSectionProps<T extends WithMissions> {
  watchIfListAffiche: boolean;
  item: ListItem<T>; // parent (expérience, etc.)
  index: number;
  itemSelected: string;
  elmList: (content: MissionItem, idx: number) => JSX.Element; // ← mission
  addElmList: (item: ListItem<T>, newElm: string, index: number) => void;
  pathContent: string;
}

export const ListInSection = <T extends WithMissions>({
	watchIfListAffiche,
	item,
	index,
	itemSelected,
	elmList,
	addElmList,
	pathContent,
}: ListInSectionProps<T>) => {
	const [newElm, setNewElm] = useState("");
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();
	return (
		watchIfListAffiche && (
			<>
				{/* Liste existante */}
				<CommonListContainer content={item} elmList={elmList} className={""} />
				{itemSelected === item.clientKey ? (
					<InputTextarea
						placeholder="quelle est votre réussite qui correspond à l'emploi auquel vous postulez ?"
						style={{
							padding: "0px",
							border: "none",
							boxShadow: "none",
							fontSize: "13px",
							fontWeight: 400,
							backgroundColor: "transparent",
						}}
						rows={1}
						className="ml-4 mt-1 w-full"
						autoResize
						value={newElm}
						onChange={(e) => setNewElm(e.target.value)}
						onClick={() => {
							setSelectModifInput(`${pathContent}.missions.${index}.content.content`);
							setSelectInputForm(`${pathContent}.settings.withListMissions`);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								if (newElm.trim()) {
									addElmList(item, newElm.trim(), index);
									setNewElm("");
								}
							}
						}}
						//   onKeyUp={(e) => {
						//     e.preventDefault()
						//     if (e.key === 'Enter') {
						//       addElmList(item, newElm, index)
						//       setNewElm('')
						//     }
						//   }}
					/>
				) : null}
			</>
		)
	);
};
