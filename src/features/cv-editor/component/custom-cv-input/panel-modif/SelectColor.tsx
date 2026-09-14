import { RadioColorRhf } from "@/components/input/radio/RadioColorRhf";
import { FieldNameLayoutGeneral } from "@/features/cv-editor/utils/fields/fieldNameLayoutGeneral";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

interface SelectColorProps {
	watchSelectInput: { colorSelect: string };
	select: string;
}

export const SelectColor = ({ watchSelectInput, select }: SelectColorProps) => {
	const { watch, setValue } = useFormContext();
	const watchPrimaryColor = watch(FieldNameLayoutGeneral.primaryColor);
	const [primaryColor, setPrimaryColor] = useState("");
	useEffect(() => {
		if (watchPrimaryColor) {
			setPrimaryColor(
				"--" + watchPrimaryColor.name + watchPrimaryColor.primary,
			);
		}
	}, [watchPrimaryColor]);
	return (
		<div className="flex flex-col gap-0">
			<p className="font-semibold text-sm">Couleur :</p>
			<div className="w-full flex gap-2">
				<RadioColorRhf
					index={4}
					name={select + ".colorSelect"}
					color={"--white"}
					value={"white"}
					checked={watchSelectInput?.colorSelect === "white"}
				/>
				<RadioColorRhf
					index={1}
					name={select + ".colorSelect"}
					color={"--black"}
					value={"black"}
					checked={watchSelectInput?.colorSelect === "black"}
				/>
				<RadioColorRhf
					index={2}
					name={select + ".colorSelect"}
					color={"--gray-700"}
					value={"gray"}
					checked={watchSelectInput?.colorSelect === "gray"}
				/>
				{watch(select + ".withPrimaryColor") && watchPrimaryColor && (
					<RadioColorRhf
						index={3}
						name={select + ".colorSelect"}
						color={primaryColor}
						value={"primaryColor"}
						checked={watchSelectInput?.colorSelect === "primaryColor"}
					/>
				)}
			</div>
		</div>
	);
};
