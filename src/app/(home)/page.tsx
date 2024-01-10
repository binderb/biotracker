import { getServerSession } from 'next-auth';
import Nav from '../(global components)/Nav';
import Link from 'next/link';
import { authOptions } from '@/lib/authOptions';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <>
      <Nav />
      <main className='flex flex-col gap-2 p-4'>
        <div className='pb-4'>This is a demo home page. Click the links below to access different prototypes.</div>
        <section className='pb-4'>
          <div className='font-bold'>Regular User Functions:</div>
          <div className='flex py-2 gap-1'>
            <Link className='std-button' href='/clients'>
              Clients Module
            </Link>
            <Link className='std-button' href='/forms'>
              Forms Module
            </Link>
            <Link className='std-button' href='/leads'>
              Sales Leads Module
            </Link>
            
          </div>
        </section>
        {(session && ['admin','dev'].includes(session.user.role)) && (
          <>
            <section className='pb-4'>
              <div className='font-bold'>Admin Functions:</div>
              <div className='flex py-2 gap-1'>
                <Link className='std-button' href='./settings'>
                  App Settings
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
