import { useFormContext } from "react-hook-form";
import { useModelAndColorContext } from "../../component/context/ModelAndColorContext";
import type { Color } from "@utils/trpc.types";
import { useEffect, useState } from "react";
import { FieldNameLayoutGeneral } from "../fields/fieldNameLayoutGeneral";
import { useColumnFg } from "../../component/kit-dnd/shared/ColumnFgContext";

export const useInputCvColor = (textColor: string, opts?: { ignoreColumnFg?: boolean }) => {
	const { watch } = useFormContext();
	const { colors } = useModelAndColorContext();
	const watchPrimaryColor = watch(FieldNameLayoutGeneral.primaryColor);
	const columnFg = useColumnFg();

	// Accent : jamais écrasé par le fg de colonne (sauf si l’appelant a déjà choisi le fg)
	if (textColor === "primaryColor") {
		return watchPrimaryColor?.name
			? watchPrimaryColor.name + (watchPrimaryColor.primary ?? "")
			: "";
	}

	// Dans une colonne thématisée : black/gray/white suivent le fg
	if (
		!opts?.ignoreColumnFg &&
		columnFg &&
		(textColor === "black" || textColor === "gray" || textColor === "white")
	) {
		return columnFg;
	}

	if (textColor === "white" || textColor === "black") return textColor;
	if (textColor === "gray") return "gray-700";

	const found = colors.find((color: Color) => color.name === textColor);
	return found ? found.name + (found.primary ?? "") : "";
};

export const ColorForMiniCard = () => {
	const { watch } = useFormContext();
	const { colors } = useModelAndColorContext();
	const watchPrimaryColor = watch(FieldNameLayoutGeneral.primaryColor);
	return watchPrimaryColor && colors
		? watchPrimaryColor.name === "black"
			? "dark:white"
			: watchPrimaryColor.name + watchPrimaryColor.primary
		: "";
};

export const GetPrimaryColor = () => {
	const { watch } = useFormContext();
	const watchPrimaryColor = watch(FieldNameLayoutGeneral.primaryColor);
	const [primaryColor, setPrimaryColor] = useState("");

	useEffect(() => {
		if (watchPrimaryColor) {
			setPrimaryColor(watchPrimaryColor.name + (watchPrimaryColor.primary ?? ""));
		}
	}, [watchPrimaryColor]);

	return primaryColor;
};

export const GetPrimaryColorApercu = (primaryColor: Color) => {
	return primaryColor.name + primaryColor.primary;
};
