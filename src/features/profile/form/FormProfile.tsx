import type { ProfileSaveInput } from "@/services/schemas/profileSave.schema";
import { trpc } from "@utils/trpc";
import { Toast } from "primereact/toast";
import { useEffect, useRef, type PropsWithChildren } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { mapProfileToSaveInput } from "../mapProfileToSaveInput";

export const FormProfile = ({ children }: PropsWithChildren) => {
	const toast = useRef<Toast>(null);
	const { data: myProfile } = trpc.profile.completeMe.useQuery();
	// const {mutate: createProfile} = trpc.profile.create.useMutation()
	// const {mutate: updateProfile} = trpc.profile.update.useMutation()
	const { mutate: saveProfile, isPending } = trpc.profile.save.useMutation();

	// const methods = useForm<Profile>({
	const methods = useForm<ProfileSaveInput & { id?: string }>({
		// resolver: zodResolver(validationSchema),
		shouldFocusError: false, //! Régler l'erreur quand shouldFocus est à true
		mode: "onSubmit",
		// defaultValues: profileDefaultValue,
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (myProfile) reset(mapProfileToSaveInput(myProfile));
	}, [myProfile]);

	const {
		handleSubmit,
		// formState: { errors },
		reset,
		setValue,
	} = methods;

	const onSubmit = (
		data: ProfileSaveInput & { id?: string; userId?: string },
	) => {
		const { id: _id, userId: _userId, ...rest } = data;
		// description vide → ne pas envoyer (sinon .min(1) casse)

		const description = rest.description?.description?.trim()
			? {
					id: rest.description.id,
					description: rest.description.description.trim(),
				}
			: undefined;
		const philosophy = rest.philosophy?.citation?.trim()
			? {
					id: rest.philosophy.id,
					citation: rest.philosophy.citation.trim(),
					author: rest.philosophy.author,
				}
			: undefined;

		// inputs vides "" → null (sinon email échoue)
		const payload: ProfileSaveInput = {
			firstName: rest.firstName,
			lastName: rest.lastName,
			phone: rest.phone || null,
			location: rest.location || null,
			email: rest.email || null,
			photo: rest.photo || null,
			description,
			philosophy,
			experiences: rest.experiences, // tel quel (listItem)
			achievements: rest.achievements, // tel quel (listItem)
			strengths: rest.strengths, // tel quel (listItem)
			projects: rest.projects, // tel quel (listItem)
			publications: rest.publications, // tel quel (listItem)
			skillGroups: rest.skillGroups, // tel quel (listItem)
			competenceGroups: rest.competenceGroups, // tel quel (listItem)
			tagGroups: rest.tagGroups, // tel quel (listItem)
			passions: rest.passions, // tel quel (listItem)
			prizes: rest.prizes, // tel quel (listItem)
			certifications: rest.certifications, // tel quel (listItem)
			formations: rest.formations, // tel quel (listItem)
			socialMedias: rest.socialMedias, // tel quel (listItem)
			expertises: rest.expertises, // tel quel (listItem)
		};

		saveProfile(payload, {
			onSuccess: (saved) => {
				if (saved) reset(mapProfileToSaveInput(saved));
				toast.current?.show({
					severity: "success",
					summary: "Succès",
					detail: "Profil enregistré",
				});
			},
			onError: (error) => {
				toast.current?.show({
					severity: "error",
					summary: "Erreur",
					detail: error.message,
				});
			},
		});
	};

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Toast ref={toast} />
				{children}
			</form>
		</FormProvider>
	);
};
