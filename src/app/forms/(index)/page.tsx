import Nav from '@/app/(global components)/Nav';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';

export default async function Forms() {
  return (
    <>
      <Nav />
      <div className='mt-4'>
        <Link className='std-link ml-4' href='/'>
          &larr; Back
        </Link>
      </div>
      <main className='flex flex-col gap-4 p-4'>
        <section className='flex gap-2 items-center'>
          <Link className='std-button' href='/forms/new'>
            <FaPlus />
            New Form
            </Link>
        </section>
        <div className='pb-4'>This is a demo forms page.</div>
      </main>
    </>
  );
}
