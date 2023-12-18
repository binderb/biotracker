import Nav from '@/app/(global components)/Nav';
import { db } from '@/db';
import Link from 'next/link';
import { FaEdit, FaPlus } from 'react-icons/fa';

export default async function Forms() {
  const forms = await db.query.forms.findMany();

  return (
    <>
      <Nav />
      <div className='mt-4'>
        <Link className='std-link ml-4' href='/'>
          &larr; Back
        </Link>
      </div>
      <main className='flex flex-col gap-4 p-4'>
        <section className='ui-box'>
          <h5>Forms Module</h5>
          <section className='flex gap-2 items-center'>
            <Link className='std-button' href='/forms/new'>
              <FaPlus />
              New Form
            </Link>
          </section>
          <section className='flex flex-col gap-2'>
            {forms.length === 0 && <div className='italic'>No forms are in the system yet.</div>}
            {forms.map((form) => (
              <div key={form.id} className='flex justify-between items-center std-input'>
                {form.name}
                <Link className='std-button-lite' href={`/forms/${form.id}`}>
                  <FaEdit />
                </Link>
              </div>
            ))}
          </section>
        </section>
      </main>
    </>
  );
}
