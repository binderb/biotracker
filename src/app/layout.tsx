import type { Metadata } from 'next';
import { Source_Sans_3 } from 'next/font/google';
import config from '../../config';
import './globals.css';
import SessionProvider from '@/lib/SessionProvider';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';

const source = Source_Sans_3({
  weight: ['300', '400', '900'],
  subsets: ['latin'],
  variable: '--source',
});

export const metadata: Metadata = {
  title: config.webTitle,
  description: 'A lean, efficient project management tool for biotech.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang='en'>
      <body className={`${source.variable} font-source`}>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
