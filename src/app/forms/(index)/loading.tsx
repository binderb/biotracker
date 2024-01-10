import Link from 'next/link';
import Nav from '../../(global components)/Nav';
import FallbackBox from '@/app/(global components)/FallbackBox';


export default async function LoadingClients() {
  return (
    <>
      <Nav />
      <div className='mt-4'>
        <Link className='std-link ml-4' href='/'>
          &larr; Back
        </Link>
      </div>
      <main className='flex flex-col gap-4 p-4'>
        <FallbackBox heading='Forms Module' loadingText='Loading forms list...' />
      </main>
    </>
  );
}
