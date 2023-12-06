import type { Metadata } from 'next'
import { Source_Sans_3 } from 'next/font/google'
import config from '../../config';
import './globals.css'

const source = Source_Sans_3({
  weight: ['300','400','900'],
  subsets: ['latin'],
  variable: '--source',
});

export const metadata: Metadata = {
  title: config.webTitle,
  description: 'A lean, efficient project management tool for biotech.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${source.variable} font-source`}>{children}</body>
    </html>
  )
}
