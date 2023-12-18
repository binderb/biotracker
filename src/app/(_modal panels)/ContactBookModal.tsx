import Modal from '@/app/(global components)/Modal';
import { Contact } from '@/db/schema_clientModule';
import { FaPlus, FaSearch, FaSpinner } from 'react-icons/fa';
// import { addClient, generateClientCode } from '../actions';
import SubmitButton from '@/app/(global components)/SubmitButton';
import ModalButton from '@/app/(global components)/ModalButton';
import { db } from '@/db';
import { useState, useEffect } from 'react';
import { addAddress, addContact, getAddresses, getContacts, updateAddress, updateContact } from './actions';
import { sleep } from '@/debug/Sleep';

type Props = {
  fallbackContents: React.ReactNode;
  buttonContents: React.ReactNode;
  showModal: boolean;
  setShowModal: Function;
  addNewFunction: (contact: Contact) => void;
  saveChangesFunction: (contact: Contact) => void;
  confirmSearchFunction: (contact: Contact) => void;
};

export default function ContactBookModal({ fallbackContents, buttonContents, showModal, setShowModal, addNewFunction, saveChangesFunction, confirmSearchFunction }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState('main');

  const [currentTab, setCurrentTab] = useState('new');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('');

  const [search, setSearch] = useState('');
  const [matchingList, setMatchingList] = useState<Contact[]>(contacts);
  const [selected, setSelected] = useState<Contact | null>(null);

  useEffect(() => {
    const regex = new RegExp(`${search}`, 'gi');
    const filteredList = contacts.filter((contact) => `${contact.first} ${contact.last}`.match(regex));
    if (selected && filteredList.indexOf(selected) < 0) setSelected(null);
    setMatchingList(filteredList);
  }, [setMatchingList, search, contacts, selected]);

  const tabs = [
    { name: 'new', displayName: 'Add New' },
    { name: 'search', displayName: 'Search' },
  ];

  async function handleShowModal() {
    setLoading(true);
    const fetchedContacts = await getContacts();
    setContacts(fetchedContacts);
    setLoading(false);
    setShowModal(true);
  }

  function handleCancel() {
    setStatus('');
    setSearch('');
    setShowModal(false);
  }

  async function handleAddNewContact(formData: FormData) {
    setSubmitting(true);
    try {
      const newContact = await addContact(formData);
      addNewFunction(newContact);
      setStatus('');
      setSearch('');
      setShowModal(false);
    } catch (err: any) {
      setStatus(err.message);
    }

    // addNewFunction(newAddress);
    setSubmitting(false);
  }

  async function handleUpdateContact(formData:FormData) {
    setSubmitting(true);
    try {
      const updatedContact = await updateContact(formData);
      saveChangesFunction(updatedContact);
      const fetchedContacts = await getContacts();
      setContacts(fetchedContacts);
      setView('main');
    } catch (err:any) {
      setStatus(err.message);
    }
    setSubmitting(false);
  }

  function handlePickSearchResult() {
    if (selected) {
      try {
        confirmSearchFunction(selected);
        setStatus('');
        setSearch('');
        setShowModal(false);
      } catch (err: any) {
        setStatus(err.message);
      }
    }
  }

  return (
    <>
      <button
        className='std-button-lite'
        onClick={(e) => {
          e.preventDefault();
          handleShowModal();
        }}>
        {loading ? fallbackContents : buttonContents}
      </button>
      <Modal showModal={showModal} className='w-[90vw] md:w-[60%]'>
        {view === 'main' && (
          <>
            <h5>Contact Book</h5>
            <div className='tab-group'>
              {tabs.map((tab) => (
                <button key={tab.name} name={tab.name} className={tab.name === currentTab ? 'selected' : ''} onClick={(e) => setCurrentTab(tab.name)}>
                  {tab.displayName}
                </button>
              ))}
            </div>
            {currentTab === 'new' && (
              <>
                <form className='flex flex-col gap-4' action={handleAddNewContact}>
                  <table className='w-full text-left border-collapse'>
                    <thead>
                      <tr>
                        <th className='w-[20%]'></th>
                        <th className='w-[80%]'></th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* First Name */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                          <div>First Name</div>
                          <div className='font-normal italic text-[12px]'>(Required)</div>
                        </td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='first' />
                        </td>
                      </tr>
                      {/* Last Name */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                          <div>Last Name</div>
                          <div className='font-normal italic text-[12px]'>(Required)</div>
                        </td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='last' />
                        </td>
                      </tr>
                      {/* Referred By */}
                      {/* <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                          <div>Last Name</div>
                          <div className='font-normal italic text-[12px]'>(Required)</div>
                        </td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='last' />
                        </td>
                      </tr> */}
                      {/* Email */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Email</td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='email' />
                        </td>
                      </tr>
                      {/* Phone */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Phone</td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='phone' />
                        </td>
                      </tr>
                      {/* Links */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                        <div>Links</div>
                        <div className='font-normal italic text-[12px]'>(Separate with commas)</div>
                        </td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <textarea className='std-input w-full resize-none' name='links' />
                        </td>
                      </tr>
                      {/* Notes */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                        Notes
                        </td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <textarea className='std-input w-full resize-none' name='notes' />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className='flex items-center gap-2'>
                    <button
                      disabled={submitting}
                      className='secondary-button-lite'
                      onClick={(e) => {
                        e.preventDefault();
                        handleCancel();
                      }}>
                      Cancel
                    </button>
                    <SubmitButton text='Create Contact / Add to Client Details' pendingText='Creating and Adding...' />
                  </div>
                  <div className='text-[#800]'>{status}</div>
                </form>
              </>
            )}
            {currentTab === 'search' && (
              <>
                <div className='flex items-center gap-2'>
                  <FaSearch />
                  <input className='std-input w-full' name='name' value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Start typing a contact name...' />
                </div>
                {matchingList.length > 0 ? (
                  <div className='flex flex-col gap-2'>
                    <div>{`Select a contact:`}</div>
                    <div className='border border-secondary/80 w-full h-[200px] mb-2 overflow-y-scroll bg-white/50'>
                      <>
                        {matchingList.map((contact, index: number) => (
                          <button key={`contact-${index}`} className={`flex w-full px-2 py-2 border border-secondary/80 border-b-1 border-l-0 border-r-0 border-t-0 last:border-b-0 cursor-pointer ${selected === contact ? `bg-primary text-white` : ``}`} onClick={() => setSelected(contact)}>
                            {`${contact.first} ${contact.last}`}
                          </button>
                        ))}
                      </>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className='italic h-[230px]'>No results.</div>
                  </>
                )}
                <div className='flex items-center gap-2'>
                  <button
                    disabled={submitting}
                    className='secondary-button-lite'
                    onClick={(e) => {
                      e.preventDefault();
                      handleCancel();
                    }}>
                    Cancel
                  </button>
                  <button className='std-button-lite' disabled={!selected} onClick={()=>setView('editing')}>
                    Edit Details
                  </button>
                  <button className='std-button-lite' disabled={!selected} onClick={handlePickSearchResult}>
                    Add Contact
                  </button>
                </div>
                <div className='text-[#800]'>{status}</div>
              </>
            )}
          </>
        )}
        {view === 'editing' && (
          <>
          <h5>Contact Book</h5>
          <form className='flex flex-col gap-4' action={handleUpdateContact}>
            {/* Hidden field for id */}
            <input type='hidden' className='std-input w-full' name='id' value={selected?.id ?? ''} />
                  <table className='w-full text-left border-collapse'>
                    <thead>
                      <tr>
                        <th className='w-[20%]'></th>
                        <th className='w-[80%]'></th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* First Name */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                          <div>First Name</div>
                          <div className='font-normal italic text-[12px]'>(Required)</div>
                        </td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='first' defaultValue={selected?.first ?? ''} />
                        </td>
                      </tr>
                      {/* Last Name */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                          <div>Last Name</div>
                          <div className='font-normal italic text-[12px]'>(Required)</div>
                        </td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='last' defaultValue={selected?.last ?? ''} />
                        </td>
                      </tr>
                      {/* Referred By */}
                      {/* <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                          <div>Last Name</div>
                          <div className='font-normal italic text-[12px]'>(Required)</div>
                        </td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='last' defaultValue={selected?.last ?? ''} />
                        </td>
                      </tr> */}
                      {/* Email */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Email</td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='email' defaultValue={selected?.email ?? ''} />
                        </td>
                      </tr>
                      {/* Phone */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Phone</td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='phone' defaultValue={selected?.phone ?? ''} />
                        </td>
                      </tr>
                      {/* Links */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                        <div>Links</div>
                        <div className='font-normal italic text-[12px]'>(Separate with commas)</div>
                        </td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <textarea className='std-input w-full resize-none' name='links' defaultValue={selected?.links ?? ''} />
                        </td>
                      </tr>
                      {/* Notes */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                        Notes
                        </td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <textarea className='std-input w-full resize-none' name='notes' defaultValue={selected?.notes ?? ''} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className='flex items-center gap-2'>
                    <button
                      disabled={submitting}
                      className='secondary-button-lite'
                      onClick={(e) => {
                        e.preventDefault();
                        setStatus('');
                        setView('main');
                      }}>
                      &larr; Back to Search
                    </button>
                    <SubmitButton text='Save Changes' pendingText='Saving...' />
                  </div>
                  <div className='text-[#800]'>{status}</div>
                </form>
          </>
        )}
      </Modal>
    </>
  );
}
