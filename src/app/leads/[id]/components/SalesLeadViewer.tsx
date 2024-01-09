'use client';

import { Client, ProjectWithAllDetails } from '@/db/schema_clientModule';
import { FormWithAllLevels } from '@/db/schema_formsModule';
import { useState } from 'react';
import SalesLeadEditor from '../../(global sales lead components)/SalesLeadEditor';
import { User } from '@/db/schema_usersModule';
import { NewSalesLead, SalesLeadWithAllDetails } from '@/db/schema_salesleadsModule';
import SubmitButton from '@/app/(global components)/SubmitButton';
import { sleep } from '@/debug/Sleep';
import { Flip, ToastContainer, toast } from 'react-toastify';
// import { addSalesLead } from '../actions';
import SalesLeadDetails from '../../(global sales lead components)/SalesLeadDetails';
import { useRouter } from 'next/navigation';
import { FaClipboard, FaClipboardList, FaGear } from 'react-icons/fa6';
import { FaClipboardCheck } from 'react-icons/fa';

type Props = {
  currentUser: User;
  users: User[];
  clients: Client[];
  studyPlans: FormWithAllLevels[];
  salesLead: SalesLeadWithAllDetails;
};

export default function SalesLeadViewer({ currentUser, users, clients, studyPlans, salesLead }: Props) {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState('study-plans');
  const [status, setStatus] = useState('');
  // const [leadDetails, setLeadDetails] = useState<NewSalesLead>({
  //   client: null,
  //   name: '',
  //   project: null,
  //   studyPlans: [],
  //   author: currentUser,
  //   contributors: [{ user: currentUser }],
  //   status: 'In Progress',
  //   studies: [],
  //   quote: null,
  //   // firstNote: '',
  // });
  const [leadDetails, setLeadDetails] = useState(salesLead);

  const tabs = [
    {
      name: 'study-plans',
      label: (
        <div className='flex items-center gap-2'>
          <FaClipboardList />
          Study Plans
        </div>
      ),
    },
    {
      name: 'settings',
      label: (
        <div className='flex items-center gap-2'>
          <FaGear />
          Settings
        </div>
      ),
    },
  ];

  function notify(type: string, message: string) {
    if (type === 'error') {
      toast.error(message, {
        transition: Flip,
        theme: 'colored',
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 4000,
        hideProgressBar: true,
      });
    }
  }

  return (
    <>
      <section className='ui-box'>
        <div className='w-full flex justify-end'>
          {/* <form className='flex items-center gap-2' action={handleCreateNewLead}>
            <div className='my-2 text-[#800] whitespace-pre'>{status}</div>
            <SubmitButton text='Create Lead' pendingText='Creating...' />
          </form> */}
        </div>
      </section>
      <section className='max-md:flex max-md:flex-col-reverse md:grid md:grid-cols-12 gap-2 overflow-y-hidden h-full'>
        {/* DISCUSSION */}
        <section className='ui-box md:col-span-5 xl:col-span-4 md:overflow-y-hidden h-full'>
          <h5>Discussion: </h5>
        </section>
        {/* SALES LEAD DETAILS */}
        <section className='ui-box md:col-span-7 xl:col-span-8 md:overflow-y-hidden h-full'>
          <section className='md:overflow-y-hidden h-full'>
            <section className='md:overflow-y-auto h-full pr-4 flex flex-col gap-4'>
              <h5>Sales Lead Details:</h5>
              <div className='flex items-center justify-between pl-1'>
                <div className='tab-group'>
                  {tabs.map((tab) => (
                    <button
                      key={tab.name}
                      name={tab.name}
                      className={tab.name === currentTab ? 'selected' : ''}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentTab(tab.name);
                      }}>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              {currentTab === 'study-plans' && <SalesLeadEditor mode='edit' users={users} clients={clients} studyPlans={studyPlans} leadDetails={leadDetails} setLeadDetails={setLeadDetails} />}
              {currentTab === 'settings' && <SalesLeadDetails mode='edit' users={users} clients={clients} studyPlans={studyPlans} leadDetails={leadDetails} setLeadDetails={setLeadDetails} />}
            </section>
          </section>
        </section>
      </section>

      <ToastContainer className='font-source' />
    </>
  );
}
