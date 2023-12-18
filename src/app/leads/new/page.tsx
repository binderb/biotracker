import Nav from '@/app/(global components)/Nav';
import Link from 'next/link';
import SalesLeadCreator from './components/SalesLeadCreator';

export default async function NewLead() {
  return (
    <>
      <Nav />
      <div className='mt-4 flex gap-4 items-center'>
        <Link className='std-link ml-4' href='/leads'>
          &larr; Back
        </Link>
        <h1 className='text-[20px] font-bold'>New Sales Lead</h1>
      </div>
      <main className='flex flex-col gap-4 p-4'>
        <SalesLeadCreator />
      </main>
    </>
  );
}
