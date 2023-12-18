import Nav from '@/app/(global components)/Nav';
import { db } from '@/db';
import Link from 'next/link';
import { FaEdit, FaPlus } from 'react-icons/fa';

export default async function Forms() {
  const leads = await db.query.salesleads.findMany();

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
          <h5>Sales Leads Module</h5>
          <section className='flex gap-2 items-center'>
            <Link className='std-button' href='/leads/new'>
              <FaPlus />
              New Sales Lead
            </Link>
          </section>
          <section className='flex flex-col gap-2'>
            {leads.length === 0 && <div className='italic'>No sales leads are in the system yet.</div>}
            {leads.map((lead) => (
              <div key={lead.id} className='flex justify-between items-center std-input'>
                {`${lead.name}`}
                <Link className='std-button-lite' href={`/forms/${lead.id}`}>
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
