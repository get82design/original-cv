import type {
	AchievementInput,
	CertificationInput,
	CompetenceGroupInput,
	EducationInput,
	ExperienceInput,
	ExpertiseInput,
	FormationInput,
	LanguageInput,
	PassionInput,
	PrizeInput,
	ProfileSaveInput,
	ProjectInput,
	PublicationInput,
	SkillGroupInput,
	SkillInput,
	SocialMediaInput,
	StrengthInput,
	TagGroupInput,
	VolunteeringInput,
} from "@/services/schemas/profileSave.schema";
import { trpc } from "@utils/trpc";
import { Toast } from "primereact/toast";
import { useEffect, useRef, type PropsWithChildren } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { mapProfileToSaveInput } from "../mapProfileToSaveInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { validationSchema } from "./validation-schema";
import {
	isBlankExperience,
	isBlankStrength,
	isBlankFormation,
	isBlankProject,
	isBlankPublication,
	isBlankAchievement,
	isBlankVolunteering,
	isBlankEducation,
	isBlankLanguage,
	isBlankPassion,
	isBlankPrize,
	isBlankCertification,
	isBlankSocialMedia,
	isBlankExpertise,
	isBlankSkillGroup,
	isBlankCompetenceGroup,
	isBlankTagGroup,
	isBlankSkill,
} from "@/utils/isBankSection";
import type { ListItem } from "@utils/type";

export const FormProfile = ({ children }: PropsWithChildren) => {
	const toast = useRef<Toast>(null);
	const { data: myProfile } = trpc.profile.completeMe.useQuery();
	// const {mutate: createProfile} = trpc.profile.create.useMutation()
	// const {mutate: updateProfile} = trpc.profile.update.useMutation()
	const { mutate: saveProfile, isPending } = trpc.profile.save.useMutation();

	// const methods = useForm<Profile>({
	const methods = useForm<ProfileSaveInput & { id?: string }>({
		resolver: zodResolver(validationSchema),
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

	const onSubmit = (data: ProfileSaveInput & { id?: string; userId?: string }) => {
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
			experiences: (rest.experiences ?? [])
				.filter((e) => !isBlankExperience(e as ListItem<ExperienceInput>))
				.map((e) => ({
					...e,
					content: {
						...e.content,
						missions: (e.content.missions ?? []).filter((m) => m.content.content.trim()),
					},
				})),
			achievements: (rest.achievements ?? [])
				.filter((a) => !isBlankAchievement(a as ListItem<AchievementInput>))
				.map((a) => ({
					...a,
					content: {
						...a.content,
					},
				})),
			strengths: (rest.strengths ?? [])
				.filter((s) => !isBlankStrength(s as ListItem<StrengthInput>))
				.map((s) => ({
					...s,
					content: {
						...s.content,
					},
				})),
			projects: (rest.projects ?? [])
				.filter((p) => !isBlankProject(p as ListItem<ProjectInput>))
				.map((p) => ({
					...p,
					content: {
						...p.content,
					},
				})),
			publications: (rest.publications ?? [])
				.filter((p) => !isBlankPublication(p as ListItem<PublicationInput>))
				.map((p) => ({
					...p,
					content: {
						...p.content,
					},
				})),
			skillGroups: (rest.skillGroups ?? [])
				.filter((g) => !isBlankSkillGroup(g as ListItem<SkillGroupInput>))
				.map((g) => ({
					...g,
					content: {
						...g.content,
						skills: (g.content.skills ?? []).filter(
							(s) => !isBlankSkill(s as ListItem<SkillInput>),
						),
					},
				})),
			competenceGroups: (rest.competenceGroups ?? [])
				.filter((g) => !isBlankCompetenceGroup(g as ListItem<CompetenceGroupInput>))
				.map((g) => ({
					...g,
					content: {
						...g.content,
					},
				})),
			tagGroups: (rest.tagGroups ?? [])
				.filter((g) => !isBlankTagGroup(g as ListItem<TagGroupInput>))
				.map((g) => ({
					...g,
					content: {
						...g.content,
					},
				})),
			passions: (rest.passions ?? [])
				.filter((p) => !isBlankPassion(p as ListItem<PassionInput>))
				.map((p) => ({
					...p,
					content: {
						...p.content,
					},
				})),
			prizes: (rest.prizes ?? [])
				.filter((p) => !isBlankPrize(p as ListItem<PrizeInput>))
				.map((p) => ({
					...p,
					content: {
						...p.content,
					},
				})),
			certifications: (rest.certifications ?? [])
				.filter((c) => !isBlankCertification(c as ListItem<CertificationInput>))
				.map((c) => ({
					...c,
					content: {
						...c.content,
					},
				})),
			formations: (rest.formations ?? [])
				.filter((f) => !isBlankFormation(f as ListItem<FormationInput>))
				.map((f) => ({
					...f,
					content: {
						...f.content,
					},
				})),
			socialMedias: (rest.socialMedias ?? [])
				.filter((s) => !isBlankSocialMedia(s as ListItem<SocialMediaInput>))
				.map((s) => ({
					...s,
					content: {
						...s.content,
					},
				})),
			expertises: (rest.expertises ?? [])
				.filter((e) => !isBlankExpertise(e as ListItem<ExpertiseInput>))
				.map((e) => ({
					...e,
					content: {
						...e.content,
					},
				})),
			volunteerings: (rest.volunteerings ?? [])
				.filter((v) => !isBlankVolunteering(v as ListItem<VolunteeringInput>))
				.map((v) => ({
					...v,
					content: {
						...v.content,
					},
				})),
			educations: (rest.educations ?? [])
				.filter((e) => !isBlankEducation(e as ListItem<EducationInput>))
				.map((e) => ({
					...e,
					content: {
						...e.content,
					},
				})),
			languages: (rest.languages ?? [])
				.filter((l) => !isBlankLanguage(l as ListItem<LanguageInput>))
				.map((l) => ({
					...l,
					content: {
						...l.content,
					},
				})),
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
