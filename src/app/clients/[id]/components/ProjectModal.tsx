import Modal from '@/app/(global components)/Modal';
import { Address, Contact, ProjectWithAllDetails } from '@/db/schema';
import { FaSearch, FaTrashAlt } from 'react-icons/fa';
import SubmitButton from '@/app/(global components)/SubmitButton';
import { useState, useEffect, useRef } from 'react';

type Props = {
  mode: string;
  clientId: number;
  clientAddresses: Address[];
  clientContacts: Contact[];
  project?: ProjectWithAllDetails;
  buttonContents: React.ReactNode;
  showModal: boolean;
  setShowModal: Function;
  addNewFunction: (project: ProjectWithAllDetails) => void;
  saveChangesFunction: (project: ProjectWithAllDetails) => void;
};

export default function ProjectModal({ showModal, setShowModal, addNewFunction, saveChangesFunction, clientAddresses, clientContacts, buttonContents, project, clientId, mode }: Props) {
  const [status, setStatus] = useState('');
  const [contactList, setContactList] = useState<Contact[]>(project?.contacts?.map((joinTableEntry) => joinTableEntry.contact) ?? []);
  const [contactToAdd, setContactToAdd] = useState<Contact | null>(null);
  const createForm = useRef<HTMLFormElement>(null);
  const editForm = useRef<HTMLFormElement>(null);

  async function handleShowModal() {
    setShowModal(true);
  }

  function handleClose() {
    setStatus('');
    setContactList([]);
    createForm.current?.reset();
    editForm.current?.reset();
    setContactToAdd(null);
    setShowModal(false);
  }

  async function handleAddNewProject(formData: FormData) {
    try {
      const formJSON = Object.fromEntries(formData) as unknown as ProjectWithAllDetails;
      if (!formJSON.name) throw new Error('Every project must have a name!');
      const newProject: ProjectWithAllDetails = {
        ...formJSON,
        id: -1,
        client: clientId,
        contacts: contactList.map((contact) => ({ contact: contact })),
      };
      addNewFunction(newProject);
      handleClose();
    } catch (err: any) {
      setStatus(err.message);
    }
  }

  function handleUpdateProject(formData: FormData) {
    try {
      const formJSON = Object.fromEntries(formData) as unknown as ProjectWithAllDetails;
      if (!formJSON.name) throw new Error('Every project must have a name!');
      const newProject: ProjectWithAllDetails = {
        ...formJSON,
        id: -1,
        client: clientId,
        contacts: contactList.map((contact) => ({ contact: contact })),
      };
      saveChangesFunction(newProject);
      handleClose();
    } catch (err: any) {
      setStatus(err.message);
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
        {buttonContents}
      </button>
      <Modal showModal={showModal} className='w-[90vw] md:w-[60%]'>
        {mode === 'new' && (
          <>
            <h5>Add Project</h5>
            <form className='flex flex-col gap-4' ref={createForm} action={handleAddNewProject}>
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
                      <div>Name</div>
                      <div className='font-normal italic text-[12px]'>(Required)</div>
                    </td>
                    <td className='bg-white/50 border border-secondary/80 p-1'>
                      <input className='std-input w-full' name='name' />
                    </td>
                  </tr>
                  {/* NDA */}
                  <tr>
                    <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                      <div>NDA Signed?</div>
                    </td>
                    <td className='bg-white/50 border border-secondary/80 p-1'>
                      <input className='w-full' type='checkbox' name='nda' />
                    </td>
                  </tr>
                  {/* Billing */}
                  <tr>
                    <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                      <div>Billing Address</div>
                    </td>
                    <td className='bg-white/50 border border-secondary/80 p-1'>
                      <select className='std-input w-full' name='billingAddress'>
                        <option value=''>N/A</option>
                        {clientAddresses.map((address) => (
                          <option key={address.id}>{address.identifier}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {/* Contacts */}
                  <tr>
                    <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Contacts</td>
                    <td className='bg-white/50 border border-secondary/80 p-1'>
                      <div className='flex items-center gap-2'>
                        <div className='font-bold'>Contact:</div>
                        <select className='std-input w-full' value={contactToAdd?.id || ''} onChange={(e) => (e.target.value ? setContactToAdd(clientContacts.filter((contact) => contact.id === parseInt(e.target.value))[0]) : setContactToAdd(null))}>
                          <option value=''>-- Choose --</option>
                          {clientContacts.map((contact) => (
                            <option key={contact.id} value={contact.id} disabled={contactList.filter((listContact) => listContact.id === contact.id).length > 0}>{`${contact.first} ${contact.last}`}</option>
                          ))}
                        </select>

                        <button
                          className='std-button-lite'
                          onClick={(e) => {
                            e.preventDefault();
                            if (contactToAdd) {
                              setContactList([...contactList, contactToAdd]);
                              setContactToAdd(null);
                            }
                          }}>
                          Add
                        </button>
                      </div>
                      <table className='w-full text-left border-collapse my-2'>
                        <thead>
                          <tr>
                            <th className='w-[80%]'>Name</th>
                            <th className='w-[20%]'>Options</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contactList.length > 0 ? (
                            <>
                              {contactList.map((contact, index: number) => (
                                <tr key={`contact-${index}`}>
                                  <td className='bg-white/50 border border-secondary/80 p-1'>{`${contact.first} ${contact.last}`}</td>
                                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                                    <div className='flex items-center gap-2 w-full justify-center'>
                                      {/* <button className='std-button-lite' onClick={()=>handleShowEditProject(project)}>
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button> */}
                                      <button
                                        className='danger-button-lite'
                                        onClick={() => {
                                          setContactList(contactList.filter((prevContact) => contact.id !== prevContact.id));
                                        }}>
                                        <FaTrashAlt />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </>
                          ) : (
                            <>
                              <tr>
                                <td colSpan={3} className='bg-white/50 border border-secondary/80 p-1 italic'>
                                  No contacts added.
                                </td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className='flex items-center gap-2'>
                <button
                  className='secondary-button-lite'
                  onClick={(e) => {
                    e.preventDefault();
                    handleClose();
                  }}>
                  Cancel
                </button>
                <button className='std-button-lite'>Add Project</button>
              </div>
              <div className='text-[#800]'>{status}</div>
            </form>
          </>
        )}
        {mode === 'edit' && (
          <>
            <h5>Edit Project</h5>
            <form className='flex flex-col gap-4' ref={editForm} action={handleUpdateProject}>
              {/* Hidden field for id */}
              <input type='hidden' className='std-input w-full' name='id' value={project?.id ?? ''} />
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
                      <div>Name</div>
                      <div className='font-normal italic text-[12px]'>(Required)</div>
                    </td>
                    <td className='bg-white/50 border border-secondary/80 p-1'>
                      <input className='std-input w-full' name='name' defaultValue={project?.name || ''} />
                    </td>
                  </tr>
                  {/* NDA */}
                  <tr>
                    <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                      <div>NDA Signed?</div>
                    </td>
                    <td className='bg-white/50 border border-secondary/80 p-1'>
                      <input className='w-full' type='checkbox' name='nda' defaultChecked={project?.nda || false} />
                    </td>
                  </tr>
                  {/* Billing */}
                  <tr>
                    <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                      <div>Billing Address</div>
                    </td>
                    <td className='bg-white/50 border border-secondary/80 p-1'>
                      <select className='std-input w-full' name='billingAddress' defaultValue={project?.billingAddress || ''}>
                        <option value=''>N/A</option>
                        {clientAddresses.map((address) => (
                          <option key={address.id}>{address.identifier}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {/* Contacts */}
                  <tr>
                    <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Contacts</td>
                    <td className='bg-white/50 border border-secondary/80 p-1'>
                      <div className='flex items-center gap-2'>
                        <div className='font-bold'>Contact:</div>
                        <select className='std-input w-full' value={contactToAdd?.id || ''} onChange={(e) => (e.target.value ? setContactToAdd(clientContacts.filter((contact) => contact.id === parseInt(e.target.value))[0]) : setContactToAdd(null))}>
                          <option value=''>-- Choose --</option>
                          {clientContacts.map((contact) => (
                            <option key={contact.id} value={contact.id} disabled={contactList.filter((listContact) => listContact.id === contact.id).length > 0}>{`${contact.first} ${contact.last}`}</option>
                          ))}
                        </select>

                        <button
                          className='std-button-lite'
                          onClick={(e) => {
                            e.preventDefault();
                            if (contactToAdd) {
                              setContactList([...contactList, contactToAdd]);
                              setContactToAdd(null);
                            }
                          }}>
                          Add
                        </button>
                      </div>
                      <table className='w-full text-left border-collapse my-2'>
                        <thead>
                          <tr>
                            <th className='w-[80%]'>Name</th>
                            <th className='w-[20%]'>Options</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contactList.length > 0 ? (
                            <>
                              {contactList.map((contact, index: number) => (
                                <tr key={`contact-${index}`}>
                                  <td className='bg-white/50 border border-secondary/80 p-1'>{`${contact.first} ${contact.last}`}</td>
                                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                                    <div className='flex items-center gap-2 w-full justify-center'>
                                      {/* <button className='std-button-lite' onClick={()=>handleShowEditProject(project)}>
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button> */}
                                      <button
                                        className='danger-button-lite'
                                        onClick={() => {
                                          setContactList(contactList.filter((prevContact) => contact.id !== prevContact.id));
                                        }}>
                                        <FaTrashAlt />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </>
                          ) : (
                            <>
                              <tr>
                                <td colSpan={3} className='bg-white/50 border border-secondary/80 p-1 italic'>
                                  No contacts added.
                                </td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className='flex items-center gap-2'>
                <button className='secondary-button-lite' onClick={handleClose}>
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
