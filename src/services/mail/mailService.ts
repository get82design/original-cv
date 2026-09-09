import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[mail] RESEND_API_KEY manquant — reset URL:", resetUrl);
    return;
  }

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "OriginalCV <onboarding@resend.dev>",
    to,
    subject: "Réinitialisation de ton mot de passe",
    html: `
      <p>Tu as demandé une réinitialisation de mot de passe.</p>
      <p><a href="${resetUrl}">Choisir un nouveau mot de passe</a></p>
      <p>Ce lien expire dans 1 heure. Si tu n’es pas à l’origine de la demande, ignore ce mail.</p>
    `,
  });

  if (error) {
    console.error("[mail] Resend error", error);
    throw new Error("EMAIL_SEND_FAILED");
  }
}