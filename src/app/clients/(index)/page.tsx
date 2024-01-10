import Link from 'next/link';
import Nav from '../../(global components)/Nav';
import { db } from '@/db';
import { ClientTable } from './components/ClientTable';

export const dynamic = 'force-dynamic';

export default async function Clients() {
  const clients = await db.query.clients.findMany();

  return (
    <>
      <Nav />
      <div className='mt-4'>
        <Link className='std-link ml-4' href='/'>
          &larr; Back
        </Link>
      </div>
      <main className='flex flex-col gap-4 p-4'>
        <ClientTable clients={clients} />
      </main>
    </>
  );
}
