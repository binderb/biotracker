'use client';

import { Client, ClientWithAllDetails, ProjectWithAllDetails } from '@/db/schema_clientModule';
import { FormWithAllLevels } from '@/db/schema_formsModule';
import { useEffect, useState } from 'react';
import SalesLeadEditor from '../../(global sales lead components)/SalesLeadEditor';
import { User } from '@/db/schema_usersModule';
import { SalesLeadWithAllDetails } from '@/db/schema_salesleadsModule';
import SubmitButton from '@/app/(global components)/SubmitButton';
import { Flip, Slide, ToastContainer, toast } from 'react-toastify';
// import { addSalesLead } from '../actions';
import SalesLeadDetails from '../../(global sales lead components)/SalesLeadDetails';
import { useRouter } from 'next/navigation';
import { FaClipboardList, FaGear } from 'react-icons/fa6';
import { FaFolderOpen } from 'react-icons/fa';
import { cloneDeep } from 'lodash';
import { useBeforeUnload } from '@/lib/useBeforeUnload';
import Link from 'next/link';
import { Config } from '@/db/schema_configModule';
import Discussion from './Discussion';
import { addBareNote, addSalesLeadRevision } from '../actions';

type Props = {
  mode: 'view' | 'edit';
  config: Config | null;
  currentUser: User;
  users: User[];
  clients: Client[];
  studyPlans: FormWithAllLevels[];
  salesLead: SalesLeadWithAllDetails;
};

export default function SalesLeadViewer({ mode, config, currentUser, users, clients, studyPlans, salesLead }: Props) {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState('study-plans');
  const [changes, setChanges] = useState(false);
  const [note, setNote] = useState('');
  const [leadDetails, setLeadDetails] = useState(cloneDeep(salesLead));
  const noCommits = leadDetails.notes.length === 0;
  useBeforeUnload(changes, 'Changes you made has not been saved just yet. Do you wish to proceed anyway?');
  useBeforeUnload(noCommits, 'This sales lead has no notes or changes yet. To provide context for your team, please consider including a note! Are you sure you want to leave?');

  useEffect(() => {
    setLeadDetails(cloneDeep(salesLead));
  }, [salesLead]);

  useEffect(() => {
    if (JSON.stringify(leadDetails) !== JSON.stringify(salesLead)) {
      console.log('changes detected');
      setChanges(true);
    } else {
      setChanges(false);
    }
  }, [leadDetails, salesLead]);

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
    if (type === 'success') {
      toast.success(message, {
        transition: Flip,
        theme: 'dark',
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 4000,
        hideProgressBar: true,
      });
    }
  }

  async function handleSubmitNewSalesLeadRevision() {
    try {
      if (!note.trim()) {
        throw new Error('Please enter a discussion note before committing changes.');
      }
      await addSalesLeadRevision(leadDetails,note,currentUser.id);
      setNote('');
      notify('success', 'Changes committed successfully.');
    } catch (err: any) {
      notify('error', err.message);
    }
  }

  async function handleSubmitBareNote() {
    try {
      if (!note.trim()) {
        throw new Error('Note cannot be blank!');
      }
      await addBareNote(leadDetails,note,currentUser.id);
      setNote('');
      notify('success', 'Note added successfully.');
    } catch (err: any) {
      notify('error', err.message);
    }
  }

  return (
    <>
      {/* <div>
        {JSON.stringify(salesLead)}
      </div> */}
      <section className='ui-box-thin'>
        {/* TOP BAR */}
        <div className='w-full flex justify-end gap-2'>
          {config && (
            <Link className='std-button-lite' href={`https://drive.google.com/drive/u/0/folders/${config?.salesleadDriveId ?? '_'}/${leadDetails.repository}`} target='_blank' rel='noopener noreferrer'>
              <FaFolderOpen />
              Files
            </Link>
          )}
          {changes && (
            <form className='flex items-center gap-2' action={handleSubmitNewSalesLeadRevision}>
              <SubmitButton text='Commit Changes' className='w-[170px] flex justify-center' pendingText='Committing...' />
            </form>
          )}
          {!changes && note.trim() && (
            <form className='flex items-center gap-2' action={handleSubmitBareNote}>
              <SubmitButton text='Add Note' className='w-[170px] flex justify-center' pendingText='Adding...' />
            </form>
          )}
          {!changes && !note.trim() && (
            <button className='std-button-lite-thin w-[170px] flex justify-center' disabled>
              No Unsaved Changes
            </button>
          )}
        </div>
      </section>
      <section className='max-md:flex max-md:flex-col-reverse md:grid md:grid-cols-12 gap-2 overflow-y-hidden h-full'>
        {/* DISCUSSION */}
        <section className='ui-box md:col-span-5 xl:col-span-4 md:overflow-y-hidden h-full'>
          <h5>Discussion: </h5>
          {mode === 'edit' && (
            <>
              <div className='flex flex-col gap-2'>
                <div className='flex justify-between items-center'>
                  <div className='font-bold'>Note:</div>
                </div>
                <textarea className='std-input h-[150px] resize-none align-top' value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </>
          )}
          { mode === 'edit' && (
            <div className='md:overflow-y-hidden overflow-x-visible h-[calc(100%-238px)]'>
              <div className='md:overflow-y-auto overflow-x-visible h-full pr-4'>
                <Discussion leadDetails={leadDetails} />
              </div>
            </div>
          )} 
          { mode === 'view' && (
            <div className='md:overflow-y-hidden overflow-x-visible h-[calc(100%-40px)]'>
              <div className='md:overflow-y-auto overflow-x-visible h-full pr-4'>
                <Discussion leadDetails={leadDetails} />
              </div>
            </div>
          )} 
        </section>
        {/* SALES LEAD DETAILS */}
        <section className='ui-box md:col-span-7 xl:col-span-8 md:overflow-y-hidden h-full'>
          <section className='md:overflow-y-hidden h-full'>
            <section className='md:overflow-y-auto h-full pr-4 flex flex-col gap-4'>
              <div className='flex justify-between items-center'>
<h5>Sales Lead Details:</h5>
<button className='secondary-button-lite' onClick={()=>setLeadDetails(cloneDeep(salesLead))} disabled={!changes}>Revert to Saved</button>
              </div>
              
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
