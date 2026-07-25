import { trpc, trpcClient } from "../utils/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
	return (
		<SessionProvider session={pageProps.session}>
			<QueryClientProvider client={queryClient}>
				<trpc.Provider client={trpcClient} queryClient={queryClient}>
					<Component {...pageProps} />
				</trpc.Provider>
			</QueryClientProvider>
		</SessionProvider>
	);
}
