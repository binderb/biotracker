import '@/styles/globals.css'
import { Open_Sans } from 'next/font/google'
import type { AppProps } from 'next/app'

const openSans = Open_Sans({
  subsets: ['latin']
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>
        {`
          :root {
            --font-primary: ${openSans.style.fontFamily}
          }
        `}
      </style>
      <Component {...pageProps} />
    </>
  );
}
