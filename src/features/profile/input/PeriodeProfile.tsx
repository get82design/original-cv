import { dateToStringMonthYear } from "@/utils/date";
import type { InputTextareaProps } from "primereact/inputtextarea";
import { OverlayPanel } from "primereact/overlaypanel";
import type { Nullable } from "primereact/ts-helpers";
import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { TextareaProfile } from "./TextareaProfile";
import { TabPanel, TabView } from "primereact/tabview";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";

interface PeriodeDateProps {
	//   start: { year?: number; month?: number };
	start: Nullable<string | Date | Date[]>;
	end: Nullable<string | Date | Date[]>;
}

interface PeriodeProfileProps extends InputTextareaProps {
	className?: string;
	startName: string;
	endName: string;
	fontSize: string;
	fontWeight: number;
	textAlign: "left" | "right" | "center" | "justify";
	changePeriode?: (e: string) => void;
}

export const PeriodeProfile = ({
	className,
	startName,
	endName,
	fontSize,
	fontWeight,
	textAlign,
	changePeriode,
	...props
}: PeriodeProfileProps) => {
	const { watch, setValue } = useFormContext();
	const op = useRef<OverlayPanel>(null);

	const watchStart = watch(startName);
	const watchEnd = watch(endName);

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

	// affichage
	const label = watchStart
		? `De ${dateToStringMonthYear(watchStart)} à ${
				watchEnd ? dateToStringMonthYear(watchEnd) : "aujourd'hui"
			}`
		: "";

	return (
		<div className={`card flex justify-center ${className}`}>
			<TextareaProfile
				{...props}
				placeholder="Période"
				name={"periodeProfile"}
				className={"w-full"}
				value={label}
				fontSize={"14px"}
				weight={300}
				textAlign={"right"}
				onClick={(e) => {
					setPeriode({
						start: watchStart ?? null,
						end: watchEnd ?? null,
					});
					op.current?.toggle(e);
				}}
			/>
			<OverlayPanel ref={op} style={{ width: "600px" }}>
				<TabView>
					<TabPanel
						headerClassName="w-1/2"
						header={`De ${
							periode?.start
								? dateToStringMonthYear(periode?.start as Date)
								: null
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
					<Button onClick={(e) => op.current && op.current.toggle(e)}>
						Annuler
					</Button>
					<Button
						disabled={!periode.start && !periode.end}
						// Valider
						onClick={(e) => {
							op.current?.toggle(e);
							if (periode.start instanceof Date) {
								setValue(startName, periode.start, { shouldDirty: true });
							}
							setValue(
								endName,
								periode.end === "aujourd'hui" || !periode.end
									? null
									: periode.end,
								{ shouldDirty: true },
							);
						}}
					>
						Valider
					</Button>
				</div>
			</OverlayPanel>
		</div>
	);
};

function useThemeContext(): { darkMode: any } {
	throw new Error("Function not implemented.");
}
