'use client';

import { Client } from '@/db/schema_clientModule';
import { FormWithAllLevels } from '@/db/schema_formsModule';
import { useState } from 'react';
import { User } from '@/db/schema_usersModule';
import { SalesLeadWithAllDetails } from '@/db/schema_salesleadsModule';
import SubmitButton from '@/app/(global components)/SubmitButton';
import { Flip, ToastContainer, toast } from 'react-toastify';
import { addSalesLead } from '../actions';
import SalesLeadDetails from '../../(global sales lead components)/SalesLeadDetails';
import { useRouter } from 'next/navigation';

type Props = {
  currentUser: User;
  users: User[];
  clients: Client[];
  studyPlans: FormWithAllLevels[];
};

export default function SalesLeadCreator({ currentUser, users, clients, studyPlans }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState('');
  const [leadDetails, setLeadDetails] = useState<SalesLeadWithAllDetails>({
    id: 0,
    name: `${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')} - ()`,
    created: new Date(),
    author: currentUser,
    status: 'In Progress',
    client: {
      id: 0,
      name: '',
      code: '',
      referredBy: null,
      website: null,
      accountType: null,
    },
    project: {
      id: 0,
      name: '',
      client: 0,
      contacts: [],
      nda: null,
      billingAddress: null,
    },
    contributors: [
      {
        contributor: currentUser,
      },
    ],
    revisions: [
      {
        id: 0,
        created: new Date(),
        studyplans: [],
        saleslead: 0,
        author: currentUser.id,
      },
    ],
    notes: [],
    studies: [],
    quote: null,
    repository: null,
  });

  function notify(type: string, message: string) {
    if (type === 'error')
      toast.error(message, {
        transition: Flip,
        theme: 'colored',
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 4000,
        hideProgressBar: true,
      });
  }

  async function handleCreateNewLead() {
    try {
      const response = await addSalesLead(leadDetails);
      if (response.status === 201) {
        router.push(`/leads/${response.data.id}`);
      }
    } catch (err: any) {
      notify('error', err.message);
    }
  }

  return (
    <>
      <section className='ui-box-thin'>
        <div className='w-full flex justify-end'>
          <form className='flex items-center gap-2' action={handleCreateNewLead}>
            <div className='my-2 text-[#800] whitespace-pre'>{status}</div>
            <SubmitButton text='Create Lead' pendingText='Creating...' />
          </form>
        </div>
      </section>
      <section className='ui-box'>
        <h5>New Sales Lead Details:</h5>
        <SalesLeadDetails mode='new' users={users} clients={clients} studyPlans={studyPlans} leadDetails={leadDetails} setLeadDetails={setLeadDetails} />
      </section>
      <ToastContainer className='font-source' />
    </>
  );
}
