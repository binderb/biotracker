import Nav from '@/app/(global components)/Nav';
import Link from 'next/link';
import SalesLeadCreator from './components/SalesLeadCreator';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { forms } from '@/db/schema_formsModule';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { User, users } from '@/db/schema_usersModule';

export default async function NewLead() {
  const session = await getServerSession(authOptions);
  const currentUser = await db.query.users.findFirst({where: eq(users.id,parseInt(session!.user.id))}) as User;
  const usersList = await db.query.users.findMany();
  const clients = await db.query.clients.findMany();
  const studyPlans = await db.query.forms.findMany({
    where: eq(forms.docType, 'studyplan'),
    with: {
      revisions: {
        with: {
          sections: {
            with: {
              rows: {
                with: {
                  fields: true,
                },
              },
            },
          },
        },
      },
    },
  });

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
        <SalesLeadCreator currentUser={currentUser} users={usersList} clients={clients} studyPlans={studyPlans} />
      </main>
    </>
  );
}
