'use client';

import { Address, ClientWithProjectsAddresses, clients } from '@/db/schema';
import { Suspense, useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaSpinner } from 'react-icons/fa';
import AddressBookModal from '../../../(_modal panels)/AddressBookModal';

type Props = {
  client: ClientWithProjectsAddresses;
};

export default function ClientDetailsForm({ client }: Props) {
  const [billingAddressList, setBillingAddressList] = useState<Address[]>(client?.billingAddresses?.map((joinTable)=>joinTable.address) ?? new Array<Address>());
  const [addressVisible, setAddressVisible] = useState(false);
  const [projectVisible, setProjectVisible] = useState(false);

  function addToBillingAddressList (address:Address) {
    setBillingAddressList([...billingAddressList, address]);
  }

  useEffect(() => {
    console.log("billing list updated: ",billingAddressList)
  },[billingAddressList])

  return (
    <>
      {client && (
        <table className='w-full text-left border-collapse'>
          <thead>
            <tr>
              <th className='w-[20%]'></th>
              <th className='w-[80%]'></th>
            </tr>
          </thead>
          <tbody>
            {/* Client Name */}
            <tr>
              <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Name</td>
              <td className='bg-white/50 border border-secondary/80 p-1'>
                <input className='std-input w-full' name='name' defaultValue={client.name} />
              </td>
            </tr>
            {/* Client Code */}
            <tr>
              <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Code</td>
              <td className='bg-white/50 border border-secondary/80 p-1'>
                <input className='std-input w-full text-[#888]' name='code' defaultValue={client.code} disabled />
              </td>
            </tr>
            {/* Account Type */}
            <tr>
              <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Account Type</td>
              <td className='bg-white/50 border border-secondary/80 p-1'>
                <select className='std-input w-full' name='accountType' defaultValue={client.accountType || ''}>
                  <option value=''>-- Choose --</option>
                  <option value='active'>Active</option>
                  <option value='inactive'>Inactive</option>
                </select>
              </td>
            </tr>
            {/* Billing Addresses */}
            <tr>
              <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Billing Addresses</td>
              <td className='bg-white/50 border border-secondary/80 p-2'>
                
                <table className='w-full text-left border-collapse my-2'>
                  <thead>
                    <tr>
                      <th className='w-[80%]'>Address</th>
                      <th className='w-[20%]'>Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingAddressList.length > 0 ? (
                      <>
                        {billingAddressList.map((address, index: number) => (
                          <tr key={`project-${index}`}>
                            <td className='bg-white/50 border border-secondary/80 p-1'>{address.identifier}</td>
                            <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                              <div className='flex items-center gap-2 w-full justify-center'>
                                {/* <button className='std-button-lite' onClick={()=>handleShowEditProject(project)}>
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  <button className='danger-button-lite' onClick={()=>{setProjects(projects.filter((prevProject:any)=>project._id !== prevProject._id));}}>
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                  </button> */}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </>
                    ) : (
                      <>
                        <tr>
                          <td colSpan={3} className='bg-white/50 border border-secondary/80 p-1 italic'>
                            No billing addresses on file.
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
                <div className='flex items-center gap-2 p-1'>
                  <AddressBookModal addNewFunction={addToBillingAddressList} confirmSearchFunction={()=>{}} fallbackContents={<><FaSpinner className='animate-spin'/>Add</>} showModal={addressVisible} setShowModal={setAddressVisible} buttonContents={<><FaPlus/>Add</>} />
                </div>
              </td>
            </tr>
            {/* Projects */}
            <tr>
              <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Projects</td>
              <td className='bg-white/50 border border-secondary/80 p-2'>
                <table className='w-full text-left border-collapse my-2'>
                  <thead>
                    <tr>
                      <th className='w-[80%]'>Name</th>
                      <th className='w-[20%]'>Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.projects && client.projects.length > 0 ? (
                      <>
                        {client.projects.map((project: any, index: number) => (
                          <tr key={`project-${index}`}>
                            <td className='bg-white/50 border border-secondary/80 p-1'>{project.name}</td>
                            <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                              <div className='flex items-center gap-2 w-full justify-center'>
                                {/* <button className='std-button-lite' onClick={()=>handleShowEditProject(project)}>
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  <button className='danger-button-lite' onClick={()=>{setProjects(projects.filter((prevProject:any)=>project._id !== prevProject._id));}}>
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                  </button> */}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </>
                    ) : (
                      <>
                        <tr>
                          <td colSpan={3} className='bg-white/50 border border-secondary/80 p-1 italic'>
                            No projects on file.
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
                <div className='p-1'>
                  <button className='std-button-lite flex items-center gap-2' onClick={() => setProjectVisible(true)}>
                    <FaPlus />
                    <div>Add</div>
                  </button>
                </div>
              </td>
            </tr>
            {/* Client Website */}
            <tr>
              <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Website URL</td>
              <td className='bg-white/50 border border-secondary/80 p-1'>
                <input className='std-input w-full' name='website' defaultValue={client.website || ''} />
              </td>
            </tr>
            {/* Client Referred By */}
            <tr>
              <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Referred By</td>
              <td className='bg-white/50 border border-secondary/80 p-1'>
                <select className='std-input w-full' defaultValue={client.referredBy || ''}>
                  <option value=''>N/A</option>
                  {/* {contacts?.length > 0 && (
                        <>
                          {contacts.map((contact:any,index:number) => (
                            <option value={contact._id} key={`contact-${index}`}>{`${contact.first} ${contact.last}`}</option>
                          ))}
                        </>
                      )} */}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </>
  );
}
