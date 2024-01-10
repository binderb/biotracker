import Nav from '@/app/(global components)/Nav';
import { db } from '@/db';
import Link from 'next/link';
import { FaCheck, FaCircle, FaComment, FaEdit, FaFolderOpen, FaPause, FaPlus } from 'react-icons/fa';
import { FaCodeCommit, FaGears, FaX } from 'react-icons/fa6';

export default async function Forms() {
  const leads = await db.query.leads.findMany({
    with: {
      revisions: true,
      notes: true,
    },
  });
  const config = await db.query.configs.findFirst();

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
                <div className='flex items-center gap-2'>
                  {lead.status === 'In Progress' && (
                    <div className='secondary-block-lite'>
                      <FaCircle className='text-green-400' size='9' />
                      In Progress
                    </div>
                  )}
                  {lead.status === 'Paused' && (
                    <div className='secondary-block-lite'>
                      <FaPause className='text-gray-300' />
                      Paused
                    </div>
                  )}
                  {lead.status === 'Needs Method Development' && (
                    <div className='secondary-block-lite'>
                      <FaGears className='text-gray-300' />
                      Needs Method Development
                    </div>
                  )}
                  {lead.status === 'Won' && (
                    <div className='secondary-block-lite'>
                      <FaCheck className='text-gray-300' />
                      Won
                    </div>
                  )}
                  {lead.status === 'Cancelled' && (
                    <div className='secondary-block-lite'>
                      <FaX className='text-gray-300' />
                      Cancelled
                    </div>
                  )}
                  <div className='secondary-block-lite'>
                    <FaComment />
                    {lead.notes.length}
                  </div>
                  <div className='secondary-block-lite'>
                    <FaCodeCommit />
                    {lead.revisions.length}
                  </div>
                  {config && (
                    <Link className='std-button-lite' href={`https://drive.google.com/drive/u/0/folders/${config?.salesleadDriveId ?? '_'}/${lead.repository}`} target='_blank' rel='noopener noreferrer'>
                      <FaFolderOpen />
                    </Link>
                  )}
                  <Link className='std-button-lite' href={`/leads/${lead.id}`}>
                    <FaEdit />
                  </Link>
                </div>
              </div>
            ))}
          </section>
        </section>
      </main>
    </>
  );
}
