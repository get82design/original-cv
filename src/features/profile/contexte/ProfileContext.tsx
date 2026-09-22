import { createContext, useContext, useState, type JSX } from "react";
import { useFormContext } from "react-hook-form";

interface ProfileAddDeleteProps {
	addExperience: boolean;
	deleteExperience: boolean;
}

const initProfileAddDelete: ProfileAddDeleteProps = {
	addExperience: false,
	deleteExperience: false,
};

interface ProfileContextProps {
	profileAddDelete: ProfileAddDeleteProps;
	openClose: (name: keyof ProfileAddDeleteProps, state: boolean) => void;
}

export const ProfileContext = createContext<ProfileContextProps>({
	openClose: () => {},
	profileAddDelete: initProfileAddDelete,
});

export const useProfileContext = () => {
	const context = useContext(ProfileContext);
	if (context === undefined) {
		throw new Error("useProfileContext must be used within a ProfileContextProvider");
	}
	return context;
};

interface ProfileProviderProps {
	children: JSX.Element;
}

export const ProfileProvider = ({ children }: ProfileProviderProps) => {
	const [etatSave, setEtatSave] = useState(false);
	const { getValues } = useFormContext();
	const [profileAddDelete, setProfileAddDelete] =
		useState<ProfileAddDeleteProps>(initProfileAddDelete);

	const openClose = (name: keyof ProfileAddDeleteProps, state: boolean) => {
		const updatedObj: ProfileAddDeleteProps = {
			...profileAddDelete,
			[name]: state,
		};
		Object.keys(updatedObj).forEach((prop) => {
			if (prop !== name) {
				updatedObj[prop as keyof ProfileAddDeleteProps] = false;
			}
		});
		setProfileAddDelete(updatedObj);
	};

	const value = { etatSave, setEtatSave, profileAddDelete, openClose /*onChangeProfile*/ };
	return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
