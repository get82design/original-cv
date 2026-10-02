import { prisma } from "../../../lib/prisma";
import { NotFoundError } from "../errors";
import type { ProfileSaveInput } from "../schemas/profileSave.schema";

export class ProfileSaveService {
	async save(userId: string, input: ProfileSaveInput) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!user) {
			throw new NotFoundError("User", userId);
		}

		return prisma.$transaction(async (tx) => {
			// ——— 1. Profile (upsert via userId) ———
			const profile = await tx.profile.upsert({
				where: { userId },
				create: {
					userId,
					firstName: input.firstName,
					lastName: input.lastName,
					phone: input.phone ?? null,
					location: input.location ?? null,
					email: input.email ?? null,
					photo: input.photo ?? null,
				},
				update: {
					firstName: input.firstName,
					lastName: input.lastName,
					phone: input.phone ?? null,
					location: input.location ?? null,
					email: input.email ?? null,
					photo: input.photo ?? null,
				},
			});

			// ——— 2. Description (1:1, upsert via profileId) ———
			if (input.description) {
				await tx.description.upsert({
					where: { profileId: profile.id },
					create: {
						profileId: profile.id,
						description: input.description.description,
					},
					update: {
						description: input.description.description,
					},
				});
			} else {
				await tx.description.deleteMany({ where: { profileId: profile.id } });
			}

			// ——— 3. Philosophy (1:1, upsert via profileId) ———

			if (input.philosophy) {
				await tx.philosophy.upsert({
					where: { profileId: profile.id },
					create: {
						profileId: profile.id,
						citation: input.philosophy.citation,
						author: input.philosophy.author ?? null,
					},
					update: {
						citation: input.philosophy.citation,
						author: input.philosophy.author ?? null,
					},
				});
			} else {
				await tx.philosophy.deleteMany({ where: { profileId: profile.id } });
			}

			// ——— 3. Experiences (many:1, upsert via profileId) ———
			if (input.experiences) {
				const items = input.experiences;
				const keepIds = items.map((i) => i.id).filter((id): id is string => !!id);
				await tx.experience.deleteMany({
					where: keepIds.length
						? { profileId: profile.id, id: { notIn: keepIds } }
						: { profileId: profile.id },
				});
				for (const [index, item] of items.entries()) {
					const order = item.order ?? index;
					const { missions: _missions, ...rest } = item.content;
					const data = {
						title: rest.title,
						company: rest.company ?? "",
						start: rest.start,
						end: rest.end ?? null,
						location: rest.location ?? null,
						description: rest.description ?? null,
						order,
					};

					let experienceId = item.id;
					if (experienceId) {
						await tx.experience.update({ where: { id: experienceId }, data });
					} else {
						const created = await tx.experience.create({
							data: { profileId: profile.id, ...data },
						});
						experienceId = created.id;
					}
					const missions = _missions ?? [];
					const keepMissionIds = missions.map((m) => m.id).filter((id): id is string => !!id);
					await tx.missionExperience.deleteMany({
						where: keepMissionIds.length
							? { experienceId, id: { notIn: keepMissionIds } }
							: { experienceId },
					});
					for (const [mIndex, m] of missions.entries()) {
						const mOrder = m.order ?? mIndex;
						const text = m.content.content;
						if (m.id) {
							await tx.missionExperience.update({
								where: { id: m.id },
								data: { content: text, order: mOrder },
							});
						} else {
							await tx.missionExperience.create({
								data: { experienceId, content: text, order: mOrder },
							});
						}
					}
				}
			}

			// ——— 4. Strengths (many:1, upsert via profileId) ———
			if (input.strengths) {
				const items = input.strengths;
				const keepIds = items.map((i) => i.id).filter((id): id is string => !!id);
				await tx.strength.deleteMany({
					where: keepIds.length
						? { profileId: profile.id, id: { notIn: keepIds } }
						: { profileId: profile.id },
				});
				for (const [index, item] of items.entries()) {
					const order = item.order ?? index;
					const { description: _description, ...rest } = item.content;
					const data = {
						icon: rest.icon ?? "",
						title: rest.title,
						description: _description ?? null,
						order,
					};
					if (item.id) {
						await tx.strength.update({ where: { id: item.id }, data });
					} else {
						await tx.strength.create({
							data: { profileId: profile.id, ...data },
						});
					}
				}
			}

			// ——— 4b. Stats (many:1, upsert via profileId) ———
			if (input.stats) {
				const items = input.stats;
				const keepIds = items.map((i) => i.id).filter((id): id is string => !!id);
				await tx.stat.deleteMany({
					where: keepIds.length
						? { profileId: profile.id, id: { notIn: keepIds } }
						: { profileId: profile.id },
				});
				for (const [index, item] of items.entries()) {
					const order = item.order ?? index;
					const data = {
						label: item.content.label,
						value: item.content.value,
						order,
					};
					if (item.id) {
						await tx.stat.update({ where: { id: item.id }, data });
					} else {
						await tx.stat.create({
							data: { profileId: profile.id, ...data },
						});
					}
				}
			}

			// ——— 5. Projects (many:1, upsert via profileId) ———
			if (input.projects) {
				const items = input.projects;
				const keepIds = items.map((i) => i.id).filter((id): id is string => !!id);
				await tx.project.deleteMany({
					where: keepIds.length
						? { profileId: profile.id, id: { notIn: keepIds } }
						: { profileId: profile.id },
				});
				for (const [index, item] of items.entries()) {
					const order = item.order ?? index;
					const { missions: _missions, ...rest } = item.content;
					const data = {
						title: rest.title,
						start: rest.start,
						end: rest.end ?? null,
						location: rest.location ?? null,
						description: rest.description ?? null,
						result: rest.result ?? null,
						technology: rest.technology ?? null,
						status: rest.status ?? null,
						order,
					};

					let projectId = item.id;
					if (projectId) {
						await tx.project.update({ where: { id: projectId }, data });
					} else {
						const created = await tx.project.create({
							data: { profileId: profile.id, ...data },
						});
						projectId = created.id;
					}
					const missions = _missions ?? [];
					const keepMissionIds = missions.map((m) => m.id).filter((id): id is string => !!id);
					await tx.missionProject.deleteMany({
						where: keepMissionIds.length
							? { projectId, id: { notIn: keepMissionIds } }
							: { projectId },
					});
					for (const [mIndex, m] of missions.entries()) {
						const mOrder = m.order ?? mIndex;
						const text = m.content.content;
						if (m.id) {
							await tx.missionProject.update({
								where: { id: m.id },
								data: { content: text, order: mOrder },
							});
						} else {
							await tx.missionProject.create({
								data: { projectId, content: text, order: mOrder },
							});
						}
					}
				}
			}

			// ——— 6. Achievements (many:1, upsert via profileId) ———
			if (input.achievements) {
				const items = input.achievements;
				const keepIds = items.map((i) => i.id).filter((id): id is string => !!id);
				await tx.achievement.deleteMany({
					where: keepIds.length
						? { profileId: profile.id, id: { notIn: keepIds } }
						: { profileId: profile.id },
				});
				for (const [index, item] of items.entries()) {
					const order = item.order ?? index;
					const { description: _description, ...rest } = item.content;
					const data = {
						title: rest.title,
						description: _description ?? null,
						technology: rest.technology ?? null,
						year: rest.year ?? null,
						order,
					};
					if (item.id) {
						await tx.achievement.update({ where: { id: item.id }, data });
					} else {
						await tx.achievement.create({
							data: { profileId: profile.id, ...data },
						});
					}
				}
			}

			// ——— 7. Publications (many:1, upsert via profileId) ———
			if (input.publications) {
				const items = input.publications;
				const keepIds = items.map((i) => i.id).filter((id): id is string => !!id);
				await tx.publication.deleteMany({
					where: keepIds.length
						? { profileId: profile.id, id: { notIn: keepIds } }
						: { profileId: profile.id },
				});
				for (const [index, item] of items.entries()) {
					const order = item.order ?? index;
					const { description: _description, ...rest } = item.content;
					const data = {
						title: rest.title,
						description: _description ?? null,
						start: rest.start,
						end: rest.end ?? null,
						url: rest.url ?? null,
						journalName: rest.journalName ?? null,
						order,
					};
					if (item.id) {
						await tx.publication.update({ where: { id: item.id }, data });
					} else {
						await tx.publication.create({
							data: { profileId: profile.id, ...data },
						});
					}
				}
			}

			// ——— 8. Volunteering (many:1, upsert via profileId) ———
			if (input.volunteerings) {
				const items = input.volunteerings;
				const keepIds = items.map((i) => i.id).filter((id): id is string => !!id);
				await tx.volunteering.deleteMany({
					where: keepIds.length
						? { profileId: profile.id, id: { notIn: keepIds } }
						: { profileId: profile.id },
				});
				for (const [index, item] of items.entries()) {
					const order = item.order ?? index;
					const { description: _description, ...rest } = item.content;
					const data = {
						title: rest.title,
						organisation: rest.organisation ?? "",
						location: rest.location ?? null,
						description: _description ?? null,
						start: rest.start,
						end: rest.end ?? null,
						order,
					};
					let volunteeringId = item.id;
					if (volunteeringId) {
						await tx.volunteering.update({
							where: { id: volunteeringId },
							data,
						});
					} else {
						const created = await tx.volunteering.create({
							data: { profileId: profile.id, ...data },
						});
						volunteeringId = created.id;
					}
					const missions = rest.missions ?? [];
					const keepMissionIds = missions.map((m) => m.id).filter((id): id is string => !!id);
					await tx.missionVolunteering.deleteMany({
						where: keepMissionIds.length
							? { volunteeringId, id: { notIn: keepMissionIds } }
							: { volunteeringId },
					});
					for (const [mIndex, m] of missions.entries()) {
						const mOrder = m.order ?? mIndex;
						const text = m.content.content;
						if (m.id) {
							await tx.missionVolunteering.update({
								where: { id: m.id },
								data: { content: text, order: mOrder },
							});
						} else {
							await tx.missionVolunteering.create({
								data: { volunteeringId, content: text, order: mOrder },
							});
						}
					}
				}
			}

			// ——— 9. Educations (many:1, upsert via profileId) ———
			if (input.educations) {
				const items = input.educations;
				const keepIds = items.map((i) => i.id).filter((id): id is string => !!id);
				await tx.education.deleteMany({
					where: keepIds.length
						? { profileId: profile.id, id: { notIn: keepIds } }
						: { profileId: profile.id },
				});
				for (const [index, item] of items.entries()) {
					const order = item.order ?? index;
					const { ...rest } = item.content;
					const data = {
						title: rest.title ?? "",
						school: rest.school ?? "",
						degree: rest.degree ?? "",
						start: rest.start,
						end: rest.end ?? null,
						city: rest.city ?? null,
						obtained: rest.obtained ?? null,
						order,
					};
					if (item.id) {
						await tx.education.update({ where: { id: item.id }, data });
					} else {
						await tx.education.create({
							data: { profileId: profile.id, ...data },
						});
					}
				}
			}

			// ——— 10. Languages (many:1, upsert via profileId) ———
			if (input.languages) {
				const items = input.languages;
				const keepIds = items.map((i) => i.id).filter((id): id is string => !!id);
				await tx.language.deleteMany({
					where: keepIds.length
						? { profileId: profile.id, id: { notIn: keepIds } }
						: { profileId: profile.id },
				});
				for (const [index, item] of items.entries()) {
					const order = item.order ?? index;
					const { ...rest } = item.content;
					const data = {
						name: rest.name ?? "",
						level: rest.level ?? "Débutant",
						order,
					};
					if (item.id) {
						await tx.language.update({ where: { id: item.id }, data });
					} else {
						await tx.language.create({
							data: { profileId: profile.id, ...data },
						});
					}
				}
			}

			// ——— 11. Expertises (many:1, upsert via profileId) ———
			if (input.expertises) {
				const items = input.expertises;
				const keepIds = items.map((i) => i.id).filter((id): id is string => !!id);
				await tx.expertise.deleteMany({
					where: keepIds.length
						? { profileId: profile.id, id: { notIn: keepIds } }
						: { profileId: profile.id },
				});
				for (const [index, item] of items.entries()) {
					const order = item.order ?? index;
					const { ...rest } = item.content;
					const data = {
						title: rest.title ?? "",
						level: rest.level ?? "Débutant",
						order,
					};
					if (item.id) {
						await tx.expertise.update({ where: { id: item.id }, data });
					} else {
						await tx.expertise.create({
							data: { profileId: profile.id, ...data },
						});
					}
				}
			}

			// ——— 12. Certifications (many:1, upsert via profileId) ———
			if (input.certifications) {
				const items = input.certifications;
				const keepIds = items.map((i) => i.id).filter((id): id is string => !!id);
				await tx.certification.deleteMany({
					where: keepIds.length
						? { profileId: profile.id, id: { notIn: keepIds } }
						: { profileId: profile.id },
				});
				for (const [index, item] of items.entries()) {
					const order = item.order ?? index;
					const { ...rest } = item.content;
					const data = {
						title: rest.title ?? "",
						organismeCertification: rest.organismeCertification ?? "",
						order,
					};
					if (item.id) {
						await tx.certification.update({ where: { id: item.id }, data });
					} else {
						await tx.certification.create({
							data: { profileId: profile.id, ...data },
						});
					}
				}
			}

			// ——— 13. Formations (many:1, upsert via profileId) ———
			if (input.formations) {
				const items = input.formations;
				const keepIds = items.map((i) => i.id).filter((id): id is string => !!id);
				await tx.formation.deleteMany({
					where: keepIds.length
						? { profileId: profile.id, id: { notIn: keepIds } }
						: { profileId: profile.id },
				});
				for (const [index, item] of items.entries()) {
					const order = item.order ?? index;
					const { ...rest } = item.content;
					const data = {
						title: rest.title ?? "",
						organismeFormation: rest.organismeFormation ?? "",
						start: rest.start,
						end: rest.end ?? null,
						status: rest.status ?? null,
						order,
					};
					if (item.id) {
						await tx.formation.update({ where: { id: item.id }, data });
					} else {
						await tx.formation.create({
							data: { profileId: profile.id, ...data },
						});
					}
				}
			}

			// ——— 14. Passions (many:1, upsert via profileId) ———
			if (input.passions) {
				const items = input.passions;
				const keepIds = items.map((i) => i.id).filter((id): id is string => !!id);
				await tx.passion.deleteMany({
					where: keepIds.length
						? { profileId: profile.id, id: { notIn: keepIds } }
						: { profileId: profile.id },
				});
				for (const [index, item] of items.entries()) {
					const order = item.order ?? index;
					const { ...rest } = item.content;
					const data = {
						title: rest.title ?? "",
						icon: rest.icon ?? "",
						order,
					};
					if (item.id) {
						await tx.passion.update({ where: { id: item.id }, data });
					} else {
						await tx.passion.create({
							data: { profileId: profile.id, ...data },
						});
					}
				}
			}

			// ——— 15. Prizes (many:1, upsert via profileId) ———

			if (input.prizes) {
				const items = input.prizes;
				const keepIds = items.map((i) => i.id).filter((id): id is string => !!id);
				await tx.prize.deleteMany({
					where: keepIds.length
						? { profileId: profile.id, id: { notIn: keepIds } }
						: { profileId: profile.id },
				});
				for (const [index, item] of items.entries()) {
					const order = item.order ?? index;
					const { ...rest } = item.content;
					const data = {
						title: rest.title ?? "",
						icon: rest.icon ?? "",
						domaine: rest.domaine ?? "",
						order,
					};
					if (item.id) {
						await tx.prize.update({ where: { id: item.id }, data });
					} else {
						await tx.prize.create({
							data: { profileId: profile.id, ...data },
						});
					}
				}
			}

			// ——— 16. Skills (many:1, upsert via profileId) ———
			if (input.skillGroups) {
				const items = input.skillGroups;
				const keepIds = items.map((i) => i.id).filter((id): id is string => !!id);
				await tx.profileSkillGroup.deleteMany({
					where: keepIds.length
						? { profileId: profile.id, id: { notIn: keepIds } }
						: { profileId: profile.id },
				});
				for (const [index, item] of items.entries()) {
					const order = item.order ?? index;
					const { skills: _skills, ...rest } = item.content;
					const data = {
						title: rest.title?.trim() ? rest.title.trim() : null,
						order,
					};
					let groupId = item.id;
					if (groupId) {
						await tx.profileSkillGroup.update({ where: { id: groupId }, data });
					} else {
						const created = await tx.profileSkillGroup.create({
							data: { profileId: profile.id, ...data },
						});
						groupId = created.id;
					}
					const skillsToSave = (_skills ?? []).filter((s) => s.content.name.trim().length > 0);
					const keepSkillIds = skillsToSave.map((s) => s.id).filter((id): id is string => !!id);
					await tx.profileSkill.deleteMany({
						where: keepSkillIds.length ? { groupId, id: { notIn: keepSkillIds } } : { groupId },
					});
					for (const [sIndex, s] of skillsToSave.entries()) {
						const sOrder = s.order ?? sIndex;
						const name = s.content.name.trim();
						const catalog = s.content.skillId
							? await tx.skill.findUniqueOrThrow({
									where: { id: s.content.skillId },
								})
							: ((await tx.skill.findFirst({ where: { name } })) ??
								(await tx.skill.create({ data: { name } })));
						const skillData = {
							skillId: catalog.id,
							level: s.content.level ?? "Débutant",
							order: sOrder,
						};
						if (s.id) {
							await tx.profileSkill.update({
								where: { id: s.id },
								data: skillData,
							});
						} else {
							await tx.profileSkill.create({
								data: { groupId, ...skillData },
							});
						}
					}
				}
			}

			// ——— 17. SocialMedias (many:1, upsert via profileId) ———
			if (input.socialMedias) {
				const items = input.socialMedias;
				const keepIds = items.map((i) => i.id).filter((id): id is string => !!id);
				await tx.socialMedia.deleteMany({
					where: keepIds.length
						? { profileId: profile.id, id: { notIn: keepIds } }
						: { profileId: profile.id },
				});
				for (const [index, item] of items.entries()) {
					const order = item.order ?? index;
					const { ...rest } = item.content;
					const data = {
						username: rest.username ?? "",
						icon: rest.icon ?? "",
						socialNetwork: rest.socialNetwork ?? "",
						order,
					};
					if (item.id) {
						await tx.socialMedia.update({ where: { id: item.id }, data });
					} else {
						await tx.socialMedia.create({
							data: { profileId: profile.id, ...data },
						});
					}
				}
			}

			// ——— 18. Competences (many:1, upsert via profileId) ———
			if (input.competenceGroups) {
				const items = input.competenceGroups;
				const keepIds = items.map((i) => i.id).filter((id): id is string => !!id);
				await tx.profileCompetenceGroup.deleteMany({
					where: keepIds.length
						? { profileId: profile.id, id: { notIn: keepIds } }
						: { profileId: profile.id },
				});
				for (const [index, item] of items.entries()) {
					const order = item.order ?? index;
					const { competences: _competences, ...rest } = item.content;
					const data = {
						title: rest.title?.trim() ? rest.title.trim() : null,
						order,
					};
					let groupId = item.id;
					if (groupId) {
						await tx.profileCompetenceGroup.update({
							where: { id: groupId },
							data,
						});
					} else {
						const created = await tx.profileCompetenceGroup.create({
							data: { profileId: profile.id, ...data },
						});
						groupId = created.id;
					}
					const competencesToSave = (_competences ?? []).filter(
						(s) => s.content.name.trim().length > 0,
					);
					const keepCompetenceIds = competencesToSave
						.map((s) => s.id)
						.filter((id): id is string => !!id);
					await tx.profileCompetence.deleteMany({
						where: keepCompetenceIds.length
							? { groupId, id: { notIn: keepCompetenceIds } }
							: { groupId },
					});
					for (const [sIndex, s] of competencesToSave.entries()) {
						const sOrder = s.order ?? sIndex;
						const name = s.content.name.trim();
						const catalog = s.content.competenceId
							? await tx.competence.findUniqueOrThrow({
									where: { id: s.content.competenceId },
								})
							: ((await tx.competence.findFirst({ where: { name } })) ??
								(await tx.competence.create({ data: { name } })));
						const competenceData = {
							competenceId: catalog.id,
							order: sOrder,
						};
						if (s.id) {
							await tx.profileCompetence.update({
								where: { id: s.id },
								data: competenceData,
							});
						} else {
							await tx.profileCompetence.create({
								data: { groupId, ...competenceData },
							});
						}
					}
				}
			}

			// ——— 19. Tags (many:1, upsert via profileId) ———
			if (input.tagGroups) {
				const items = input.tagGroups;
				const keepIds = items.map((i) => i.id).filter((id): id is string => !!id);
				await tx.profileTagGroup.deleteMany({
					where: keepIds.length
						? { profileId: profile.id, id: { notIn: keepIds } }
						: { profileId: profile.id },
				});
				for (const [index, item] of items.entries()) {
					const order = item.order ?? index;
					const { tags: _tags, ...rest } = item.content;
					const data = {
						title: rest.title?.trim() ? rest.title.trim() : null,
						order,
					};
					let groupId = item.id;
					if (groupId) {
						await tx.profileTagGroup.update({ where: { id: groupId }, data });
					} else {
						const created = await tx.profileTagGroup.create({
							data: { profileId: profile.id, ...data },
						});
						groupId = created.id;
					}
					const tagsToSave = (_tags ?? []).filter((s) => s.content.name.trim().length > 0);
					const keepTagIds = tagsToSave.map((s) => s.id).filter((id): id is string => !!id);
					await tx.profileTag.deleteMany({
						where: keepTagIds.length ? { groupId, id: { notIn: keepTagIds } } : { groupId },
					});
					for (const [sIndex, s] of tagsToSave.entries()) {
						const sOrder = s.order ?? sIndex;
						const name = s.content.name.trim();
						const catalog = s.content.tagId
							? await tx.tag.findUniqueOrThrow({
									where: { id: s.content.tagId },
								})
							: ((await tx.tag.findFirst({ where: { name } })) ??
								(await tx.tag.create({ data: { name } })));
						const tagData = {
							tagId: catalog.id,
							order: sOrder,
						};
						if (s.id) {
							await tx.profileTag.update({
								where: { id: s.id },
								data: tagData,
							});
						} else {
							await tx.profileTag.create({
								data: { groupId, ...tagData },
							});
						}
					}
				}
			}

			// ——— return profile + description (pour reset du form) ———
			return tx.profile.findUnique({
				where: { id: profile.id },
				include: {
					description: true,
					philosophy: true,
					experiences: {
						include: { missions: true },
						orderBy: { order: "asc" },
					},
					strengths: true,
					stats: true,
					projects: {
						include: { missions: true },
						orderBy: { order: "asc" },
					},
					achievements: true,
					publications: true,
					volunteerings: {
						include: { missions: true },
						orderBy: { order: "asc" },
					},
					educations: true,
					skills: {
						include: {
							skills: {
								include: { skill: true },
								orderBy: { order: "asc" },
							},
						},
						orderBy: { order: "asc" },
					},
					languages: true,
					tags: {
						include: {
							tags: {
								include: { tag: true },
								orderBy: { order: "asc" },
							},
						},
						orderBy: { order: "asc" },
					},
					competences: {
						include: {
							competences: {
								include: { competence: true },
								orderBy: { order: "asc" },
							},
						},
						orderBy: { order: "asc" },
					},
					socialMedias: true,
					expertises: true,
					certifications: true,
					formations: true,
					passions: true,
					prizes: true,
				},
			});
		});
	}
}

export const profileSaveService = new ProfileSaveService();
