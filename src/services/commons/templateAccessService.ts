import { prisma } from "../../../lib/prisma";
import { ForbiddenError, NotFoundError, ValidationError } from "../errors";
import {
	canUnlockTemplate,
	canDownloadTemplate,
	canUseTemplate,
	denialMessage,
	reasonCannotDownloadTemplate,
	reasonCannotUseTemplate,
	type TemplateAccessFields,
} from "./templateAccess";
import { unlockedTemplateService } from "./unlockedTemplateService";

export class TemplateAccessService {
	async getTemplateAccessFields(
		templateId: string,
	): Promise<TemplateAccessFields & { id: string }> {
		const template = await prisma.cVTemplate.findUnique({
			where: { id: templateId },
			select: { id: true, isActive: true, isPremium: true },
		});
		if (!template) {
			throw new NotFoundError("CV_TEMPLATE", templateId);
		}
		return template;
	}

	/**
	 * Création / bascule de template : modèle actif requis (premium OK).
	 */
	async assertCanUseTemplate(
		userId: string,
		templateId: string,
	): Promise<void> {
		void userId;
		const template = await this.getTemplateAccessFields(templateId);
		const reason = reasonCannotUseTemplate(template);
		if (reason === "INACTIVE") {
			throw new ValidationError(denialMessage(reason));
		}
	}

	/**
	 * Téléchargement : premium sans unlock → Forbidden.
	 */
	async assertCanDownloadTemplate(
		userId: string,
		templateId: string,
	): Promise<void> {
		const template = await this.getTemplateAccessFields(templateId);
		const hasUnlock = template.isPremium
			? await unlockedTemplateService.hasUnlocked(userId, templateId)
			: false;
		const reason = reasonCannotDownloadTemplate(template, { hasUnlock });
		if (reason === "PREMIUM_LOCKED") {
			throw new ForbiddenError(
				"TEMPLATE_PREMIUM_LOCKED",
				denialMessage(reason),
			);
		}
	}

	async assertCanUnlockTemplate(templateId: string): Promise<void> {
		const template = await this.getTemplateAccessFields(templateId);
		if (!canUnlockTemplate(template)) {
			throw new ValidationError("Ce modèle n’est pas disponible");
		}
	}

	async userCanUse(userId: string, templateId: string): Promise<boolean> {
		void userId;
		const template = await this.getTemplateAccessFields(templateId);
		return canUseTemplate(template);
	}

	async userCanDownload(
		userId: string,
		templateId: string,
	): Promise<boolean> {
		const template = await this.getTemplateAccessFields(templateId);
		const hasUnlock = template.isPremium
			? await unlockedTemplateService.hasUnlocked(userId, templateId)
			: false;
		return canDownloadTemplate(template, { hasUnlock });
	}
}

export const templateAccessService = new TemplateAccessService();
