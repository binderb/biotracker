import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="shortcut icon" href={process.env.BASE_PATH + '/favicon.ico'} />
      </Head>
      <body className='font-primary'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
