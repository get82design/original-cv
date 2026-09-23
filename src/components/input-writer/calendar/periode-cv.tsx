import { useCreateCvContext } from "@/features/cv-editor/component/context/CreateCvContext";
import { useInputCvColor } from "@/features/cv-editor/utils/utilsCv/color";
import { dateToStringMonthYear } from "@/utils/date";
import { useChangeTextFormat } from "@/features/cv-editor/utils/utilsCv/font";
import type { BaseTextSettings } from "@/services/schemas/cvTemplate.schema";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import type { InputTextProps as PrimeInputTextProps } from "primereact/inputtext";
import { InputText as PrimeInputText } from "primereact/inputtext";
import { OverlayPanel } from "primereact/overlaypanel";
import { TabPanel, TabView } from "primereact/tabview";
import type { Nullable } from "primereact/ts-helpers";
import { useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface DataInputProps {
	model: BaseTextSettings;
	changeSize: "1px" | "2px" | "4px";
}

interface InputTextProps extends PrimeInputTextProps {
	name: string;
	className?: string;
	dataInput: DataInputProps;
	textAlign?: "left" | "center" | "right";
	textColor?: string;
	fieldName: string;
	afficherCacher: string;
}

interface PeriodeDateProps {
	//   start: { year?: number; month?: number };
	start: Nullable<string | Date | Date[]>;
	end: Nullable<string | Date | Date[]>;
}

export const PeriodeCv = ({
	name,
	className = "",
	dataInput,
	textAlign = "left",
	textColor = "black",
	fieldName,
	afficherCacher,
	...props
}: InputTextProps) => {
	const { control } = useFormContext();
	const op = useRef<OverlayPanel>(null);
	const { getSize, getWeight } = useChangeTextFormat(dataInput);
	const { setSelectModifInput, setSelectInputForm } = useCreateCvContext();

	const color = useInputCvColor(textColor);

	const today = new Date();
	const lastMonth = today.getMonth();
	const lastYear = today.getFullYear();
	const maxDate = new Date();
	maxDate.setMonth(lastMonth);
	maxDate.setFullYear(lastYear);

	const [periode, setPeriode] = useState<PeriodeDateProps>({
		start: null,
		end: null,
	});

	const datePeriode =
		periode.start && periode.end
			? `De ${periode.start ? dateToStringMonthYear(periode.start as Date) : ""} à ${
					periode.end
						? periode.end === "aujourd'hui"
							? "aujourd'hui"
							: dateToStringMonthYear(periode.end as Date)
						: ""
				}`
			: null;

	return (
		<div className={`card w-full flex justify-center ${className}`}>
			<Controller
				name={name}
				control={control}
				render={({ field }) => (
					<>
						<PrimeInputText
							{...field}
							className={"w-full"}
							value={field.value}
							onChange={field.onChange}
							style={{
								padding: "0px",
								border: "none",
								boxShadow: "none",
								fontSize: getSize(),
								fontWeight: getWeight(),
								backgroundColor: "transparent",
								textAlign: textAlign,
								color: `var(--${color})`,
								fontFamily: "inherit",
							}}
							onClick={(e) => {
								op.current?.toggle(e);
								setSelectInputForm(afficherCacher);
								setSelectModifInput(fieldName);
							}}
							{...props}
						/>
						<OverlayPanel ref={op} style={{ width: "600px" }}>
							<TabView>
								<TabPanel
									headerClassName="w-1/2"
									header={`De ${
										periode?.start ? dateToStringMonthYear(periode?.start as Date) : null
									}`}
								>
									<div className="w-full flex gap-2">
										<Calendar
											className="w-full"
											view="month"
											dateFormat="MM"
											maxDate={maxDate}
											value={periode?.start as Date}
											onChange={(e) =>
												setPeriode({
													...periode,
													//   start: { year: e.year, month: e.month },
													start: e.value,
												})
											}
											inline
										/>
									</div>
								</TabPanel>
								<TabPanel
									headerClassName="w-1/2"
									header={`à ${
										periode.end
											? periode.end === "aujourd'hui"
												? "aujourd'hui"
												: dateToStringMonthYear(periode.end as Date)
											: ""
									}`}
								>
									<div className="w-full">
										<Button
											className="w-full"
											onClick={() => setPeriode({ ...periode, end: "aujourd'hui" })}
										>
											Encore en poste
										</Button>
										<Calendar
											className="w-full"
											view="month"
											dateFormat="MM"
											maxDate={maxDate}
											value={periode?.end as Date}
											onChange={(e) =>
												setPeriode({
													...periode,
													//   start: { year: e.year, month: e.month },
													end: e.value,
												})
											}
											inline
										/>
									</div>
								</TabPanel>
							</TabView>
							<div className="mt-2 w-full flex justify-between">
								<Button onClick={(e) => op.current?.toggle(e)}>Annuler</Button>
								<Button
									disabled={!periode.start && !periode.end}
									onClick={(e) => {
										op.current?.toggle(e);
										field.onChange(datePeriode);
									}}
								>
									Valider
								</Button>
							</div>
						</OverlayPanel>
					</>
				)}
			/>
		</div>
	);
};
