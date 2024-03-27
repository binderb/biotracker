import Nav from '../../(global components)/Nav';
import Link from 'next/link';
import SharedControl from './components/SharedControl';
import { db } from '@/db';

export default async function Settings () {

  const config = await db.query.configs.findFirst();

  return (
    <>
      <Nav />
      <div className='mt-4'>
        <Link className='std-link ml-4' href='/settings'>
          &larr; Back
        </Link>
      </div>
      <main className='flex flex-col gap-2 p-4'>
       <SharedControl config={config ?? null} />
     </main>
    </>
  );
}
