import '@/styles/globals.css'
import { MedievalSharp, Open_Sans, Source_Sans_Pro } from 'next/font/google'
import type { AppProps, AppInitialProps } from 'next/app'
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../../utils/apolloClient';
import { SessionProvider } from 'next-auth/react';
import config from "../../config";

const sourceSansPro = Source_Sans_Pro({
  subsets: ['latin'],
  weight: ['300','400','700','900']
});

export default function App({ Component, pageProps: {session, ...pageProps} }: AppProps & AppInitialProps) {
  const apolloClient = useApollo(pageProps);
  return (
    <>
      <style jsx global>
        {`
          :root {
            --font-primary: ${sourceSansPro.style.fontFamily};
            --primary: ${process.env.NEXT_PUBLIC_BRANDING_PRIMARY};
            --secondary: ${process.env.NEXT_PUBLIC_BRANDING_SECONDARY};
          }
        `}
      </style>
      <SessionProvider session={session} basePath={config.nextAuthBasePath} >
      <ApolloProvider client={apolloClient}>
        <Component {...pageProps} />
      </ApolloProvider>
      </SessionProvider>
    </>
  );
}
