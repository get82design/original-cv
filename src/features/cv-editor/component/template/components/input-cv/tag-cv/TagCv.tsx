import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { GetPrimaryColor } from "@/features/cv-editor/utils/utilsCv/color";
import { useChangeTextFormat } from "@/features/cv-editor/utils/utilsCv/font";
import type { BaseTextSettings, TagContentSettings } from "@/services/schemas/cvTemplate.schema";
import { FaTimes } from "react-icons/fa";

interface DataInputProps {
	model: BaseTextSettings;
	changeSize: "1px" | "2px" | "4px";
}

interface TagCvProps {
	style: TagContentSettings["design"];
	groupIndex: number;
	index: number;
	onDelete: (groupIndex: number, index: number) => void;
	dataInput: DataInputProps;
	children: React.ReactNode; // = InputTextCv
	showDelete?: boolean;
}

export const TagCv = ({
	style,
	index,
	groupIndex,
	onDelete,
	dataInput,
	children,
	showDelete = true,
}: TagCvProps) => {
	const { getSize, getWeight } = useChangeTextFormat(dataInput);
	const primaryColor = GetPrimaryColor();
	switch (style) {
		case "tag":
			return (
				<div
					key={groupIndex}
					className="rounded-full"
					style={{
						backgroundColor: `var(--${primaryColor})`,
						fontSize: getSize(),
						fontWeight: getWeight(),
					}}
				>
					<div className="flex gap-2 items-center px-3 py-1 text-white">
						{children}
						{showDelete && (
							<FaTimes
								style={{ width: 12, height: 12, cursor: "pointer" }}
								onClick={(e) => {
									e.stopPropagation();
									onDelete(groupIndex, index);
								}}
							/>
						)}
						{/* <InTagCv
							content={content}
							index={index}
							groupIndex={groupIndex}
							onDelete={onDelete}
						/> */}
					</div>
				</div>
			);
		case "hashtag":
			return (
				<div
					key={groupIndex}
					className="flex px-3 py-1"
					style={{ fontSize: getSize(), fontWeight: getWeight() }}
				>
					<span style={{ color: `var(--${primaryColor})` }}>#</span>
					<div className="flex gap-2 items-center ">
						{children}
						{showDelete && (
							<FaTimes
								style={{ width: 12, height: 12, cursor: "pointer" }}
								onClick={(e) => {
									e.stopPropagation();
									onDelete(groupIndex, index);
								}}
							/>
						)}
						{/* <InTagCv
							content={content}
							index={index}
							groupIndex={groupIndex}
							onDelete={onDelete}
						/> */}
					</div>
				</div>
			);
		case "border":
			return (
				<div
					key={groupIndex}
					className="flex px-2.5 py-0.5 border rounded-md"
					style={{
						borderColor: `var(--${primaryColor})`,
						fontSize: getSize(),
						fontWeight: getWeight(),
					}}
				>
					<div className="flex gap-2 items-center ">
						{children}
						{showDelete && (
							<FaTimes
								style={{ width: 12, height: 12, cursor: "pointer" }}
								onClick={(e) => {
									e.stopPropagation();
									onDelete(groupIndex, index);
								}}
							/>
						)}
						{/* <InTagCv
							content={content}
							index={index}
							groupIndex={groupIndex}
							onDelete={onDelete}
						/> */}
					</div>
				</div>
			);
		case "none":
			return (
				<div
					key={groupIndex}
					style={{ fontSize: getSize(), fontWeight: getWeight() }}
					className="flex px-3 py-1"
				>
					<div className="flex gap-2 items-center ">
						{children}
						{showDelete && (
							<FaTimes
								style={{ width: 12, height: 12, cursor: "pointer" }}
								onClick={(e) => {
									e.stopPropagation();
									onDelete(groupIndex, index);
								}}
							/>
						)}
						{/* <InTagCv
							content={content}
							index={index}
							groupIndex={groupIndex}
							onDelete={onDelete}
						/> */}
					</div>
				</div>
			);
		default:
			return;
	}
};

interface InTagCvProps {
	content: string;
	index: number;
	groupIndex: number;
	onDelete: (groupIndex: number, index: number) => void;
}

const InTagCv = ({ onDelete, content, index, groupIndex }: InTagCvProps) => {
	const { sectionSelected } = useCreateCvContext();
	// console.log('sectionSelected:', sectionSelected);
	return (
		<>
			<span className="my-0">{content}</span>
			{sectionSelected.includes("tag") && (
				<FaTimes
					style={{ width: "12px", height: "12px", cursor: "pointer" }}
					onClick={(e) => {
						e.stopPropagation();
						onDelete(groupIndex, index);
					}}
				/>
			)}
		</>
	);
};
