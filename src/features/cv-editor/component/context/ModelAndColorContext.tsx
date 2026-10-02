import {
	createContext,
	useContext,
	useEffect,
	useState,
	type JSX,
} from "react";
import type { Color, TemplateCv } from "@utils/trpc.types";
import { trpc } from "@utils/trpc";

interface ModelAndColorContextProps {
	colors: Color[];
	modeles: TemplateCv[];
}

const ModelAndColorContext = createContext<ModelAndColorContextProps | null>(
	null,
);

export const useModelAndColorContext = () => {
	const context = useContext(ModelAndColorContext);
	if (!context) {
		throw new Error(
			"useModelAndColorContext must be used within a ModelAndColorContextProvider",
		);
	}
	return context;
};

interface ModelAndColorProviderProps {
	children: JSX.Element;
}

export const ModelAndColorProvider = ({
	children,
}: ModelAndColorProviderProps) => {
	const [colors, setColors] = useState<Color[]>([]);
	const { data: dataColor } = trpc.color.findAll.useQuery();
	const [modeles, setModeles] = useState<TemplateCv[]>([]);
	const { data: dataModeleList } = trpc.cvTemplate.findAll.useQuery(undefined, {
		staleTime: 3600000,
	}); // staleTime 1h
	useEffect(() => {
		if (dataColor && dataColor.length > 0) {
			// console.log('dataColor in provider:', dataColor)
			setColors(dataColor);
		}
	}, [dataColor]);

	useEffect(() => {
		if (dataModeleList && dataModeleList.length > 0) {
			// console.log('dataModeleList:', dataModeleList.getModeleList.modeleList.sort((a, b) => { return a.id - b.id }))
			setModeles(dataModeleList);
		}
	}, [dataModeleList]);

	const value = {
		colors,
		modeles,
	};
	return (
		<ModelAndColorContext.Provider value={value}>
			{children}
		</ModelAndColorContext.Provider>
	);
};
