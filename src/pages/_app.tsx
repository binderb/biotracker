import '@/styles/globals.css'
import { Open_Sans } from 'next/font/google'
import type { AppProps, AppInitialProps } from 'next/app'
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../../utils/apolloClient';
import connectMongo from '../../utils/connectMongo';
import { SessionProvider } from 'next-auth/react';

const openSans = Open_Sans({
  subsets: ['latin']
});

export default function App({ Component, pageProps: {session, ...pageProps} }: AppProps & AppInitialProps) {
  const apolloClient = useApollo(pageProps);
  return (
    <>
      <style jsx global>
        {`
          :root {
            --font-primary: ${openSans.style.fontFamily};
            --primary: ${process.env.NEXT_PUBLIC_BRANDING_PRIMARY};
            --primary-hover: ${process.env.NEXT_PUBLIC_BRANDING_PRIMARY_HOVER};
            --primary-highlight: ${process.env.NEXT_PUBLIC_BRANDING_PRIMARY_HIGHLIGHT};
            --secondary: ${process.env.NEXT_PUBLIC_BRANDING_SECONDARY};
            --secondary-hover: ${process.env.NEXT_PUBLIC_BRANDING_SECONDARY_HOVER};
            --secondary-highlight: ${process.env.NEXT_PUBLIC_BRANDING_SECONDARY_HIGHLIGHT};
          }
        `}
      </style>
      <SessionProvider session={session} >
      <ApolloProvider client={apolloClient}>
        <Component {...pageProps} />
      </ApolloProvider>
      </SessionProvider>
    </>
  );
}
