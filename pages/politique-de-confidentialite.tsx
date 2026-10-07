import Link from "next/link";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export default function PolitiqueConfidentialitePage() {
	return (
		<LegalPageShell
			title="Politique de confidentialité"
			description="Comment OriginalCV collecte, utilise et protège vos données personnelles (RGPD)."
		>
			<section className="flex flex-col gap-2">
				<h2>1. Responsable du traitement</h2>
				<p>
					Le responsable du traitement est l’éditeur d’OriginalCV, dont les coordonnées figurent
					dans les{" "}
					<Link
						href="/mentions-legales"
						className="text-primary hover:underline dark:text-primary-dark"
					>
						mentions légales
					</Link>
					.
				</p>
			</section>
			<section className="flex flex-col gap-2">
				<h2>2. Données collectées</h2>
				<ul>
					<li>Compte : email, nom (optionnel), mot de passe hashé, rôle / plan.</li>
					<li>Profil et CV : informations professionnelles que vous saisissez ou importez.</li>
					<li>
						Usage : événements techniques (téléchargements, actions IA, erreurs) pour quotas,
						facturation crédits et amélioration du service.
					</li>
					<li>Session : cookies / jetons nécessaires à l’authentification.</li>
					<li>
						Fiche métier : l’intitulé saisi (et le code ROME associé) est envoyé à l’API France
						Travail pour rechercher une fiche. Le contenu du CV n’est pas transmis à France Travail.
					</li>
					<li>
						Comparaison à une annonce ou à une fiche métier : le contenu concerné est envoyé au
						fournisseur d’IA, comme pour la relecture, la reformulation et la lettre de motivation.
					</li>
				</ul>
			</section>
			<section className="flex flex-col gap-2">
				<h2>3. Finalités et bases légales</h2>
				<ul>
					<li>Fourniture du service (exécution du contrat) ;</li>
					<li>Sécurité, prévention des abus et quotas (intérêt légitime / contrat) ;</li>
					<li>Obligations légales le cas échéant.</li>
				</ul>
				<p>Nous ne revendons pas vos données personnelles à des tiers à des fins publicitaires.</p>
			</section>
			<section className="flex flex-col gap-2">
				<h2>4. Sous-traitants / hébergement</h2>
				<p>
					Les données sont hébergées chez des prestataires techniques (base de données, stockage
					éventuel de previews, fournisseur d’IA pour les fonctionnalités activées, API France
					Travail pour les fiches métier). Les détails édition / hébergeur seront complétés dans les
					mentions légales.
				</p>
			</section>
			<section className="flex flex-col gap-2">
				<h2>5. Conservation</h2>
				<p>
					Les données de compte et de CV sont conservées tant que le compte est actif. Après
					suppression du compte, les données personnelles sont effacées (cascades) ; certains
					événements agrégés peuvent rester anonymisés (sans lien utilisateur) à des fins de stats.
				</p>
			</section>
			<section className="flex flex-col gap-2">
				<h2>6. Vos droits</h2>
				<p>Conformément au RGPD, vous pouvez notamment :</p>
				<ul>
					<li>accéder à vos données et les rectifier dans le profil / éditeur ;</li>
					<li>
						demander l’effacement via « Supprimer mon compte » dans votre profil (suppression
						immédiate) ;
					</li>
					<li>vous opposer ou limiter certains traitements lorsque la loi le permet ;</li>
					<li>introduire une réclamation auprès de la CNIL.</li>
				</ul>
				<p>
					L’export / portabilité structurée (« Télécharger mes données ») est prévu ultérieurement
					(roadmap produit).
				</p>
			</section>
			<section className="flex flex-col gap-2">
				<h2>7. Cookies</h2>
				<p>
					Nous utilisons des cookies / stockage nécessaires à la session et au fonctionnement du
					site. Pas de traceurs publicitaires ni d’analytics.
				</p>
			</section>
			<section className="flex flex-col gap-2">
				<h2>8. Contact</h2>
				<p>
					Pour exercer vos droits ou poser une question RGPD : contact indiqué dans les{" "}
					<Link
						href="/mentions-legales"
						className="text-primary hover:underline dark:text-primary-dark"
					>
						mentions légales
					</Link>
					.
				</p>
			</section>
		</LegalPageShell>
	);
}
