/**
 * Lit un File en base64 sans préfixe data: (prêt pour l’API).
 * Utilise arrayBuffer — compatible navigateur et Node (tests).
 */
export async function fileToBase64(file: File): Promise<string> {
	const bytes = new Uint8Array(await file.arrayBuffer());
	let binary = "";
	const chunk = 0x8000;
	for (let i = 0; i < bytes.length; i += chunk) {
		binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
	}
	return btoa(binary);
}
