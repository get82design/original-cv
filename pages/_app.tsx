import { trpc, trpcClient } from '../utils/trpc';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps, AppType } from 'next/app';

const queryClient = new QueryClient();

const App: AppType = ({ Component, pageProps }: AppProps) => {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export default App;
