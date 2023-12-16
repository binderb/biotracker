import Nav from '@/app/(global components)/Nav';
import { db } from '@/db';
import { clients } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import ClientDetailsForm from './components/ClientDetailsForm';

export const dynamic = 'force-dynamic';

export default async function ClientDetails({ params }: { params: { id: number } }) {
  const client = await db.query.clients.findFirst({
    where: eq(clients.id, params.id),
    with: {
      projects: {
        with: {
          contacts: {
            columns: {},
            with: {
              contact: true
            }
          }
        }
      },
      contacts: {
        columns: {},
        with: {
          contact: true,
        }
      },
      billingAddresses: {
        columns: {},
        with: {
          address: true,
        },
      },
    },
  });

  return (
    <>
      <Nav />
      <div className='mt-4'>
        <Link className='std-link ml-4' href='/clients'>
          &larr; Back
        </Link>
      </div>
      <main className='flex flex-col gap-4 p-4'>
        <section className='ui-box'>
          <h5>Client Details:</h5>
          {client && <ClientDetailsForm client={client} />}
        </section>
      </main>
    </>
  );
}
