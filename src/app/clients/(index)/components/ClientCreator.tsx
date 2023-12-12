'use client';

import Modal from '@/app/(global components)/Modal';
import { Client, clients } from '@/db/schema';
import { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { addClient, generateClientCode } from '../actions';
import SubmitButton from '@/app/(global components)/SubmitButton';

type Props = {
  buttonText: string
  clients: Client[]
};

export default function ClientCreator({ clients, buttonText }: Props) {
  const [showCreator, setShowCreator] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [matchingList, setMatchingList] = useState<(Client)[]>(clients);
  const [code, setCode] = useState('');
  const [creatorStatus, setCreatorStatus] = useState('');

  useEffect(() => {
    const regex = new RegExp(`${clientSearch}`, 'gi');
    const filteredList = clients.filter((client) => client.name.match(regex));
    setMatchingList(filteredList);
  }, [setMatchingList, clientSearch, clients]);

  async function handleGenerateNewCode() {
    
    setCreatorStatus('');
    try {
      const newCode = await generateClientCode();
      setCode(newCode);
    } catch (err:any) {
      setCreatorStatus(JSON.stringify(err));
    }
  }

  async function handleSubmitNewClient(formData:FormData) {
    try {
      await addClient(formData);
      setClientSearch('');
      setCode('');
      setShowCreator(false);
    } catch (err:any) {
      setCreatorStatus(JSON.stringify(err));
    }
  }

  return (
    <>
      <button className='std-button-lite' onClick={() => setShowCreator(true)}>
        <FaPlus />
        {buttonText}
      </button>
      <Modal showModal={showCreator} className='w-[90vw] md:w-[60%]'>
        <h5>Add New Client</h5>
        <form className='flex flex-col gap-4' action={handleSubmitNewClient}>
          <div className='flex items-center gap-2'>
            <div className='font-bold'>Name:</div>
            <input className='std-input w-full' name='name' value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} placeholder='Start typing a client name...' />
          </div>
          <section>
            {matchingList.length > 0 ? (
              <div className='flex flex-col gap-2'>
              <div>{`Pick a unique client name that doesn't overlap with others in the database. These names match your current entry:`}</div>
              <div className='border border-secondary/80 w-full h-[200px] mb-2 overflow-y-scroll bg-white/50'>
                <>
                  {matchingList.map((client, index: number) => (
                    <div key={`contact-${index}`} className={`flex w-full px-2 py-2 border border-secondary/80 border-b-1 border-l-0 border-r-0 border-t-0 last:border-b-0 cursor-pointer`}>
                      {client.name}
                    </div>
                  ))}
                </>
              </div>
              </div>
            ) : (
              <section className='flex flex-col gap-2'>
                <div className='flex gap-2 items-center'>
                  <div className='font-bold'>Code:</div>
                  <input className='std-input font-mono uppercase' name='code' size={3} maxLength={3} value={code} onChange={(e)=>setCode(e.target.value)} />
                  <button className='std-button-lite' onClick={(e)=>{e.preventDefault();handleGenerateNewCode();}}>
                    Generate Unique Code
                  </button>
                </div>
                <div>
                  {clientSearch && (
                    <><span className='font-bold'>No matching clients found!</span> Use the controls to set up your new client.</>
                  )}
                  {!clientSearch && (
                    <>Please enter some text in the name field.</>
                  )}
                </div>
              </section>
            )}
          </section>
          <section className='flex items-center gap-2'>
            <button className='secondary-button-lite' onClick={(e) => {e.preventDefault();setShowCreator(false);}}>
              Cancel
            </button>
            <SubmitButton text='Add Client' pendingText='Adding Client...' disabled={matchingList.length > 0 || !clientSearch || code.length < 3} />
          </section>
          <section className='text-[#800]'>
            {creatorStatus}
          </section>
        </form>
      </Modal>
    </>
  );
}
