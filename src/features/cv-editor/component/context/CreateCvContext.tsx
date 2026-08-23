import {
	createContext,
	type PropsWithChildren,
	useContext,
	useState,
} from "react";
// import { useFormContext } from "react-hook-form"

// interface ItemMemory {
//   id: string
// }

interface CreateCvContextProps {
	selectModifInput: string;
	setSelectModifInput: (e: string) => void;
	selectInputForm: string;
	setSelectInputForm: (e: string) => void;
	sectionSelected: string;
	setSectionSelected: (e: string) => void;
	// listItemsUse: ItemMemory[][]
	// setListItemsUse: (e: ItemMemory[][]) => void
	// listItemsNoUse: ItemMemory[]
	// setListItemsNoUse: (e: ItemMemory[]) => void
}

const CreateCvContext = createContext<CreateCvContextProps>({
	selectModifInput: "",
	setSelectModifInput: (e: string) => e,
	selectInputForm: "",
	setSelectInputForm: (e: string) => e,
	sectionSelected: "",
	setSectionSelected: (e: string) => e,
	// listItemsUse: [],
	// listItemsNoUse: [],
	// setListItemsUse: (e: ItemMemory[][]) => e,
	// setListItemsNoUse: (e: ItemMemory[]) => e,
});

export const useCreateCvContext = () => {
	const context = useContext(CreateCvContext);
	if (context === undefined) {
		throw new Error(
			"useCreateCvContext must be used within a CreateCvContextProvider",
		);
	}
	return context;
};

// const defaultUseItems = [
//   { id: 'summary' },
//   { id: 'experience' },
//   { id: 'diplome' },
// ]

// const defaultNoUseItems = [
//   { id: 'projet' },
//   { id: 'benevolat' },
//   { id: 'realisation' },
//   { id: 'atout' },
//   { id: 'publication' },
//   { id: 'langue' },
//   { id: 'passion' },
//   { id: 'social' },
//   { id: 'skill' },
//   { id: 'philosophie' },
//   { id: 'competence' },
//   { id: 'expertise' },
//   { id: 'prix' },
//   { id: 'certification' },
//   { id: 'formation' },
// ]

export const CreateCvProvider = ({ children }: PropsWithChildren) => {
	const [selectModifInput, setSelectModifInput] = useState("");
	const [sectionSelected, setSectionSelected] = useState("");
	const [selectInputForm, setSelectInputForm] = useState("");
	// const [listItemsUse, setListItemsUse] = useState<ItemMemory[][]>([])
	// const [listItemsNoUse, setListItemsNoUse] = useState<ItemMemory[]>([])

	// const [listNewItemsUse, setListNewItemsUse] = useState([]);

	// const { watch } = useFormContext()

	// const watchItemsNoUse = watch(FieldNameCvModel.itemsNoUse)
	// const refItemsNoUse = useRef()
	// const watchItemsUse = watch(FieldNameCvModel.itemsUse)
	// const refItemsUse = useRef()

	// useEffect(() => {
	//   if (watchItemsNoUse && watchItemsNoUse !== refItemsNoUse.current) {
	//     setListItemsNoUse(watchItemsNoUse)
	//     refItemsNoUse.current = watchItemsNoUse
	//   }
	// }, [watchItemsNoUse])

	// useEffect(() => {
	//   if (watchItemsUse && watchItemsUse !== refItemsUse.current) {
	//     setListItemsUse(watchItemsUse)
	//     refItemsUse.current = watchItemsUse
	//   }
	// }, [watchItemsUse])

	const value = {
		selectModifInput,
		setSelectModifInput,
		selectInputForm,
		setSelectInputForm,
		// listItemsUse,
		// listItemsNoUse,
		// setListItemsUse,
		// setListItemsNoUse,
		sectionSelected,
		setSectionSelected,
	};
	return (
		<CreateCvContext.Provider value={value}>
			{children}
		</CreateCvContext.Provider>
	);
};

export function clearEditorSelection(ctx: {
	setSelectModifInput: (v: string) => void;
	setSelectInputForm: (v: string) => void;
	setSectionSelected: (v: string) => void;
}) {
	ctx.setSelectModifInput("");
	ctx.setSelectInputForm("");
	ctx.setSectionSelected("");
}
