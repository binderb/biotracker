'use client';
import Modal from '@/app/(global components)/Modal';
import { Address, Contact, ProjectWithAllDetails } from '@/db/schema_clientModule';
import { FaFileSignature, FaSearch, FaTrashAlt } from 'react-icons/fa';
import SubmitButton from '@/app/(global components)/SubmitButton';
import { useState, useEffect, useRef } from 'react';
import { FaPenToSquare } from 'react-icons/fa6';
import { SalesLeadWithAllDetails } from '@/db/schema_salesleadsModule';

type Props = {
  mode: 'new' | 'edit';
  quoteId?: number;
  quoteIndex?: number;
  quoteLink?: string;
  salesleadId: number;
  clientId: number;
  projectId: number;
  leadDetails: SalesLeadWithAllDetails;
  setLeadDetails: (leadDetails: SalesLeadWithAllDetails) => void;
};

export default function QuoteModal({ mode, quoteId, quoteIndex, quoteLink, salesleadId, projectId, clientId, leadDetails, setLeadDetails }: Props) {
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);

  async function handleAddNewQuote(formData: FormData) {
    try {
      if (formData.get('link') === null) throw new Error('No quote link provided.');
      const newQuote = {
        id: -1,
        index: -1,
        link: formData.get('link') as string,
        saleslead: salesleadId,
        client: clientId,
        project: projectId,
      };
      // add quote to leadDetails
      const newLeadDetails = { ...leadDetails, quote: newQuote };
      setLeadDetails(newLeadDetails);
      setShowModal(false);
    } catch (err: any) {
      setStatus(err.message);
    }
  }

  async function handleUpdateQuote(formData: FormData) {
    try {
      if (!quoteId) throw new Error('No quote ID provided.');
      if (!formData.get('link')) throw new Error('No quote link provided.');
      if (!formData.get('index')) throw new Error('No quote index provided.');
      const updatedQuote = {
        id: quoteId,
        index: parseInt(formData.get('index') as string),
        link: formData.get('link') as string,
        saleslead: salesleadId,
        client: clientId,
        project: projectId,
      };
      const newLeadDetails = { ...leadDetails, quote: updatedQuote };
      setLeadDetails(newLeadDetails);
      setShowModal(false);
    } catch (err: any) {
      setStatus(err.message);
    }
  }

  return (
    <>
      {mode === 'new' && (
        <button
          className='std-button-lite'
          onClick={(e) => {
            e.preventDefault();
            setShowModal(true);
          }}>
          <FaFileSignature />
          Add Quote
        </button>
      )}
      {mode === 'edit' && (
        <button
          className='std-button-lite'
          onClick={(e) => {
            e.preventDefault();
            setShowModal(true);
          }}>
          <FaPenToSquare />
          Edit Link
        </button>
      )}
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
                    setStatus('');
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
              <input type='hidden' className='std-input w-full' name='id' value={quoteId ?? ''} />
              {/* Hidden field for index */}
              <input type='hidden' className='std-input w-full' name='index' value={quoteIndex ?? ''} />
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
                      <div>Link</div>
                      <div className='font-normal italic text-[12px]'>(Required)</div>
                    </td>
                    <td className='bg-white/50 border border-secondary/80 p-1'>
                      <input className='std-input w-full' name='link' defaultValue={quoteLink || ''} />
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className='flex items-center gap-2'>
                <button className='secondary-button-lite' onClick={(e) => {e.preventDefault();setShowModal(false); setStatus('');}}>
                  Cancel
                </button>
                <button className='std-button-lite'>Update Quote</button>
              </div>
              <div className='text-[#800]'>{status}</div>
            </form>
          </>
        )}
      </Modal>
    </>
  );
}
