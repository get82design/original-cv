// src/services/cv/cvSaveService.ts
import { prisma } from "../../../lib/prisma";
import { validateTimeline } from "../../utils/validateTimeline";
import { ForbiddenError, NotFoundError, ValidationError } from "../errors";
import type { CvSaveInput } from "../schemas/cvSave.schema";
import type { TemplateModule } from "../schemas/cvTemplate.schema";
import { compactActiveOrders } from "../../utils/moduleOrder";
import { userService } from "../user/userService";
import { cvService } from "./cvService";

export class CvSaveService {
	async save(userId: string, input: CvSaveInput) {
		const cvId = await prisma.$transaction(async (tx) => {
			// ——— 1. CV ———
			let id = input.cvId;

			if (id) {
				const cv = await tx.cV.findUnique({ where: { id } });
				if (!cv) throw new NotFoundError("CV", id);
				if (cv.userId !== userId) {
					throw new ForbiddenError("FORBIDDEN", "Not your CV");
				}

				await tx.cV.update({
					where: { id },
					data: {
						title: input.title,
						photo: input.photo ?? null,
						templateId: input.templateId,
						...(input.layoutGeneral !== undefined
							? { layoutGeneral: input.layoutGeneral }
							: null),
					},
				});
			} else {
				const can = await userService.canCreateCv(userId);
				if (!can) {
					throw new ValidationError("Limite de CV atteinte");
				}

				const created = await tx.cV.create({
					data: {
						userId,
						templateId: input.templateId,
						title: input.title,
						photo: input.photo ?? null,
						...(input.layoutGeneral !== undefined
							? { layoutGeneral: input.layoutGeneral }
							: null),
					},
				});
				id = created.id;
			}

			const { datas, modules } = input;

			// ——— 2. Header ———
			if (datas.header) {
				const { id: _headerId, ...headerData } = datas.header;
				const headerUpdate = {
					...(headerData.title !== undefined
						? { title: headerData.title }
						: {}),
					...(headerData.subtitle !== undefined
						? { subtitle: headerData.subtitle }
						: {}),
					...(headerData.phone !== undefined
						? { phone: headerData.phone }
						: {}),
					...(headerData.email !== undefined
						? { email: headerData.email }
						: {}),
					...(headerData.location !== undefined
						? { location: headerData.location }
						: {}),
					...(headerData.portfolio !== undefined
						? { portfolio: headerData.portfolio }
						: {}),
					...(headerData.nom !== undefined ? { nom: headerData.nom } : {}),
					...(headerData.prenom !== undefined
						? { prenom: headerData.prenom }
						: {}),
					...(headerData.settings != null
						? { settings: headerData.settings }
						: {}),
				};
				if (headerData.title === undefined) {
					throw new ValidationError(
						"Header title is required to create or upsert a CV header.",
					);
				}
				await tx.cvHeader.upsert({
					where: { cvId: id },
					create: {
						cvId: id,
						title: headerData.title,
						...(headerData.subtitle !== undefined
							? { subtitle: headerData.subtitle }
							: {}),
						...(headerData.phone !== undefined
							? { phone: headerData.phone }
							: {}),
						...(headerData.email !== undefined
							? { email: headerData.email }
							: {}),
						...(headerData.location !== undefined
							? { location: headerData.location }
							: {}),
						...(headerData.portfolio !== undefined
							? { portfolio: headerData.portfolio }
							: {}),
						...(headerData.nom !== undefined ? { nom: headerData.nom } : {}),
						...(headerData.prenom !== undefined
							? { prenom: headerData.prenom }
							: {}),
						...(headerData.settings != null
							? { settings: headerData.settings }
							: {}),
					},
					update: headerUpdate,
				});
			}

			// ——— 3. Description ———
			if (datas.description) {
				const description = datas.description.content.description;
				await tx.cvDescription.upsert({
					where: { cvId: id },
					create: { cvId: id, description },
					update: { description },
				});
			}

			// ——— 4. Experiences (replace) ———
			if (datas.experience) {
				const items = datas.experience.content;
				const itemsToSave = items.filter(
					(i) =>
						(i.content.title ?? "").trim().length > 0 ||
						(i.content.company ?? "").trim().length > 0,
				);
				const keepIds = itemsToSave
					.map((item) => item.id)
					.filter((experienceId): experienceId is string => !!experienceId);

				if (keepIds.length === 0) {
					await tx.cvExperience.deleteMany({ where: { cvId: id } });
				} else {
					await tx.cvExperience.deleteMany({
						where: { cvId: id, id: { notIn: keepIds } },
					});
				}

				for (const [index, item] of itemsToSave.entries()) {
					const order = item.order ?? index + 1;
					const { missions, settings, ...rest } = item.content;

					let experienceId = item.id;

					validateTimeline(rest.start, rest.end);

					const experienceData = {
						title: rest.title,
						company: rest.company,
						start: rest.start,
						end: rest.end ?? null,
						description: rest.description ?? null,
						location: rest.location ?? null,
						order,
						settings: settings ?? {},
					};

					if (experienceId) {
						await tx.cvExperience.update({
							where: { id: experienceId },
							data: experienceData,
						});
					} else {
						const created = await tx.cvExperience.create({
							data: {
								cvId: id,
								...experienceData,
							},
						});
						experienceId = created.id;
					}

					// missions replace
					const missionKeepIds = missions
						.map((m) => m.id)
						.filter((missionId): missionId is string => !!missionId);

					if (missionKeepIds.length === 0) {
						await tx.cvMissionExperience.deleteMany({
							where: { cvExperienceId: experienceId },
						});
					} else {
						await tx.cvMissionExperience.deleteMany({
							where: {
								cvExperienceId: experienceId,
								id: { notIn: missionKeepIds },
							},
						});
					}

					for (const [mIndex, m] of missions.entries()) {
						const mOrder = m.order ?? mIndex + 1;
						const text = m.content.content;

						if (m.id) {
							await tx.cvMissionExperience.update({
								where: { id: m.id },
								data: { content: text, order: mOrder },
							});
						} else {
							await tx.cvMissionExperience.create({
								data: {
									cvExperienceId: experienceId,
									content: text,
									order: mOrder,
								},
							});
						}
					}
				}
			}

			// ——— 5. Projects (replace) ———
			if (datas.project) {
				const items = datas.project.content;
				const itemsToSave = items.filter(
					(i) => (i.content.title ?? "").trim().length > 0,
				);
				const keepIds = itemsToSave
					.map((item) => item.id)
					.filter((projectId): projectId is string => !!projectId);

				if (keepIds.length === 0) {
					await tx.cvProject.deleteMany({ where: { cvId: id } });
				} else {
					await tx.cvProject.deleteMany({
						where: { cvId: id, id: { notIn: keepIds } },
					});
				}

				for (const [index, item] of itemsToSave.entries()) {
					const order = item.order ?? index + 1;
					const { missions, settings, ...rest } = item.content;

					let projectId = item.id;

					validateTimeline(rest.start, rest.end, rest.status);

					const projectData = {
						title: rest.title,
						start: rest.start,
						end: rest.end ?? null,
						description: rest.description ?? null,
						location: rest.location ?? null,
						technology: rest.technology ?? null,
						status: rest.status ?? null,
						order,
						settings: settings ?? {},
					};

					if (projectId) {
						await tx.cvProject.update({
							where: { id: projectId },
							data: projectData,
						});
					} else {
						const created = await tx.cvProject.create({
							data: {
								cvId: id,
								...projectData,
							},
						});
						projectId = created.id;
					}

					// missions replace
					const missionKeepIds = missions
						.map((m) => m.id)
						.filter((missionId): missionId is string => !!missionId);

					if (missionKeepIds.length === 0) {
						await tx.cvMissionProject.deleteMany({
							where: { cvProjectId: projectId },
						});
					} else {
						await tx.cvMissionProject.deleteMany({
							where: {
								cvProjectId: projectId,
								id: { notIn: missionKeepIds },
							},
						});
					}

					for (const [mIndex, m] of missions.entries()) {
						const mOrder = m.order ?? mIndex + 1;
						const text = m.content.content;

						if (m.id) {
							await tx.cvMissionProject.update({
								where: { id: m.id },
								data: { content: text, order: mOrder },
							});
						} else {
							await tx.cvMissionProject.create({
								data: {
									cvProjectId: projectId,
									content: text,
									order: mOrder,
								},
							});
						}
					}
				}
			}

			// ——— 6. Volunteering (replace) ———
			if (datas.volunteering) {
				const items = datas.volunteering.content;
				const itemsToSave = items.filter(
					(i) =>
						(i.content.title ?? "").trim().length > 0 ||
						(i.content.organisation ?? "").trim().length > 0,
				);
				const keepIds = itemsToSave
					.map((item) => item.id)
					.filter(
						(volunteeringId): volunteeringId is string => !!volunteeringId,
					);

				if (keepIds.length === 0) {
					await tx.cvVolunteering.deleteMany({ where: { cvId: id } });
				} else {
					await tx.cvVolunteering.deleteMany({
						where: { cvId: id, id: { notIn: keepIds } },
					});
				}

				for (const [index, item] of itemsToSave.entries()) {
					const order = item.order ?? index + 1;
					const { missions, settings, ...rest } = item.content;

					let volunteeringId = item.id;

					validateTimeline(rest.start, rest.end);

					const volunteeringData = {
						title: rest.title,
						start: rest.start,
						end: rest.end ?? null,
						organisation: rest.organisation,
						description: rest.description ?? null,
						location: rest.location ?? null,
						order,
						settings: settings ?? {},
					};

					if (volunteeringId) {
						await tx.cvVolunteering.update({
							where: { id: volunteeringId },
							data: volunteeringData,
						});
					} else {
						const created = await tx.cvVolunteering.create({
							data: {
								cvId: id,
								...volunteeringData,
							},
						});
						volunteeringId = created.id;
					}

					// missions replace
					const missionKeepIds = missions
						.map((m) => m.id)
						.filter((missionId): missionId is string => !!missionId);

					if (missionKeepIds.length === 0) {
						await tx.cvMissionVolunteering.deleteMany({
							where: { cvVolunteeringId: volunteeringId },
						});
					} else {
						await tx.cvMissionVolunteering.deleteMany({
							where: {
								cvVolunteeringId: volunteeringId,
								id: { notIn: missionKeepIds },
							},
						});
					}

					for (const [mIndex, m] of missions.entries()) {
						const mOrder = m.order ?? mIndex + 1;
						const text = m.content.content;

						if (m.id) {
							await tx.cvMissionVolunteering.update({
								where: { id: m.id },
								data: { content: text, order: mOrder },
							});
						} else {
							await tx.cvMissionVolunteering.create({
								data: {
									cvVolunteeringId: volunteeringId,
									content: text,
									order: mOrder,
								},
							});
						}
					}
				}
			}

			// ——— 7. Formations (replace) ———
			if (datas.formation) {
				const items = datas.formation.content;
				const itemsToSave = items.filter(
					(i) => (i.content.title ?? "").trim().length > 0,
				);
				const keepIds = itemsToSave
					.map((item) => item.id)
					.filter((formationId): formationId is string => !!formationId);

				if (keepIds.length === 0) {
					await tx.cvFormation.deleteMany({ where: { cvId: id } });
				} else {
					await tx.cvFormation.deleteMany({
						where: { cvId: id, id: { notIn: keepIds } },
					});
				}

				for (const [index, item] of itemsToSave.entries()) {
					const order = item.order ?? index + 1;
					const { settings, ...rest } = item.content;

					let formationId = item.id;

					validateTimeline(rest.start, rest.end, rest.status);

					const formationData = {
						title: rest.title,
						start: rest.start,
						end: rest.end ?? null,
						status: rest.status ?? null,
						organismeFormation: rest.organismeFormation ?? null,
						order,
						settings: settings ?? {},
					};

					if (formationId) {
						await tx.cvFormation.update({
							where: { id: formationId },
							data: formationData,
						});
					} else {
						const created = await tx.cvFormation.create({
							data: {
								cvId: id,
								...formationData,
							},
						});
						formationId = created.id;
					}
				}
			}

			// ——— 8. Certifications (replace) ———
			if (datas.certification) {
				const items = datas.certification.content;
				const itemsToSave = items.filter(
					(i) => (i.content.title ?? "").trim().length > 0,
				  );
				const keepIds = itemsToSave
					.map((item) => item.id)
					.filter(
						(certificationId): certificationId is string => !!certificationId,
					);

				if (keepIds.length === 0) {
					await tx.cvCertification.deleteMany({ where: { cvId: id } });
				} else {
					await tx.cvCertification.deleteMany({
						where: { cvId: id, id: { notIn: keepIds } },
					});
				}

				for (const [index, item] of itemsToSave.entries()) {
					const order = item.order ?? index + 1;
					const { settings, ...rest } = item.content;

					let certificationId = item.id;

					const certificationData = {
						title: rest.title,
						organismeCertification: rest.organismeCertification ?? null,
						order,
						settings: settings ?? {},
					};

					if (certificationId) {
						await tx.cvCertification.update({
							where: { id: certificationId },
							data: certificationData,
						});
					} else {
						const created = await tx.cvCertification.create({
							data: {
								cvId: id,
								...certificationData,
							},
						});
						certificationId = created.id;
					}
				}
			}

			// ——— 9. Prizes (replace) ———
			if (datas.prize) {
				const items = datas.prize.content;
				const itemsToSave = items.filter(
					(i) => (i.content.title ?? "").trim().length > 0,
				);
				const keepIds = itemsToSave
					.map((item) => item.id)
					.filter((prizeId): prizeId is string => !!prizeId);

				if (keepIds.length === 0) {
					await tx.cvPrize.deleteMany({ where: { cvId: id } });
				} else {
					await tx.cvPrize.deleteMany({
						where: { cvId: id, id: { notIn: keepIds } },
					});
				}

				for (const [index, item] of itemsToSave.entries()) {
					const order = item.order ?? index + 1;
					const { settings, ...rest } = item.content;

					let prizeId = item.id;

					const prizeData = {
						title: rest.title,
						domaine: rest.domaine,
						order,
						settings: settings ?? {},
					};

					if (prizeId) {
						await tx.cvPrize.update({
							where: { id: prizeId },
							data: prizeData,
						});
					} else {
						const created = await tx.cvPrize.create({
							data: {
								cvId: id,
								...prizeData,
							},
						});
						prizeId = created.id;
					}
				}
			}

			// ——— 10. Expertises (replace) ———
			if (datas.expertise) {
				const items = datas.expertise.content;
				const itemsToSave = items.filter(
					(i) => (i.content.title ?? "").trim().length > 0,
				);
				const keepIds = itemsToSave
					.map((item) => item.id)
					.filter((expertiseId): expertiseId is string => !!expertiseId);

				if (keepIds.length === 0) {
					await tx.cvExpertise.deleteMany({ where: { cvId: id } });
				} else {
					await tx.cvExpertise.deleteMany({
						where: { cvId: id, id: { notIn: keepIds } },
					});
				}

				for (const [index, item] of itemsToSave.entries()) {
					const order = item.order ?? index + 1;
					const { settings, ...rest } = item.content;

					let expertiseId = item.id;

					const expertiseData = {
						title: rest.title,
						level: rest.level,
						order,
						settings: settings ?? {},
					};

					if (expertiseId) {
						await tx.cvExpertise.update({
							where: { id: expertiseId },
							data: expertiseData,
						});
					} else {
						const created = await tx.cvExpertise.create({
							data: {
								cvId: id,
								...expertiseData,
							},
						});
						expertiseId = created.id;
					}
				}
			}

			// ——— 11. Philosophy (replace) ———
			if (datas.philosophy) {
				const { settings, ...rest } = datas.philosophy.content;
				await tx.cvPhilosophy.upsert({
					where: { cvId: id },
					create: {
						cvId: id,
						citation: rest.citation,
						author: rest.author ?? null,
						settings: settings ?? {},
					},
					update: {
						citation: rest.citation,
						author: rest.author ?? null,
						settings: settings ?? {},
					},
				});
			}

			// ——— 12. Social Media (replace) ———
			if (datas.socialMedia) {
				const items = datas.socialMedia.content;
				const itemsToSave = items.filter(
					(i) =>
						(i.content.username ?? "").trim().length > 0 ||
						(i.content.socialNetwork ?? "").trim().length > 0,
				);
				const keepIds = itemsToSave
					.map((item) => item.id)
					.filter((socialMediaId): socialMediaId is string => !!socialMediaId);

				if (keepIds.length === 0) {
					await tx.cvSocialMedia.deleteMany({ where: { cvId: id } });
				} else {
					await tx.cvSocialMedia.deleteMany({
						where: { cvId: id, id: { notIn: keepIds } },
					});
				}

				for (const [index, item] of itemsToSave.entries()) {
					const order = item.order ?? index + 1;
					const { settings, ...rest } = item.content;

					let socialMediaId = item.id;

					const socialMediaData = {
						socialNetwork: rest.socialNetwork ?? null,
						username: rest.username,
						icon: rest.icon,
						order,
						settings: settings ?? {},
					};

					if (socialMediaId) {
						await tx.cvSocialMedia.update({
							where: { id: socialMediaId },
							data: socialMediaData,
						});
					} else {
						const created = await tx.cvSocialMedia.create({
							data: {
								cvId: id,
								...socialMediaData,
							},
						});
						socialMediaId = created.id;
					}
				}
			}

			// ——— 13. Passion (replace) ———
			if (datas.passion) {
				const items = datas.passion.content;
				const itemsToSave = items.filter(
					(i) => (i.content.title ?? "").trim().length > 0,
				);
				const keepIds = itemsToSave
					.map((item) => item.id)
					.filter((passionId): passionId is string => !!passionId);

				if (keepIds.length === 0) {
					await tx.cvPassion.deleteMany({ where: { cvId: id } });
				} else {
					await tx.cvPassion.deleteMany({
						where: { cvId: id, id: { notIn: keepIds } },
					});
				}

				for (const [index, item] of itemsToSave.entries()) {
					const order = item.order ?? index + 1;
					const { settings, ...rest } = item.content;

					let passionId = item.id;

					const passionData = {
						title: rest.title,
						icon: rest.icon,
						order,
						settings: settings ?? {},
					};

					if (passionId) {
						await tx.cvPassion.update({
							where: { id: passionId },
							data: passionData,
						});
					} else {
						const created = await tx.cvPassion.create({
							data: { cvId: id, ...passionData },
						});
						passionId = created.id;
					}
				}
			}

			// ——— 14. Language (replace) ———
			if (datas.language) {
				const items = datas.language.content;
				const itemsToSave = items.filter(
					(i) => (i.content.name ?? "").trim().length > 0,
				);
				const keepIds = itemsToSave
					.map((item) => item.id)
					.filter((languageId): languageId is string => !!languageId);

				if (keepIds.length === 0) {
					await tx.cvLanguage.deleteMany({ where: { cvId: id } });
				} else {
					await tx.cvLanguage.deleteMany({
						where: { cvId: id, id: { notIn: keepIds } },
					});
				}

				for (const [index, item] of itemsToSave.entries()) {
					const order = item.order ?? index + 1;
					const { settings, ...rest } = item.content;

					let languageId = item.id;

					const languageData = {
						name: rest.name,
						level: rest.level,
						order,
						settings: settings ?? {},
					};

					if (languageId) {
						await tx.cvLanguage.update({
							where: { id: languageId },
							data: languageData,
						});
					} else {
						const created = await tx.cvLanguage.create({
							data: { cvId: id, ...languageData },
						});
						languageId = created.id;
					}
				}
			}

			// ——— 15. Publication (replace) ———
			if (datas.publication) {
				const items = datas.publication.content;
				const itemsToSave = items.filter(
					(i) => (i.content.title ?? "").trim().length > 0,
				);
				const keepIds = itemsToSave
					.map((item) => item.id)
					.filter((publicationId): publicationId is string => !!publicationId);

				if (keepIds.length === 0) {
					await tx.cvPublication.deleteMany({ where: { cvId: id } });
				} else {
					await tx.cvPublication.deleteMany({
						where: { cvId: id, id: { notIn: keepIds } },
					});
				}

				for (const [index, item] of itemsToSave.entries()) {
					const order = item.order ?? index + 1;
					const { settings, ...rest } = item.content;

					let publicationId = item.id;

					validateTimeline(rest.start, rest.end);

					const publicationData = {
						title: rest.title,
						start: rest.start,
						end: rest.end ?? null,
						journalName: rest.journalName ?? null,
						description: rest.description ?? null,
						url: rest.url ?? null,
						order,
						settings: settings ?? {},
					};

					if (publicationId) {
						await tx.cvPublication.update({
							where: { id: publicationId },
							data: publicationData,
						});
					} else {
						const created = await tx.cvPublication.create({
							data: {
								cvId: id,
								...publicationData,
							},
						});
						publicationId = created.id;
					}
				}
			}

			// ——— 16. Strength (replace) ———
			if (datas.strength) {
				const items = datas.strength.content;
				const itemsToSave = items.filter(
					(i) => (i.content.title ?? "").trim().length > 0,
				);
				const keepIds = itemsToSave
					.map((item) => item.id)
					.filter((strengthId): strengthId is string => !!strengthId);

				if (keepIds.length === 0) {
					await tx.cvStrength.deleteMany({ where: { cvId: id } });
				} else {
					await tx.cvStrength.deleteMany({
						where: { cvId: id, id: { notIn: keepIds } },
					});
				}

				for (const [index, item] of itemsToSave.entries()) {
					const order = item.order ?? index + 1;
					const { settings, ...rest } = item.content;

					let strengthId = item.id;

					const strengthData = {
						title: rest.title,
						icon: rest.icon ?? null,
						description: rest.description ?? null,
						order,
						settings: settings ?? {},
					};

					if (strengthId) {
						await tx.cvStrength.update({
							where: { id: strengthId },
							data: strengthData,
						});
					} else {
						const created = await tx.cvStrength.create({
							data: { cvId: id, ...strengthData },
						});
						strengthId = created.id;
					}
				}
			}

			// ——— 17. Achievement (replace) ———
			if (datas.achievement) {
				const items = datas.achievement.content;
				const itemsToSave = items.filter(
					(i) => (i.content.title ?? "").trim().length > 0,
				  );
				const keepIds = itemsToSave
					.map((item) => item.id)
					.filter((achievementId): achievementId is string => !!achievementId);

				if (keepIds.length === 0) {
					await tx.cvAchievement.deleteMany({ where: { cvId: id } });
				} else {
					await tx.cvAchievement.deleteMany({
						where: { cvId: id, id: { notIn: keepIds } },
					});
				}

				for (const [index, item] of itemsToSave.entries()) {
					const order = item.order ?? index + 1;
					const { settings, ...rest } = item.content;

					let achievementId = item.id;

					const achievementData = {
						title: rest.title,
						description: rest.description ?? null,
						year: rest.year ?? null,
						technology: rest.technology ?? null,
						order,
						settings: settings ?? {},
					};

					if (achievementId) {
						await tx.cvAchievement.update({
							where: { id: achievementId },
							data: achievementData,
						});
					} else {
						const created = await tx.cvAchievement.create({
							data: { cvId: id, ...achievementData },
						});
						achievementId = created.id;
					}
				}
			}

			// ——— 18. Education (replace) ———
			if (datas.education) {
				const items = datas.education.content;
				const itemsToSave = items.filter(
					(i) => (i.content.school ?? "").trim().length > 0,
				  );
				const keepIds = itemsToSave
					.map((item) => item.id)
					.filter((educationId): educationId is string => !!educationId);

				if (keepIds.length === 0) {
					await tx.cvEducation.deleteMany({ where: { cvId: id } });
				} else {
					await tx.cvEducation.deleteMany({
						where: { cvId: id, id: { notIn: keepIds } },
					});
				}

				for (const [index, item] of itemsToSave.entries()) {
					const order = item.order ?? index + 1;
					const { settings, ...rest } = item.content;

					let educationId = item.id;

					validateTimeline(rest.start, rest.end, rest.obtained);

					const educationData = {
						title: rest.title,
						school: rest.school,
						degree: rest.degree,
						city: rest.city ?? null,
						start: rest.start,
						end: rest.end ?? null,
						obtained: rest.obtained ?? null,
						order,
						settings: settings ?? {},
					};

					if (educationId) {
						await tx.cvEducation.update({
							where: { id: educationId },
							data: educationData,
						});
					} else {
						const created = await tx.cvEducation.create({
							data: {
								cvId: id,
								...educationData,
							},
						});
						educationId = created.id;
					}
				}
			}

			// ——— 19. Skill Group (replace) ———
			if (datas.skillGroup) {
				const items = datas.skillGroup.content;
				const keepIds = items
					.map((item) => item.id)
					.filter((skillGroupId): skillGroupId is string => !!skillGroupId);

				if (keepIds.length === 0) {
					await tx.cvSkillGroup.deleteMany({ where: { cvId: id } });
				} else {
					await tx.cvSkillGroup.deleteMany({
						where: { cvId: id, id: { notIn: keepIds } },
					});
				}

				for (const [index, item] of items.entries()) {
					const order = item.order ?? index + 1;
					const { skills, settings, ...rest } = item.content;
					let skillGroupId = item.id;
					const skillGroupData = {
						title: rest.title ?? null,
						order,
						settings: settings ?? {},
					};
					if (skillGroupId) {
						await tx.cvSkillGroup.update({
							where: { id: skillGroupId },
							data: skillGroupData,
						});
					} else {
						const created = await tx.cvSkillGroup.create({
							data: { cvId: id, ...skillGroupData },
						});
						skillGroupId = created.id;
					}
					// skills nested — ton bloc tx.cvSkill est déjà bon
					const skillsToSave = skills.filter(
						(s) =>
							(s.content.name ?? "").trim().length > 0 ||
							!!s.content.skillId,
					);
					const skillKeepIds = skillsToSave
						.map((s) => s.id)
						.filter((id): id is string => !!id);
					await tx.cvSkill.deleteMany({
						where:
							skillKeepIds.length === 0
								? { groupId: skillGroupId }
								: { groupId: skillGroupId, id: { notIn: skillKeepIds } },
					});
					for (const [sIndex, s] of skillsToSave.entries()) {
						const sOrder = s.order ?? sIndex + 1;

						const catalog = s.content.skillId
							? await tx.skill.findUniqueOrThrow({
									where: { id: s.content.skillId },
								})
							: ((await tx.skill.findFirst({
									where: { name: s.content.name.trim() },
								})) ??
								(await tx.skill.create({
									data: { name: s.content.name.trim() },
								})));

						const data = {
							skillId: catalog.id,
							level: s.content.level,
							order: sOrder,
						};
						if (s.id) {
							await tx.cvSkill.update({ where: { id: s.id }, data });
						} else {
							await tx.cvSkill.create({
								data: {
									groupId: skillGroupId,
									skillId: catalog.id, // ← toujours un id réel
									level: s.content.level,
									order: sOrder,
								},
							});
						}
					}
				}
			}

			// ——— 20. Competence Group (replace) ———
			if (datas.competenceGroup) {
				const items = datas.competenceGroup.content;
				const keepIds = items
					.map((item) => item.id)
					.filter(
						(competenceGroupId): competenceGroupId is string =>
							!!competenceGroupId,
					);

				if (keepIds.length === 0) {
					await tx.cvCompetenceGroup.deleteMany({ where: { cvId: id } });
				} else {
					await tx.cvCompetenceGroup.deleteMany({
						where: { cvId: id, id: { notIn: keepIds } },
					});
				}

				for (const [index, item] of items.entries()) {
					const order = item.order ?? index + 1;
					const { competences, settings, ...rest } = item.content;
					let competenceGroupId = item.id;
					const competenceGroupData = {
						title: rest.title ?? null,
						order,
						settings: settings ?? {},
					};
					if (competenceGroupId) {
						await tx.cvCompetenceGroup.update({
							where: { id: competenceGroupId },
							data: competenceGroupData,
						});
					} else {
						const created = await tx.cvCompetenceGroup.create({
							data: { cvId: id, ...competenceGroupData },
						});
						competenceGroupId = created.id;
					}
					const competencesToSave = competences.filter(
						(c) =>
						  (c.content.name ?? "").trim().length > 0 ||
						  !!c.content.competenceId,
					  );
					const competenceKeepIds = competencesToSave
						.map((c) => c.id)
						.filter((competenceId): competenceId is string => !!competenceId);
					await tx.cvCompetence.deleteMany({
						where:
							competenceKeepIds.length === 0
								? { groupId: competenceGroupId }
								: {
										groupId: competenceGroupId,
										id: { notIn: competenceKeepIds },
									},
					});
					for (const [cIndex, c] of competencesToSave.entries()) {
						const cOrder = c.order ?? cIndex + 1;
						const catalog = c.content.competenceId
							? await tx.competence.findUniqueOrThrow({
									where: { id: c.content.competenceId },
								})
							: ((await tx.competence.findFirst({
									where: { name: c.content.name.trim() },
								})) ??
								(await tx.competence.create({
									data: { name: c.content.name.trim() },
								})));
						const data = {
							competenceId: catalog.id,
							order: cOrder,
						};
						if (c.id) {
							await tx.cvCompetence.update({ where: { id: c.id }, data });
						} else {
							await tx.cvCompetence.create({
								data: { groupId: competenceGroupId, ...data },
							});
						}
					}
				}
			}

			// ——— 21. Tag Group (replace) ———
			if (datas.tagGroup) {
				const items = datas.tagGroup.content;
				const keepIds = items
					.map((item) => item.id)
					.filter((tagGroupId): tagGroupId is string => !!tagGroupId);

				if (keepIds.length === 0) {
					await tx.cvTagGroup.deleteMany({ where: { cvId: id } });
				} else {
					await tx.cvTagGroup.deleteMany({
						where: { cvId: id, id: { notIn: keepIds } },
					});
				}

				for (const [index, item] of items.entries()) {
					const order = item.order ?? index + 1;
					const { tags, settings, ...rest } = item.content;
					let tagGroupId = item.id;
					const tagGroupData = {
						title: rest.title ?? null,
						order,
						settings: settings ?? {},
					};
					if (tagGroupId) {
						await tx.cvTagGroup.update({
							where: { id: tagGroupId },
							data: tagGroupData,
						});
					} else {
						const created = await tx.cvTagGroup.create({
							data: { cvId: id, ...tagGroupData },
						});
						tagGroupId = created.id;
					}
					const tagsToSave = tags.filter(
						(t) =>
						  (t.content.name ?? "").trim().length > 0 ||
						  !!t.content.tagId,
					  );
					const tagKeepIds = tagsToSave
						.map((t) => t.id)
						.filter((tagId): tagId is string => !!tagId);
					await tx.cvTag.deleteMany({
						where:
							tagKeepIds.length === 0
								? { groupId: tagGroupId }
								: {
										groupId: tagGroupId,
										id: { notIn: tagKeepIds },
									},
					});
					for (const [tIndex, t] of tagsToSave.entries()) {
						const tOrder = t.order ?? tIndex + 1;
						const catalog = t.content.tagId
							? await tx.tag.findUniqueOrThrow({
									where: { id: t.content.tagId },
								})
							: ((await tx.tag.findFirst({
									where: { name: t.content.name.trim() },
								})) ??
								(await tx.tag.create({
									data: { name: t.content.name.trim() },
								})));
						const data = {
							tagId: catalog.id,
							order: tOrder,
						};
						if (t.id) {
							await tx.cvTag.update({ where: { id: t.id }, data });
						} else {
							await tx.cvTag.create({
								data: { groupId: tagGroupId, ...data },
							});
						}
					}
				}
			}

			// ——— 21. Modules (replace) ———
			await tx.cVModule.deleteMany({ where: { cvId: id } });

			if (modules.length > 0) {
				const normalized = compactActiveOrders(
					modules as TemplateModule[],
				);
				await tx.cVModule.createMany({
					data: normalized.map((mod) => ({
						cvId: id,
						type: mod.type,
						title: mod.title ?? null,
						column: mod.column ?? 0,
						order: mod.order,
						isActive: mod.isActive ?? true,
						settings: mod.settings ?? {},
					})),
				});
			}

			return id;
		});

		return cvService.findById(cvId ?? "");
	}
}

export const cvSaveService = new CvSaveService();
