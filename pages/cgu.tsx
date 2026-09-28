import { LegalPageShell } from "@/components/legal/LegalPageShell";
import Link from "next/link";

export default function CguPage() {
	return (
		<LegalPageShell
			title="Conditions générales d’utilisation"
			description="Règles d’usage du service OriginalCV (création et export de CV en ligne)."
		>
			<section className="flex flex-col gap-2">
				<h2>1. Objet</h2>
				<p>
					OriginalCV est un service en ligne d’aide à la création, l’édition et l’export de CV
					(curriculum vitae), avec des options d’assistance par intelligence artificielle.
				</p>
			</section>
			<section className="flex flex-col gap-2">
				<h2>2. Compte utilisateur</h2>
				<p>
					Certaines fonctionnalités (sauvegarde, crédits, historique) nécessitent un compte. Vous
					êtes responsable de la confidentialité de vos identifiants et des informations que vous
					renseignez.
				</p>
			</section>
			<section className="flex flex-col gap-2">
				<h2>3. Contenu et crédits</h2>
				<p>
					Le contenu des CV et lettres générés ou saisis reste sous votre responsabilité. Les
					téléchargements et certaines actions IA consomment des crédits selon les règles affichées
					dans l’application. Les crédits ne sont pas remboursables sauf obligation légale.
				</p>
			</section>
			<section className="flex flex-col gap-2">
				<h2>4. Usage acceptable</h2>
				<p>Il est interdit d’utiliser le service pour :</p>
				<ul>
					<li>diffuser des contenus illicites ou portant atteinte aux droits de tiers ;</li>
					<li>contourner les quotas, la sécurité ou l’accès d’autres utilisateurs ;</li>
					<li>extraire massivement des données ou abuser des API / exports.</li>
				</ul>
			</section>
			<section className="flex flex-col gap-2">
				<h2>5. Résiliation</h2>
				<p>
					Vous pouvez supprimer votre compte à tout moment depuis votre profil (suppression
					définitive). Nous pouvons suspendre un compte en cas de manquement grave aux présentes
					CGU.
				</p>
			</section>
			<section className="flex flex-col gap-2">
				<h2>6. Responsabilité</h2>
				<p>
					Le service est fourni « en l’état ». OriginalCV ne garantit pas l’obtention d’un emploi ni
					l’exactitude absolue des suggestions IA. Dans les limites autorisées par la loi, notre
					responsabilité est limitée aux dommages directs prévisibles liés à un défaut du service.
				</p>
			</section>
			<section className="flex flex-col gap-2">
				<h2>7. Données personnelles</h2>
				<p>
					Le traitement de vos données est décrit dans la{" "}
					<Link
						href="/politique-de-confidentialite"
						className="text-primary hover:underline dark:text-primary-dark"
					>
						politique de confidentialité
					</Link>
					.
				</p>
			</section>
			<section className="flex flex-col gap-2">
				<h2>8. Contact</h2>
				<p>
					Pour toute question relative aux CGU : voir les coordonnées indiquées dans les{" "}
					<Link href="/mentions-legales" className="text-primary hover:underline dark:text-primary-dark">
						mentions légales
					</Link>
					.
				</p>
			</section>
		</LegalPageShell>
	);
}
