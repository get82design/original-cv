import { trpc } from "@utils/trpc";
import { Button } from "primereact/button";
import { Dialog, type DialogProps } from "primereact/dialog";
import { PickList } from "primereact/picklist";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { MdArrowForwardIos } from "react-icons/md";
import type { ProfileComplete } from "../../form/FormCv";
import type { AchievementContentSettings, CertificationContentSettings, CompetenceContentSettings, EducationContentSettings, ExperienceContentSettings, ExpertiseContentSettings, FormationContentSettings, LanguageContentSettings, PassionContentSettings, PrizeContentSettings, ProjectContentSettings, PublicationContentSettings, SkillContentSettings, SocialMediaContentSettings, StrengthContentSettings, TagContentSettings, VolunteeringContentSettings } from "@/services/schemas/cvTemplate.schema";
import { createInitAchievement } from "../../template/components/achievement/initAchievement";
import { createInitExperience } from "../../template/components/experience/initExperience";
import { createInitCertification } from "../../template/components/certification/initCertification";
import { createInitEducation } from "../../template/components/education/initEducation";
import { createInitExpertise } from "../../template/components/expertise/initExpertise";
import { createInitFormation } from "../../template/components/formation/initFormation";
import { createInitLanguage } from "../../template/components/language/initLanguage";
import { createInitPassion } from "../../template/components/passion/initPassion";
import { createInitPrize } from "../../template/components/prize/initPrize";
import { createInitProject } from "../../template/components/project/initProject";
import { createInitPublication } from "../../template/components/publication/initPublication";
import { createInitSocialMedia } from "../../template/components/social-media/initSocialMedia";
import { createInitStrength } from "../../template/components/strength/initStrength";
import { createInitVolunteering } from "../../template/components/volunteering/initVolunteering";
import { createInitTag } from "../../template/components/tag/initTag";
import { createInitSkill } from "../../template/components/skill/initSkill";
import { createInitCompetence } from "../../template/components/competence/initCompetence";

interface DialogDataSectionFromProfileProps extends DialogProps {
    sectionSelected: string;
}

type Draft = { title?: string; settings?: unknown; content: unknown };

function mapProfileExperiencesToCvItems(experiences: ProfileComplete["experiences"], contentSettings: ExperienceContentSettings | undefined) {
    return experiences.map((e) => ({
      clientKey: e.id,
      order: e.order,
      content: {
        title: e.title,
        company: e.company,
        start: e.start,
        end: e.end,
        description: e.description ?? undefined,
        location: e.location ?? undefined,
        missions: (e.missions ?? []).map((m) => ({
          clientKey: m.id,
          order: m.order,
          content: { content: m.content },
        })),
        settings: contentSettings, // selon ta forme section
      },
    }));
}

function mapProfileTagsToCvGroups(tags: ProfileComplete["tags"], contentSettings: TagContentSettings | undefined) {
    return tags.map((t) => ({
      clientKey: t.id,
      order: t.order,
      content: {
        title: t.title ?? "",
        tags: (t.tags ?? []).map((tg) => ({
          clientKey: tg.id,
          order: tg.order,
          content: { name: tg.tag.name, tagId: tg.tagId },
        })),
        settings: {
            ...contentSettings,
            withGroupTitle: Boolean(t.title),
          }, // avec withGroupTitle, etc.
      },
    }));
}

function mapProfileSkillsToCvGroups(skills: ProfileComplete["skills"], contentSettings: SkillContentSettings | undefined) {
    return skills.map((s) => ({
      clientKey: s.id,
      order: s.order,
      content: { title: s.title, skills: (s.skills ?? []).map((sk) => ({
        clientKey: sk.id,
        order: sk.order,
        content: { name: sk.skill.name, level: sk.level, skillId: sk.skillId },
      })),
      settings: {
        ...contentSettings,
        withGroupTitle: Boolean(s.title),
      }, // avec withGroupTitle, etc.
    },
    }));
}

function mapProfileCompetencesToCvGroups(competences: ProfileComplete["competences"], contentSettings: CompetenceContentSettings | undefined) {
    return competences.map((c) => ({
      clientKey: c.id,
      order: c.order,
      content: { title: c.title, competences: (c.competences ?? []).map((co) => ({
        clientKey: co.id,
        order: co.order,
        content: { name: co.competence.name, competenceId: co.competenceId },
      })),
      settings: {
        ...contentSettings,
        withGroupTitle: Boolean(c.title),
      }, // avec withGroupTitle, etc.
    },
    }));
}

function mapProfileAchievementsToCvItems(achievements: ProfileComplete["achievements"], contentSettings: AchievementContentSettings | undefined) {
    return achievements.map((a) => ({
      clientKey: a.id,
      order: a.order,
      content: { 
        title: a.title, 
        technology: a.technology, 
        year: a.year, 
        description: a.description ?? undefined,
        settings: contentSettings,
      },
    }));
}

function mapProfileCertificationsToCvItems(certifications: ProfileComplete["certifications"], contentSettings: CertificationContentSettings | undefined) {
    return certifications.map((c) => ({
      clientKey: c.id,
      order: c.order,
      content: { title: c.title, organismeCertification: c.organismeCertification, settings: contentSettings },
    }));
}

function mapProfileEducationsToCvItems(educations: ProfileComplete["educations"], contentSettings: EducationContentSettings | undefined) {
    return educations.map((e) => ({
      clientKey: e.id,
      order: e.order,
      content: {
        title: e.title ?? "",
        school: e.school,
        degree: e.degree ?? "",
        start: e.start,
        end: e.end ?? undefined,
        obtained: e.obtained,
        city: e.city ?? undefined,
        settings: contentSettings,
      },
    }));
}

function mapProfileExpertisesToCvItems(expertises: ProfileComplete["expertises"], contentSettings: ExpertiseContentSettings | undefined) {
    return expertises.map((e) => ({
      clientKey: e.id,
      order: e.order,
      content: { 
        title: e.title, 
        level: e.level, 
        settings: contentSettings 
      },
    }));
}

function mapProfileFormationsToCvItems(formations: ProfileComplete["formations"], contentSettings: FormationContentSettings | undefined) {
    return formations.map((f) => ({
      clientKey: f.id,
      order: f.order,
      content: { 
        title: f.title, 
        organismeFormation: f.organismeFormation, 
        start: f.start,
        end: f.end ?? undefined,
        status: f.status,
        settings: contentSettings 
      },
    }));
}

function mapProfileLanguagesToCvItems(languages: ProfileComplete["languages"], contentSettings: LanguageContentSettings | undefined) {
    return languages.map((l) => ({
      clientKey: l.id,
      order: l.order,
      content: { 
        name: l.name, 
        level: l.level, 
        settings: contentSettings 
      },
    }));
}

function mapProfilePassionsToCvItems(passions: ProfileComplete["passions"], contentSettings: PassionContentSettings | undefined) {
    return passions.map((p) => ({
      clientKey: p.id,
      order: p.order,
      content: { title: p.title, icon: p.icon, settings: contentSettings },
    }));
}

function mapProfilePrizesToCvItems(prizes: ProfileComplete["prizes"], contentSettings: PrizeContentSettings | undefined) {
    return prizes.map((p) => ({
      clientKey: p.id,
      order: p.order,
      content: { title: p.title, domaine: p.domaine, icon: p.icon, settings: contentSettings },
    }));
}

function mapProfileProjectsToCvItems(projects: ProfileComplete["projects"], contentSettings: ProjectContentSettings | undefined) {
    return projects.map((p) => ({
      clientKey: p.id,
      order: p.order,
      content: { 
        title: p.title, 
        description: p.description, 
        location: p.location, 
        start: p.start, 
        end: p.end, 
        technology: p.technology, 
        missions: (p.missions ?? []).map((m) => ({
            clientKey: m.id,
            order: m.order,
            content: { content: m.content },
          })),
        settings: contentSettings 
      },
    }));
}

function mapProfilePublicationsToCvItems(publications: ProfileComplete["publications"], contentSettings: PublicationContentSettings | undefined) {
    return publications.map((p) => ({
      clientKey: p.id,
      order: p.order,
      content: { 
        title: p.title, 
        description: p.description, 
        journalName: p.journalName, 
        start: p.start, 
        end: p.end, 
        url: p.url, 
        settings: contentSettings 
      },
    }));
}

function mapProfileSocialMediaToCvItems(socialMedias: ProfileComplete["socialMedias"], contentSettings: SocialMediaContentSettings | undefined) {

    return socialMedias.map((s) => ({
      clientKey: s.id,
      order: s.order,
      content: { 
        socialNetwork: s.socialNetwork, 
        username: s.username, 
        icon: s.icon, 
        settings: contentSettings 
      },
    }));
}

function mapProfileStrengthsToCvItems(strengths: ProfileComplete["strengths"], contentSettings: StrengthContentSettings | undefined) {
    return strengths.map((s) => ({
      clientKey: s.id,
      order: s.order,
      content: { title: s.title, description: s.description, icon: s.icon, settings: contentSettings },
    }));
}

function mapProfileVolunteeringToCvItems(volunteerings: ProfileComplete["volunteerings"], contentSettings: VolunteeringContentSettings | undefined) {
    return volunteerings.map((v) => ({
      clientKey: v.id,
      order: v.order,
      content: { 
        title: v.title, 
        organisation: v.organisation, 
        description: v.description, 
        start: v.start, 
        end: v.end, 
        location: v.location, 
        missions: (v.missions ?? []).map((m) => ({
            clientKey: m.id,
            order: m.order,
            content: { content: m.content },
          })), 
        settings: contentSettings 
      },
    }));
}

export const DialogDataSectionFromProfile = ({visible, onHide, sectionSelected}: DialogDataSectionFromProfileProps) => {
    const {watch, setValue} = useFormContext();
	const { data: profile } = trpc.profile.completeMe.useQuery();
    const sectionName = sectionSelected.replace(/^section-/, "");
    const datasKey =
        sectionName === "tag" ? "tagGroup"
        : sectionName === "skill" ? "skillGroup"
        : sectionName === "competence" ? "competenceGroup"
        : sectionName;
    const cvSection  = watch(`datas.${datasKey}`);
    // const dataProfile = profile?.[sectionName as keyof typeof profile];
    // console.log(dataCv, dataProfile);
    // const [dataBeforeCommit, setDataBeforeCommit] = useState<any>(null);

    const [draft, setDraft] = useState<Draft | null>(null);

    useEffect(() => {
        if (!visible) return;
        setDraft(
          structuredClone(
            cvSection ?? {
              title: "Philosophie",
              content: { citation: "", author: "" },
              settings: {},
            },
          ),
        );
    }, [visible, sectionName]);

    const onValidate = () => {
        if (draft) setValue(`datas.${datasKey}`, draft, { shouldDirty: true });
        onHide();
      };

    // useEffect(() => {
    //     if (dataCv) {
    //         setDataBeforeCommit(dataCv);
    //     }
    // }, [dataCv])

    const footer = () => {
        return (
            <div className="flex justify-end gap-2">
                <Button
					label="Annuler"
					outlined
					onClick={onHide}
					className="!text-zinc-600 dark:!text-zinc-300 !border-zinc-300 dark:!border-zinc-600 hover:!bg-zinc-100 dark:hover:!bg-zinc-800"
				/>
                <Button
					label="Valider"
					onClick={onValidate}
					className="bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black font-semibold"
				/>
            </div>
        );
    };
    return (
        <Dialog
			visible={visible}
			onHide={onHide}
			header="Données du profil"
			style={{ width: "900px", maxWidth: "85vw" }}
			className="dialog-data-from-profile"
			footer={footer}
        >
            {sectionName === "description" && (
                <ScalarTransfer
                    profileText={profile?.description?.description ?? ""}
                    cvText={(draft?.content as { description?: string })?.description ?? ""}
                    onApply={(text) =>
                        setDraft((d) => d && { ...d, content: { ...d.content as object, description: text } })
                    }
                    labels={{ left: "Tableau de bord", right: "CV" }}
                />
            )}
            {sectionName === "philosophy" && (
                <ScalarTransfer
                    profileText={profile?.philosophy?.citation ?? ""}
                    cvText={(draft?.content as { citation?: string })?.citation ?? ""}
                    onApply={(text) =>
                        setDraft((d) =>
                            d && {
                              ...d,
                              content: {
                                citation: profile?.philosophy?.citation ?? "",
                                author: profile?.philosophy?.author ?? "",
                              },
                              settings: {
                                ...(d.settings as object),
                                withAuthor: Boolean(profile?.philosophy?.author),
                              },
                            },
                        )
                    }
                    labels={{ left: "Tableau de bord", right: "CV" }}
                />
            )}
            {sectionName === "experience" && (
                <ListTransfer
                    source={mapProfileExperiencesToCvItems(
                        profile?.experiences ?? [],
                        cvSection?.content?.[0]?.content?.settings
                           ?? createInitExperience().content.settings
                      )}
                    target={(draft?.content as any[]) ?? []}
                    onChange={(next) => setDraft((d) => d && { ...d, content: next })}
                    getKey={(item) => `${item.content.title}|${item.content.company ?? ""}`}
                    itemTemplate={(item) => <p className="font-semibold">{item.content.title}</p>}
                />
            )}
            {sectionName === "achievement" && (
                <ListTransfer
                    source={mapProfileAchievementsToCvItems(profile?.achievements ?? [], cvSection?.content?.[0]?.content?.settings
                        ?? createInitAchievement().content.settings)}
                    target={(draft?.content as any[]) ?? []}
                    onChange={(next) => setDraft((d) => d && { ...d, content: next })}
                    getKey={(item) => `${item.content.title}|${item.content.technology ?? ""}`}
                    itemTemplate={(item) => <p className="font-semibold">{item.content.title}</p>}
                />
            )}
            {sectionName === "certification" && (
                <ListTransfer
                    source={mapProfileCertificationsToCvItems(profile?.certifications ?? [], cvSection?.content?.[0]?.content?.settings
                        ?? createInitCertification().content.settings)}
                    target={(draft?.content as any[]) ?? []}
                    onChange={(next) => setDraft((d) => d && { ...d, content: next })}
                    getKey={(item) => `${item.content.title}|${item.content.organismeCertification ?? ""}`}
                    itemTemplate={(item) => <p className="font-semibold">{item.content.title}</p>}
                />
            )}
            {sectionName === 'education' && (
                <ListTransfer
                    source={mapProfileEducationsToCvItems(profile?.educations ?? [], cvSection?.content?.[0]?.content?.settings
                        ?? createInitEducation().content.settings)}
                    target={(draft?.content as any[]) ?? []}
                    onChange={(next) => setDraft((d) => d && { ...d, content: next })}
                    getKey={(item) => `${item.content.title}|${item.content.school ?? ""}`}
                    itemTemplate={(item) => <p className="font-semibold">{item.content.title}</p>}
                />
            )}
            {sectionName === "expertise" && (
                <ListTransfer
                    source={mapProfileExpertisesToCvItems(profile?.expertises ?? [], cvSection?.content?.[0]?.content?.settings
                        ?? createInitExpertise().content.settings)}
                    target={(draft?.content as any[]) ?? []}
                    onChange={(next) => setDraft((d) => d && { ...d, content: next })}
                    getKey={(item) => `${item.content.title}|${item.content.level ?? ""}`}
                    itemTemplate={(item) => <p className="font-semibold">{item.content.title}</p>}
                />
            )}
            {sectionName === "formation" && (
                <ListTransfer
                    source={mapProfileFormationsToCvItems(profile?.formations ?? [], cvSection?.content?.[0]?.content?.settings
                        ?? createInitFormation().content.settings)}
                    target={(draft?.content as any[]) ?? []}
                    onChange={(next) => setDraft((d) => d && { ...d, content: next })}
                    getKey={(item) => `${item.content.title}|${item.content.organismeFormation ?? ""}`}
                    itemTemplate={(item) => <p className="font-semibold">{item.content.title}</p>}
                />
            )}
            {sectionName === 'language' && (
                <ListTransfer
                    source={mapProfileLanguagesToCvItems(profile?.languages ?? [], cvSection?.content?.[0]?.content?.settings
                        ?? createInitLanguage().content.settings)}
                    target={(draft?.content as any[]) ?? []}
                    onChange={(next) => setDraft((d) => d && { ...d, content: next })}
                    getKey={(item) => `${item.content.name}|${item.content.level ?? ""}`}
                    itemTemplate={(item) => <p className="font-semibold">{item.content.name}</p>}
                />
            )}
            {sectionName === "passion" && (
                <ListTransfer
                    source={mapProfilePassionsToCvItems(profile?.passions ?? [], cvSection?.content?.[0]?.content?.settings
                        ?? createInitPassion().content.settings)}
                    target={(draft?.content as any[]) ?? []}
                    onChange={(next) => setDraft((d) => d && { ...d, content: next })}
                    getKey={(item) => `${item.content.title}|${item.content.icon ?? ""}`}
                    itemTemplate={(item) => <p className="font-semibold">{item.content.title}</p>}
                />
            )}
            {sectionName === "prize" && (
                <ListTransfer
                    source={mapProfilePrizesToCvItems(profile?.prizes ?? [], cvSection?.content?.[0]?.content?.settings
                        ?? createInitPrize().content.settings)}
                    target={(draft?.content as any[]) ?? []}
                    onChange={(next) => setDraft((d) => d && { ...d, content: next })}
                    getKey={(item) => `${item.content.title}|${item.content.domaine ?? ""}`}
                    itemTemplate={(item) => <p className="font-semibold">{item.content.title}</p>}
                />
            )}
            {sectionName === "project" && (
                <ListTransfer
                    source={mapProfileProjectsToCvItems(profile?.projects ?? [], cvSection?.content?.[0]?.content?.settings
                        ?? createInitProject().content.settings)}
                    target={(draft?.content as any[]) ?? []}
                    onChange={(next) => setDraft((d) => d && { ...d, content: next })}
                    getKey={(item) => `${item.content.title}|${item.content.technology ?? ""}`}
                    itemTemplate={(item) => <p className="font-semibold">{item.content.title}</p>}
                />
            )}
            {sectionName === "publication" && (
                <ListTransfer
                    source={mapProfilePublicationsToCvItems(profile?.publications ?? [], cvSection?.content?.[0]?.content?.settings
                        ?? createInitPublication().content.settings)}
                    target={(draft?.content as any[]) ?? []}
                    onChange={(next) => setDraft((d) => d && { ...d, content: next })}
                    getKey={(item) => `${item.content.title}|${item.content.journalName ?? ""}`}
                    itemTemplate={(item) => <p className="font-semibold">{item.content.title}</p>}
                />
            )}
            {sectionName === "socialMedia" && (
                <ListTransfer
                    source={mapProfileSocialMediaToCvItems(profile?.socialMedias ?? [], cvSection?.content?.[0]?.content?.settings
                        ?? createInitSocialMedia().content.settings)}
                    target={(draft?.content as any[]) ?? []}
                    onChange={(next) => setDraft((d) => d && { ...d, content: next })}
                    getKey={(item) => `${item.content.socialNetwork}|${item.content.username ?? ""}`}
                    itemTemplate={(item) => <p className="font-semibold">{item.content.socialNetwork}</p>}
                />
            )}
            {sectionName === "strength" && (
                <ListTransfer
                    source={mapProfileStrengthsToCvItems(profile?.strengths ?? [], cvSection?.content?.[0]?.content?.settings
                        ?? createInitStrength().content.settings)}
                    target={(draft?.content as any[]) ?? []}
                    onChange={(next) => setDraft((d) => d && { ...d, content: next })}
                    getKey={(item) => `${item.content.title}|${item.content.icon ?? ""}`}
                    itemTemplate={(item) => <p className="font-semibold">{item.content.title}</p>}
                />
            )}
            {sectionName === 'volunteering' && (
                <ListTransfer
                    source={mapProfileVolunteeringToCvItems(profile?.volunteerings ?? [], cvSection?.content?.[0]?.content?.settings
                        ?? createInitVolunteering().content.settings)}
                    target={(draft?.content as any[]) ?? []}
                    onChange={(next) => setDraft((d) => d && { ...d, content: next })}
                    getKey={(item) => `${item.content.title}|${item.content.organisation ?? ""}`}
                    itemTemplate={(item) => <p className="font-semibold">{item.content.title}</p>}
                />
            )}
            {sectionName === "tag" && (
                <GroupTransfer
                    source={mapProfileTagsToCvGroups(profile?.tags ?? [], cvSection?.content?.[0]?.content?.settings ?? createInitTag().content.settings)}
                    target={Array.isArray(draft?.content) ? draft.content : []}
                    onChange={(next) => setDraft((d) => d && { ...d, content: next })}
                    getKey={(g) => g.content.title}
                    itemTemplate={(g) => (
                        <div>
                            <p className="font-semibold">{g.content.title}</p>
                        </div>
                    )}
                />
            )}
            {sectionName === "skill" && (
                <GroupTransfer
                    source={mapProfileSkillsToCvGroups(profile?.skills ?? [], cvSection?.content?.[0]?.content?.settings ?? createInitSkill().content.settings)}
                    target={Array.isArray(draft?.content) ? draft.content : []}
                    onChange={(next) => setDraft((d) => d && { ...d, content: next })}
                    getKey={(g) => g.content.title}
                    itemTemplate={(g) => (
                        <div>
                            <p className="font-semibold">{g.content.title}</p>
                        </div>
                    )}
                />
            )}
            {sectionName === "competence" && (
                <GroupTransfer
                    source={mapProfileCompetencesToCvGroups(profile?.competences ?? [], cvSection?.content?.[0]?.content?.settings ?? createInitCompetence().content.settings)}
                    target={Array.isArray(draft?.content) ? draft.content : []}
                    onChange={(next) => setDraft((d) => d && { ...d, content: next })}
                    getKey={(g) => g.content.title}
                    itemTemplate={(g) => (
                        <div>
                            <p className="font-semibold">{g.content.title}</p>
                        </div>
                    )}
                />
            )}
        </Dialog>
    );
}

type ScalarTransferProps = {
    profileText: string;
    cvText: string;
    onApply: (text: string) => void;
    labels: { left: string; right: string };
};

export function ScalarTransfer({ profileText, cvText, onApply, labels }: ScalarTransferProps) {
    return (
      <div className="w-full grid grid-cols-11 gap-8 text-zinc-900 dark:text-zinc-100">
        <div className="col-span-5 flex flex-col gap-2">
          <p className="text-lg font-semibold">{labels.left}</p>
          <p className="text-justify whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{profileText || "—"}</p>
        </div>
        <div className="col-span-1 flex justify-center items-center">
          <Button
            icon={<MdArrowForwardIos />}
            disabled={!profileText}
            onClick={() => onApply(profileText)}
            aria-label="Appliquer au CV"
			className="bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white dark:text-black"
          />
        </div>
        <div className="col-span-5 flex flex-col gap-2">
          <p className="text-lg font-semibold">{labels.right}</p>
          <p className="text-justify whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{cvText || "—"}</p>
        </div>
      </div>
    );
}

type ListTransferProps<T extends { clientKey: string }> = {
    source: T[];
    target: T[];
    onChange: (target: T[]) => void;
    getKey: (item: T) => string; // dédup
    itemTemplate: (item: T) => React.ReactNode;
    sourceHeader?: string;
    targetHeader?: string;
};
export function ListTransfer<T extends { clientKey: string }>({
    source,
    target,
    onChange,
    getKey,
    itemTemplate,
    sourceHeader = "Profil",
    targetHeader = "CV",
  }: ListTransferProps<T>) {
    const already = new Set(target?.map(getKey));
    const available = source.filter((s) => !already.has(getKey(s)));
    return (
      <PickList
        dataKey="clientKey"
        source={available}
        target={target}
        onChange={(e) => {
          // source recalculé via filter ; on ne stocke que le target
          onChange(e.target);
        }}
        itemTemplate={itemTemplate}
        breakpoint="1280px"
        sourceHeader={sourceHeader}
        targetHeader={targetHeader}
        sourceStyle={{ height: "24rem" }}
        targetStyle={{ height: "24rem" }}
      />
    );
}

export function GroupTransfer<T extends { clientKey: string }>(props: ListTransferProps<T>) {
    return (
      <ListTransfer
        {...props}
        sourceHeader={props.sourceHeader ?? "Groupes profil"}
        targetHeader={props.targetHeader ?? "Groupes CV"}
      />
    );
}