'use client';
import Modal from '@/app/(global components)/Modal';
import { Address, Contact, ProjectWithAllDetails } from '@/db/schema_clientModule';
import { FaFileSignature, FaSearch, FaTrashAlt } from 'react-icons/fa';
import SubmitButton from '@/app/(global components)/SubmitButton';
import { useState, useEffect, useRef } from 'react';
import { addQuote } from './actions';

type Props = {
  mode: "new" | "edit";
  quoteId?: number;
  quoteLink?: string;
  salesleadId: number;
  clientId: number;
  projectId: number;
};

export default function QuoteModal({ mode, quoteId, quoteLink, salesleadId, projectId, clientId }: Props) {
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);

  // async function handleAddNewProject(formData: FormData) {
  //   try {
  //     const formJSON = Object.fromEntries(formData) as unknown as ProjectWithAllDetails;
  //     if (!formJSON.name) throw new Error('Every project must have a name!');
  //     const newProject: ProjectWithAllDetails = {
  //       ...formJSON,
  //       id: newId ?? -1,
  //       client: clientId,
  //       billingAddress: formJSON.billingAddress || null,
  //       contacts: contactList.map((contact) => ({ contact: contact })),
  //     };
  //     addNewFunction(newProject);
  //     handleClose();
  //   } catch (err: any) {
  //     setStatus(err.message);
  //   }
  // }

  // function handleUpdateProject(formData: FormData) {
  //   try {
  //     const formJSON = Object.fromEntries(formData) as unknown as ProjectWithAllDetails;
  //     if (!formJSON.name) throw new Error('Every project must have a name!');
  //     console.log('billing address: ',formJSON.billingAddress);
  //     const updatedProject: ProjectWithAllDetails = {
  //       ...formJSON,
  //       id: project?.id ?? -1,
  //       client: clientId,
  //       billingAddress: formJSON.billingAddress || null,
  //       contacts: contactList.map((contact) => ({ contact: contact })),
  //     };
  //     console.log('updated project', updatedProject);
  //     saveChangesFunction(updatedProject);
  //     handleClose();
  //   } catch (err: any) {
  //     setStatus(err.message);
  //   }
  // }

  async function handleAddNewQuote (formData: FormData) {
    try {
      const newQuote = {
        id: -1,
        index: -1,
        link: formData.get('link') as string,
        saleslead: salesleadId,
        client: clientId,
        project: projectId,
      };
      await addQuote(newQuote);

    } catch (err: any) {
      setStatus(err.message);
    }
  }

  async function handleUpdateQuote (formData: FormData) {
  
  }

  return (
    <>
      <button
        className='std-button-lite'
        onClick={(e) => {
          e.preventDefault();
          setShowModal(true);
        }}>
        <FaFileSignature />
        Add Quote
      </button>
      <Modal showModal={showModal} className='w-[90vw] md:w-[60%]'>
        {mode === 'new' && (
          <>
            <h5>Quote Details</h5>
            <form className='flex flex-col gap-4' action={handleAddNewQuote}>
              <table className='w-full text-left border-collapse'>
                <thead>
                  <tr>
                    <th className='w-[20%]'></th>
                    <th className='w-[80%]'></th>
                  </tr>
                </thead>
                <tbody>
                  {/* Link */}
                  <tr>
                    <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                      <div>Quote Link</div>
                      <div className='font-normal italic text-[12px]'>(Required)</div>
                    </td>
                    <td className='bg-white/50 border border-secondary/80 p-1'>
                      <input className='std-input w-full' name='link' />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className='flex items-center gap-2'>
                <button
                  className='secondary-button-lite'
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal(false);
                  }}>
                  Cancel
                </button>
                <button className='std-button-lite'>Add Quote</button>
              </div>
              <div className='text-[#800]'>{status}</div>
            </form>
          </>
        )}
        {mode === 'edit' && (
          <>
            <h5>Quote Details</h5>
            <form className='flex flex-col gap-4' action={handleUpdateQuote}>
              {/* Hidden field for id */}
              {/* <input type='hidden' className='std-input w-full' name='id' value={project?.id ?? ''} /> */}
              <table className='w-full text-left border-collapse'>
                <thead>
                  <tr>
                    <th className='w-[20%]'></th>
                    <th className='w-[80%]'></th>
                  </tr>
                </thead>
                <tbody>
                  {/* Project Title */}
                  <tr>
                    <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                      <div>Link</div>
                      <div className='font-normal italic text-[12px]'>(Required)</div>
                    </td>
                    <td className='bg-white/50 border border-secondary/80 p-1'>
                      {/* <input className='std-input w-full' name='name' defaultValue={project?.name || ''} /> */}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className='flex items-center gap-2'>
                <button className='secondary-button-lite' onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className='std-button-lite'>Update Project</button>
              </div>
              <div className='text-[#800]'>{status}</div>
            </form>
          </>
        )}
      </Modal>
    </>
  );
}
