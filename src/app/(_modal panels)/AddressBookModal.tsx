import Modal from '@/app/(global components)/Modal';
import { Address, Client, clients } from '@/db/schema_clientModule';
import { FaPlus, FaSearch, FaSpinner } from 'react-icons/fa';
// import { addClient, generateClientCode } from '../actions';
import SubmitButton from '@/app/(global components)/SubmitButton';
import ModalButton from '@/app/(global components)/ModalButton';
import { db } from '@/db';
import { useState, useEffect } from 'react';
import { addAddress, getAddresses, updateAddress } from './actions';
import { sleep } from '@/debug/Sleep';

type Props = {
  fallbackContents: React.ReactNode;
  buttonContents: React.ReactNode;
  showModal: boolean;
  setShowModal: Function;
  addNewFunction: (address: Address) => void;
  saveChangesFunction: (address: Address) => void;
  confirmSearchFunction: (address: Address) => void;
};

export default function AddressBookModal({ fallbackContents, buttonContents, showModal, setShowModal, addNewFunction, saveChangesFunction, confirmSearchFunction }: Props) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState('main');

  const [currentTab, setCurrentTab] = useState('new');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('');

  const [search, setSearch] = useState('');
  const [matchingList, setMatchingList] = useState<Address[]>(addresses);
  const [selected, setSelected] = useState<Address | null>(null);

  useEffect(() => {
    const regex = new RegExp(`${search}`, 'gi');
    const filteredList = addresses.filter((address) => address.identifier.match(regex));
    if (selected && filteredList.indexOf(selected) < 0) setSelected(null);
    setMatchingList(filteredList);
  }, [setMatchingList, search, addresses, selected]);

  const tabs = [
    { name: 'new', displayName: 'Add New' },
    { name: 'search', displayName: 'Search' },
  ];

  async function handleShowModal() {
    setLoading(true);
    const fetchedAddresses = await getAddresses();
    setAddresses(fetchedAddresses);
    setLoading(false);
    setShowModal(true);
  }

  function handleCancel() {
    setStatus('');
    setSearch('');
    setShowModal(false);
  }

  async function handleAddNewAddress(formData: FormData) {
    setSubmitting(true);
    try {
      const newAddress = await addAddress(formData);
      addNewFunction(newAddress);
      setStatus('');
      setSearch('');
      setShowModal(false);
    } catch (err: any) {
      setStatus(err.message);
    }

    // addNewFunction(newAddress);
    setSubmitting(false);
  }

  async function handleUpdateAddress(formData:FormData) {
    setSubmitting(true);
    try {
      const updatedAddress = await updateAddress(formData);
      saveChangesFunction(updatedAddress);
      const fetchedAddresses = await getAddresses();
      setAddresses(fetchedAddresses);
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
            <h5>Address Book</h5>
            <div className='tab-group'>
              {tabs.map((tab) => (
                <button key={tab.name} name={tab.name} className={tab.name === currentTab ? 'selected' : ''} onClick={(e) => setCurrentTab(tab.name)}>
                  {tab.displayName}
                </button>
              ))}
            </div>
            {currentTab === 'new' && (
              <>
                <form className='flex flex-col gap-4' action={handleAddNewAddress}>
                  <table className='w-full text-left border-collapse'>
                    <thead>
                      <tr>
                        <th className='w-[20%]'></th>
                        <th className='w-[80%]'></th>
                      </tr>
                    </thead>
                    <tbody>
                      
                      {/* Billing Identifier */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                          <div>Label</div>
                          <div className='font-normal italic text-[12px]'>(Internal Use)</div>
                        </td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='identifier' />
                        </td>
                      </tr>
                      {/* Billing Name */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Name</td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='entityName' />
                        </td>
                      </tr>
                      {/* Billing Address Line 1 */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Address Line 1</td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='addressLine1' />
                        </td>
                      </tr>
                      {/* Billing Address Line 2 */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Address Line 2</td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='addressLine2' />
                        </td>
                      </tr>
                      {/* Billing City */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>City</td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='city' />
                        </td>
                      </tr>
                      {/* Billing State/Province */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>State/Province</td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='stateProvince' />
                        </td>
                      </tr>
                      {/* Billing Postal Code */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Postal Code</td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='postalCode' />
                        </td>
                      </tr>
                      {/* Billing Country */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Country</td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='country' />
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
                    <SubmitButton text='Create Address / Add to Client Details' pendingText='Creating and Adding...' />
                  </div>
                  <div className='text-[#800]'>{status}</div>
                </form>
              </>
            )}
            {currentTab === 'search' && (
              <>
                <div className='flex items-center gap-2'>
                  <FaSearch />
                  <input className='std-input w-full' name='name' value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Start typing an address label...' />
                </div>
                {matchingList.length > 0 ? (
                  <div className='flex flex-col gap-2'>
                    <div>{`Select an address:`}</div>
                    <div className='border border-secondary/80 w-full h-[200px] mb-2 overflow-y-scroll bg-white/50'>
                      <>
                        {matchingList.map((address, index: number) => (
                          <button key={`contact-${index}`} className={`flex w-full px-2 py-2 border border-secondary/80 border-b-1 border-l-0 border-r-0 border-t-0 last:border-b-0 cursor-pointer ${selected === address ? `bg-primary text-white` : ``}`} onClick={() => setSelected(address)}>
                            {address.identifier}
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
                    Add Address
                  </button>
                </div>
                <div className='text-[#800]'>{status}</div>
              </>
            )}
          </>
        )}
        {view === 'editing' && (
          <>
          <h5>Address Book</h5>
          <form className='flex flex-col gap-4' action={handleUpdateAddress}>
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
                      {/* Billing Identifier */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                          <div>Label</div>
                          <div className='font-normal italic text-[12px]'>(Internal Use)</div>
                        </td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='identifier' defaultValue={selected?.identifier ?? ''} />
                        </td>
                      </tr>
                      {/* Billing Name */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Name</td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='entityName' defaultValue={selected?.entityName ?? ''} />
                        </td>
                      </tr>
                      {/* Billing Address Line 1 */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Address Line 1</td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='addressLine1' defaultValue={selected?.addressLine1 ?? ''} />
                        </td>
                      </tr>
                      {/* Billing Address Line 2 */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Address Line 2</td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='addressLine2' defaultValue={selected?.addressLine2 ?? ''} />
                        </td>
                      </tr>
                      {/* Billing City */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>City</td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='city' defaultValue={selected?.city ?? ''} />
                        </td>
                      </tr>
                      {/* Billing State/Province */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>State/Province</td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='stateProvince' defaultValue={selected?.stateProvince ?? ''} />
                        </td>
                      </tr>
                      {/* Billing Postal Code */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Postal Code</td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='postalCode' defaultValue={selected?.postalCode ?? ''} />
                        </td>
                      </tr>
                      {/* Billing Country */}
                      <tr>
                        <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Country</td>
                        <td className='bg-white/50 border border-secondary/80 p-1'>
                          <input className='std-input w-full' name='country' defaultValue={selected?.country ?? ''} />
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
