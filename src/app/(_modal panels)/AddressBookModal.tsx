import Modal from '@/app/(global components)/Modal';
import { Address, Client, clients } from '@/db/schema';
import { FaPlus, FaSearch, FaSpinner } from 'react-icons/fa';
// import { addClient, generateClientCode } from '../actions';
import SubmitButton from '@/app/(global components)/SubmitButton';
import ModalButton from '@/app/(global components)/ModalButton';
import { db } from '@/db';
import { useState, useEffect } from 'react';
import { addAddress, getAddresses } from './actions';
import { sleep } from '@/debug/Sleep';

type Props = {
  fallbackContents: React.ReactNode;
  buttonContents: React.ReactNode;
  showModal: boolean;
  setShowModal: Function;
  addNewFunction: (address: Address) => void;
  confirmSearchFunction: Function;
};

export default function AddressBookModal({ fallbackContents, buttonContents, showModal, setShowModal, addNewFunction }: Props) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentTab, setCurrentTab] = useState('new');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('');

  const [addressSearch, setAddressSearch] = useState('');
  const [matchingList, setMatchingList] = useState<Address[]>(addresses);
  const [addressSelected, setAddressSelected] = useState<Address | null>(null);

  useEffect(() => {
    const regex = new RegExp(`${addressSearch}`, 'gi');
    const filteredList = addresses.filter((address) => address.identifier.match(regex));
    if (addressSelected && filteredList.indexOf(addressSelected) < 0) setAddressSelected(null);
    setMatchingList(filteredList);
  }, [setMatchingList, addressSearch, addresses, addressSelected]);

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

  async function handleAddAddress(formData: FormData) {
    setSubmitting(true);
    try {
      const newAddress = await addAddress(formData);
      addNewFunction(newAddress);
      setStatus('');
      setShowModal(false);
    } catch (err: any) {
      setStatus(err.message);
    }

    // addNewFunction(newAddress);
    setSubmitting(false);
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
            <form className='flex flex-col gap-4' action={handleAddAddress}>
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
                    setShowModal(false);
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
              <input className='std-input w-full' name='name' value={addressSearch} onChange={(e) => setAddressSearch(e.target.value)} placeholder='Start typing an address label...' />
            </div>
            {matchingList.length > 0 ? (
              <div className='flex flex-col gap-2'>
                <div>{`Select an address:`}</div>
                <div className='border border-secondary/80 w-full h-[200px] mb-2 overflow-y-scroll bg-white/50'>
                  <>
                    {matchingList.map((address, index: number) => (
                      <button key={`contact-${index}`} className={`flex w-full px-2 py-2 border border-secondary/80 border-b-1 border-l-0 border-r-0 border-t-0 last:border-b-0 cursor-pointer ${addressSelected === address ? `bg-primary text-white` : ``}`} onClick={() => setAddressSelected(address)}>
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
                    setShowModal(false);
                  }}>
                  Cancel
                </button>
                <button className='std-button-lite' disabled={!addressSelected}>Edit Details</button>
                <button className='std-button-lite' disabled={!addressSelected}>Add Address</button>
              </div>
              <div className='text-[#800]'>{status}</div>
          </>
        )}
      </Modal>
    </>
  );
}
