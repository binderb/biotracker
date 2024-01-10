import Nav from '@/app/(global components)/Nav';
import Link from 'next/link';
import FormEditor from '../components/FormEditor';
import { desc, eq } from 'drizzle-orm';
import { FormWithAllLevels, formrevisions, forms } from '@/db/schema_formsModule';
import { db } from '@/db';
import { getFormID } from '../functions';

export default async function EditForm({ params }: { params: { id: number } }) {
  const form = await db.query.forms.findFirst({
    where: eq(forms.id, params.id),
    with: {
      revisions: {
        orderBy: [
          desc(formrevisions.created)
        ],
        limit: 1,
        with: {
          sections: {
            with: {
              rows: {
                with: {
                  fields: true
                }
              }
            }
          },
        },
      },
    },
  }) as FormWithAllLevels;

  return (
    <>
      <Nav />
      <div className='mt-4 flex gap-4 items-center'>
        <Link className='std-link ml-4' href='/forms'>
          &larr; Back
        </Link>
        <h1 className='text-[20px] font-bold'>Editing: {`${form.name} (${getFormID(form)})`}</h1>
      </div>
      <main className='flex flex-col gap-4 p-4'>
        <FormEditor mode='edit' form={form} />
      </main>
    </>
  );
}
