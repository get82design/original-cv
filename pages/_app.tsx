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
	fontInter,
	fontPlayfair,
	fontLora,
	fontSourceSans,
} from "../src/styles/cvFonts";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
	return (
		<PrimeReactProvider>
			<SessionProvider session={pageProps.session}>
				<QueryClientProvider client={queryClient}>
					<trpc.Provider client={trpcClient} queryClient={queryClient}>
						<div
							className={`${fontInter.variable} ${fontPlayfair.variable} 
							${fontLora.variable} ${fontSourceSans.variable}`}
						>
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
