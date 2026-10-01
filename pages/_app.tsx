import "./styles/globals.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./assets/theme/mytheme/theme.scss";
import { trpc, trpcClient } from "../utils/trpc";
import { PrimeReactProvider } from "primereact/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import AppLayout from "../src/components/layout/AppLayout";
import {
	fontCormorantGaramond,
	fontDmSans,
	fontEbGaramond,
	fontIbmPlexSans,
	fontInter,
	fontLato,
	fontLibreBaskerville,
	fontLora,
	fontMerriweather,
	fontMontserrat,
	fontMulish,
	fontNunitoSans,
	fontOpenSans,
	fontPlayfair,
	fontPoppins,
	fontRaleway,
	fontRoboto,
	fontSourceSans,
	fontSourceSerif,
	fontWorkSans,
} from "../src/styles/cvFonts";

const queryClient = new QueryClient();

const cvFontVariables = [
	fontInter.variable,
	fontPlayfair.variable,
	fontLora.variable,
	fontSourceSans.variable,
	fontOpenSans.variable,
	fontLato.variable,
	fontMontserrat.variable,
	fontRoboto.variable,
	fontMerriweather.variable,
	fontLibreBaskerville.variable,
	fontNunitoSans.variable,
	fontWorkSans.variable,
	fontRaleway.variable,
	fontDmSans.variable,
	fontEbGaramond.variable,
	fontPoppins.variable,
	fontIbmPlexSans.variable,
	fontMulish.variable,
	fontSourceSerif.variable,
	fontCormorantGaramond.variable,
].join(" ");

export default function App({ Component, pageProps }: AppProps) {
	return (
		<PrimeReactProvider>
			<SessionProvider session={pageProps.session}>
				<QueryClientProvider client={queryClient}>
					<trpc.Provider client={trpcClient} queryClient={queryClient}>
						<div className={cvFontVariables}>
							<AppLayout>
								<Component {...pageProps} />
							</AppLayout>
						</div>
					</trpc.Provider>
				</QueryClientProvider>
			</SessionProvider>
		</PrimeReactProvider>
	);
}
