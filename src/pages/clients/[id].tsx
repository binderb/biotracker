import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { addApolloState, initializeApollo } from "../../../utils/apolloClient";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { GET_CLIENT, GET_CLIENTS, GET_CONTACTS } from "@/utils/queries";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faFolderMinus, faPerson, faPersonRays, faPlus, faTrashAlt, faUser, faUserGroup, faUserMinus, faUserXmark } from "@fortawesome/free-solid-svg-icons";
import ContactNew from "@/components/clients/ContactNew";
import ContactSearch from "@/components/clients/ContactSearch";
import { ADD_ADDRESS, ADD_CONTACT, UPDATE_ADDRESS, UPDATE_CLIENT, UPDATE_CONTACT } from "@/utils/mutations";
import { ClientReferenceManifestPlugin } from "next/dist/build/webpack/plugins/flight-manifest-plugin";

export async function getServerSideProps(context:any) {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions
  )
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false 
      }
    }
  }

  const apolloClient = initializeApollo();
  try {
    await apolloClient.query({
      query: GET_CLIENT,
      variables: {
        clientId: context.params.id
      }
    });
  } catch (err:any) {
    console.log(JSON.stringify(err));
  }
  await apolloClient.query({
    query: GET_CONTACTS
  });

  return addApolloState(apolloClient, {
    props: {
      session,
      clientId: context.params.id,
    },
  });

}

export default function ClientDetails (props:any) {
  const router = useRouter();
  const apolloClient = useApolloClient();
  const {data:session, status} = useSession();
  const {data:clientResponse} = useQuery(GET_CLIENT, {
    variables: {clientId: props.clientId}
  });
  const client = clientResponse?.getClient;
  console.log(client);
  const {data:contactsResponse} = useQuery(GET_CONTACTS);
  const contacts = contactsResponse?.getContacts;
  const [addContact] = useMutation(ADD_CONTACT);
  const [updateContact] = useMutation(UPDATE_CONTACT);
  const [addAddress] = useMutation(ADD_ADDRESS);
  const [updateAddress] = useMutation(UPDATE_ADDRESS);
  const [updateClient] = useMutation(UPDATE_CLIENT);

  const [mainErrStatus, setMainErrStatus] = useState('');
  const [newProjectVisible, setNewProjectVisible] = useState(false);
  const [newProjectErrStatus, setNewProjectErrStatus] = useState('');
  const [newBillingAddressVisible, setNewBillingAddressVisible] = useState(false);
  const [newBillingAddressErrStatus, setNewBillingAddressErrStatus] = useState('');
  const [editBillingAddressVisible, setEditBillingAddressVisible] = useState(false);
  const [editBillingAddressErrStatus, setEditBillingAddressErrStatus] = useState('');
  const [addingNewContact, setAddingNewContact] = useState(false);
  const [addingExistingContact, setAddingExistingContact] = useState(false);
  const [editingExistingContact, setEditingExistingContact] = useState(false);
  const [newContactErrStatus, setNewContactErrStatus] = useState('');
  const [editContactErrStatus, setEditContactErrStatus] = useState('');
  const [editProjectVisible, setEditProjectVisible] = useState(false);
  const [editProjectErrStatus, setEditProjectErrStatus] = useState('');

  const [clientName, setClientName] = useState(client.name || '');
  const [clientNDA, setClientNDA] = useState(client.nda || false);
  const [clientWebsite, setClientWebsite] = useState(client.website || '');
  const [clientReferredBy, setClientReferredBy] = useState(client.referredBy?._id || '');
  const [clientAccountType, setClientAccountType] = useState(client.accountType || 'active');
  const [billingAddresses, setBillingAddresses] = useState<any[]>(client.billingAddresses || []);
  const [billingSelected, setBillingSelected] = useState<any>((client.billingAddresses && client.billingAddresses.length > 0) ? client.billingAddresses[0] : {});
  const [billingSelectedId, setBillingSelectedId] = useState((client.billingAddresses && client.billingAddresses.length > 0) ? client.billingAddresses[0]._id : '')
  const [billingIdentifier, setBillingIdentifier] = useState('');
  const [billingName, setBillingName] = useState('');
  const [billingLine1, setBillingLine1] = useState('');
  const [billingLine2, setBillingLine2] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingStateProvince, setBillingStateProvince] = useState('');
  const [billingPostalCode, setBillingPostalCode] = useState('');
  const [billingCountry, setBillingCountry] = useState('');
  const [projects, setProjects] = useState([...client.projects]);
  const [projectEditId, setProjectEditId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectNDA, setProjectNDA] = useState(false);
  const [projectBillingId, setProjectBillingId] = useState('');
  const [projectContacts, setProjectContacts] = useState<any[]>([]);
  const [projectKeyContacts, setProjectKeyContacts] = useState<boolean[]>([]);
  const [contactEditId, setContactEditId] = useState('');
  const [contactFirst, setContactFirst] = useState('');
  const [contactLast, setContactLast] = useState('');
  const [contactReferredBy, setContactReferredBy] = useState<any>(null);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactLinks, setContactLinks] = useState('');
  const [contactNotes, setContactNotes] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [contactSelected, setContactSelected] = useState<any>(null);

  useEffect(() => {
    const filteredAddresses = billingAddresses.filter((e:any) => e._id === billingSelectedId);
    setBillingSelected(filteredAddresses.length > 0 ? filteredAddresses[0] : null);
  },[setBillingSelected, billingSelectedId, billingAddresses]);  

  useEffect(() => {
    console.log("projectBillingId: ", projectBillingId);
  })

  useEffect(() => {
    console.log("projects: ", projects);
  })


  if (status !== 'authenticated') {
    router.push('/login');
    return;
  }

  async function handleAddBillingAddress () {
    try {
      const mailingAddressJSON = JSON.stringify(
        {
          identifier: billingIdentifier,
          entityName: billingName,
          addressLine1: billingLine1,
          addressLine2: billingLine2,
          city: billingCity,
          stateProvince: billingStateProvince,
          country: billingCountry,
          postalCode: billingPostalCode
        }
      );
      const {data: newAddressResponse} = await addAddress({variables:{mailingAddressJSON: mailingAddressJSON}});
      const newAddress = newAddressResponse.addMailingAddress;
      console.log(newAddress);
      setBillingAddresses([...billingAddresses, newAddress]);
      setBillingSelectedId(newAddress._id);
      setNewBillingAddressVisible(false);
      setNewBillingAddressErrStatus('');
      setBillingIdentifier('');
      setBillingName('');
      setBillingLine1('');
      setBillingLine2('');
      setBillingCity('');
      setBillingStateProvince('');
      setBillingCountry('');
      setBillingPostalCode('');
    } catch (err:any) {
      setNewBillingAddressErrStatus(err.message);
    }
  }
  
  function handleAddProject () {
    const newProject = {
      _id: `new-${projects.length}`,
      name: projectName,
      nda: projectNDA,
      billingAddress: projectBillingId || null,
      contacts: projectContacts,
      keyContacts: projectKeyContacts
    }
    if (!projectName) {
      setNewProjectErrStatus('You must include a project name!');
      return;
    }
    setProjects([...projects, newProject]);
    setNewProjectVisible(false);
    setProjectName('');
    setProjectNDA(false);
    setProjectBillingId('');
    setProjectContacts([]);
    setProjectKeyContacts([]);
    setNewProjectErrStatus('');
  }

  function handleShowEditBillingAddress (address:any) {
    setBillingIdentifier(billingSelected.identifier);
    setBillingName(billingSelected.entityName);
    setBillingLine1(billingSelected.addressLine1);
    setBillingLine2(billingSelected.addressLine2);
    setBillingCity(billingSelected.city);
    setBillingStateProvince(billingSelected.stateProvince);
    setBillingCountry(billingSelected.country);
    setBillingPostalCode(billingSelected.postalCode);
    setEditBillingAddressVisible(true);
  }

  async function handleUpdateBillingAddress () {
    try {
      const mailingAddressJSON = JSON.stringify(
        {
          identifier: billingIdentifier,
          entityName: billingName,
          addressLine1: billingLine1,
          addressLine2: billingLine2,
          city: billingCity,
          stateProvince: billingStateProvince,
          country: billingCountry,
          postalCode: billingPostalCode
        }
      );
      const {data: updatedAddressResponse} = await updateAddress({variables:{
        mailingAddressId: billingSelected._id,
        mailingAddressJSON: mailingAddressJSON
      }});
      const updatedAddress = updatedAddressResponse.updateMailingAddress;
      const addressIndex = billingAddresses.indexOf(billingAddresses.filter((e:any) => e._id === billingSelected._id)[0]);
      const newAddresses = [...billingAddresses];
      newAddresses.splice(addressIndex,1,updatedAddress);
      console.log(newAddresses);
      setBillingAddresses(newAddresses);
      setEditBillingAddressVisible(false);
      setEditBillingAddressErrStatus('');
      setBillingIdentifier('');
      setBillingName('');
      setBillingLine1('');
      setBillingLine2('');
      setBillingCity('');
      setBillingStateProvince('');
      setBillingCountry('');
      setBillingPostalCode('');
    } catch (err:any) {
      setEditBillingAddressErrStatus(err.message);
    }
  }

  function handleShowEditProject (project:any) {
    setProjectEditId(project._id);
    setProjectName(project.name);
    setProjectNDA(project.nda);
    setProjectBillingId(project.billingAddress?._id || '');
    setProjectContacts(project.contacts);
    setProjectKeyContacts(project.keyContacts);
    setEditProjectVisible(true);
  }

  function handleUpdateProject () {
    const updatedProject = {
      _id: projectEditId,
      name: projectName,
      nda: projectNDA,
      billingAddress: projectBillingId === '' ? null : billingAddresses.filter((address:any)=>address._id === projectBillingId)[0],
      contacts: projectContacts,
      keyContacts: projectKeyContacts
    }
    const projectIndex = projects.indexOf(projects.filter((e:any) => e._id === projectEditId)[0]);
    const newProjects = [...projects];
    newProjects.splice(projectIndex,1,updatedProject);
    setProjects(newProjects);
    setEditProjectVisible(false);
    setProjectName('');
    setProjectNDA(false);
    setProjectBillingId('');
    setProjectContacts([]);
    setProjectKeyContacts([]);
    setEditProjectErrStatus('');
  }
  
  async function handleAddNewContact () {
    try {
      const contactJSON = JSON.stringify(
        {
          first: contactFirst,
          last: contactLast,
          referredBy: contactReferredBy?._id || null,
          email: contactEmail,
          phone: contactPhone,
          links: contactLinks,
          notes: contactNotes
        }
      );
      const {data: newContactResponse} = await addContact({variables:{contactJSON: contactJSON}});
      const newContact = newContactResponse.addContact;
      console.log(newContact);
      setProjectContacts([...projectContacts, newContact]);
      setProjectKeyContacts([...projectKeyContacts, false]);
      await apolloClient.query({
        query: GET_CONTACTS,
        fetchPolicy: 'network-only'
      });
      setAddingNewContact(false);
      setNewContactErrStatus('');
      setContactFirst('');
      setContactLast('');
      setContactReferredBy(null);
      setContactEmail('');
      setContactPhone('');
      setContactLinks('');
      setContactNotes('');
    } catch (err:any) {
      setNewContactErrStatus(err.message);
    }
    
  }
  
  function handleAddExistingContact () {
    setAddingExistingContact(false);
    setProjectContacts([...projectContacts, contactSelected]);
    setProjectKeyContacts([...projectKeyContacts, false]);
    setContactSearch('');
    setContactSelected(null);
    console.log([...projectContacts, contactSelected]);
  }

  function handleShowEditContact (contact:any) {
    setContactEditId(contact._id);
    setContactFirst(contact.first);
    setContactLast(contact.last);
    setContactReferredBy(contact.referredBy);
    setContactEmail(contact.email);
    setContactPhone(contact.phone);
    setContactLinks(contact.links);
    setContactNotes(contact.notes);
    setEditingExistingContact(true);
  }

  async function handleUpdateContact () {
    try {
      const contactJSON = JSON.stringify(
        {
          first: contactFirst,
          last: contactLast,
          referredBy: contactReferredBy?._id || null,
          email: contactEmail,
          phone: contactPhone,
          links: contactLinks,
          notes: contactNotes
        }
      );
      const {data: updatedContactResponse} = await updateContact({variables:{
        contactId: contactEditId,
        contactJSON: contactJSON
      }});
      const updatedContact = updatedContactResponse.updateContact;
      // setProjectContacts([...projectContacts, newContact]);
      // setProjectKeyContacts([...projectKeyContacts, false]);
      console.log('projectContacts',projectContacts)
      const contactIndex = projectContacts.indexOf(projectContacts.filter((e:any) => e._id === updatedContact._id)[0]);
      const newContacts = [...projectContacts];
      newContacts.splice(contactIndex,1,updatedContact);
      setProjectContacts(newContacts);
      await apolloClient.query({
        query: GET_CONTACTS,
        fetchPolicy: 'network-only'
      });
      setEditingExistingContact(false);
      setEditContactErrStatus('');
      setContactFirst('');
      setContactLast('');
      setContactReferredBy(null);
      setContactEmail('');
      setContactPhone('');
      setContactLinks('');
      setContactNotes('');
    } catch (err:any) {
      setEditContactErrStatus(JSON.stringify(err));
    }
  }

  async function handleSaveChanges () {
    try {
      console.log('Billing Addresses',billingAddresses);
      console.log('Projects',projects);
      const clientJSON = JSON.stringify({
        name: clientName,
        accountType: clientAccountType,
        billingAddresses: billingAddresses.map((address:any) => address._id),
        projects: projects,
        website: clientWebsite,
        referredBy: clientReferredBy || null
      });
      await updateClient({
        variables: {
          clientId: props.clientId,
          clientJSON: clientJSON
        }
      });
      await apolloClient.query({
        query: GET_CLIENTS,
        fetchPolicy: 'network-only'
      });
      await apolloClient.query({
        query: GET_CLIENT,
        variables: {clientId: props.clientId},
        fetchPolicy: 'network-only'
      });
      router.push('/clients');
    } catch (err:any) {
      setMainErrStatus(JSON.stringify(err))
    }
  }

  return (
    <>
      <Navbar />
      {/* <div className='mt-4'>
        <Link className='std-link ml-4' href='/clients'>&larr; Back</Link>
      </div> */}
      <main className='flex flex-col px-4'>
        <div className='flex flex-col mt-4 bg-secondary/20 border border-secondary/80 rounded-lg p-4'>
          <h5>Client Details:</h5>
          <div>
            
          </div>
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
                    <input className='std-input w-full' value={clientName} onChange={(e)=>setClientName(e.target.value)} />
                  </td>
                </tr>
                {/* Client Code */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Code</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <input className='std-input w-full text-[#888]' value={client.code} disabled />
                  </td>
                </tr>
                {/* Account Type */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Account Type</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <select className='std-input w-full' value={clientAccountType} onChange={(e)=>setClientAccountType(e.target.value)}>
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
                    <div className='flex items-center gap-2'>
                      <select className='std-input w-full' value={billingSelectedId} onChange={(e)=>{setBillingSelectedId(e.target.value)}}>
                        <>
                          <option value=''>-- Select to View --</option>
                          { billingAddresses.map((address:any,index:number) => (
                            <option key={`address-${index}`} value={address._id}>
                              {address.identifier}
                            </option>
                          ))}
                        </>
                      </select>
                      <button className='std-button-lite flex items-center gap-2' onClick={()=>setNewBillingAddressVisible(true)}>
                        <FontAwesomeIcon icon={faPlus} />
                        <div>Add</div>
                      </button>
                    </div>
                    
                    <div className='py-2'>
                      {billingAddresses.length > 0 ?(
                        <>
                          <div className='flex gap-2'> 
                            { billingSelected && (
                              <>
                                <div>
                                  <button className='std-button-lite' onClick={handleShowEditBillingAddress}>
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                </div>
                                <div>
                                  <div>{`${billingSelected?.entityName || '(no entity name specified)'}`}</div>
                                  <div>{`${billingSelected?.addressLine1 || '(no address lines specified)'}`}</div>
                                  <div>{`${billingSelected?.addressLine2 || ''}`}</div>
                                  <div>{`${(billingSelected.city) ? `${billingSelected.city ? billingSelected.city : '(no city)'}, ${billingSelected.stateProvince || '(no state/province specified)'} ${billingSelected.postalCode || '(no postal code specified)'}` : ''}`}</div>
                                  <div>{`${billingSelected?.country || '(no country specified)'}`}</div>
                                </div>
                              </>
                            )}
                          </div>
                        </>
                      ):(
                        <div className='italic'>
                          No addresses on file.
                        </div>
                      )}
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
                        {projects.length > 0 ? (
                          <>
                          {projects.map((project:any, index:number) => (
                            <tr key={`project-${index}`}>
                              <td className='bg-white/50 border border-secondary/80 p-1'>
                                {project.name}
                              </td>
                              <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                                <div className='flex items-center gap-2 w-full justify-center'>
                                  <button className='std-button-lite' onClick={()=>handleShowEditProject(project)}>
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  <button className='danger-button-lite' onClick={()=>{setProjects(projects.filter((prevProject:any)=>project._id !== prevProject._id));}}>
                                    <FontAwesomeIcon icon={faTrashAlt} />
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
                                No projects on file.
                              </td>
                            </tr>
                          </>
                          
                        )}
                      </tbody>
                    </table>
                    <div className='p-1'>
                      <button className='std-button-lite flex items-center gap-2' onClick={() => setNewProjectVisible(true)}>
                        <FontAwesomeIcon icon={faPlus} />
                        <div>Add</div>
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Client Website */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Website URL</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <input className='std-input w-full' value={clientWebsite} onChange={(e)=>setClientWebsite(e.target.value)} />
                  </td>
                </tr>
                {/* Client Referred By */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Referred By</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <select className='std-input w-full' value={clientReferredBy} onChange={(e) => setClientReferredBy(e.target.value)}>
                      <option value=''>N/A</option>
                      {contacts?.length > 0 && (
                        <>
                          {contacts.map((contact:any,index:number) => (
                            <option value={contact._id} key={`contact-${index}`}>{`${contact.first} ${contact.last}`}</option>
                          ))}
                        </>
                      )}
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className='flex items-center justify-between gap-2 pt-4'>
              <div className='text-[#800]'>{mainErrStatus}</div>
              <div className='flex items-center gap-2'>
                <Link href={'/clients'} className='secondary-button-lite'>Back</Link>
                <button className='std-button-lite' onClick={handleSaveChanges}>Save Changes</button>
              </div>
              
            </div>
        </div>
      </main>
      <section className={`fixed ${(newBillingAddressVisible || editBillingAddressVisible) ? `grid` : `hidden`} grid-cols-12 items-start pt-[5vh] bg-black/50 w-screen h-screen top-0 left-0`}>
        <section className='flex bg-white rounded-lg p-0 col-start-2 col-span-10 md:col-start-3 md:col-span-8 lg:col-start-4 lg:col-span-6'>
          <section className='flex flex-col p-4 bg-secondary/20 rounded-lg w-full gap-2'>
            <h5>Add Billing Address</h5>
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
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold'><div>Label</div><div className='font-normal italic text-[12px]'>(Internal Use)</div></td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <input className='std-input w-full' value={billingIdentifier} onChange={(e)=>setBillingIdentifier(e.target.value)} />
                  </td>
                </tr>
                {/* Billing Name */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Name</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <input className='std-input w-full' value={billingName} onChange={(e)=>setBillingName(e.target.value)} />
                  </td>
                </tr>
                {/* Billing Address Line 1 */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Address Line 1</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <input className='std-input w-full' value={billingLine1} onChange={(e)=>setBillingLine1(e.target.value)} />
                  </td>
                </tr>
                {/* Billing Address Line 2 */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Address Line 2</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <input className='std-input w-full' value={billingLine2} onChange={(e)=>setBillingLine2(e.target.value)} />
                  </td>
                </tr>
                {/* Billing City */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>City</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <input className='std-input w-full' value={billingCity} onChange={(e)=>setBillingCity(e.target.value)} />
                  </td>
                </tr>
                {/* Billing State/Province */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>State/Province</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <input className='std-input w-full' value={billingStateProvince} onChange={(e)=>setBillingStateProvince(e.target.value)} />
                  </td>
                </tr>
                {/* Billing Postal Code */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Postal Code</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <input className='std-input w-full' value={billingPostalCode} onChange={(e)=>setBillingPostalCode(e.target.value)} />
                  </td>
                </tr>
                {/* Billing Country */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Country</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <input className='std-input w-full' value={billingCountry} onChange={(e)=>setBillingCountry(e.target.value)} />
                  </td>
                </tr>
              </tbody>
            </table>
            { newBillingAddressVisible && (
              <>
                <div className='flex gap-2'>
                  <button className='secondary-button-lite flex-grow' onClick={() => {setNewBillingAddressVisible(false);setBillingIdentifier('');setBillingName('');setBillingLine1('');setBillingLine2('');setBillingCity('');setBillingStateProvince('');setBillingCountry('');setBillingPostalCode('');}}>
                    Cancel
                  </button>
                  <button className='std-button-lite flex-grow' onClick={handleAddBillingAddress}>
                    Add Address
                  </button>
                </div>
                <div className='text-[#800]'>{newBillingAddressErrStatus}</div>
              </>
            )}
            { editBillingAddressVisible && (
              <>
                <div className='flex gap-2'>
                  <button className='secondary-button-lite flex-grow' onClick={() => {setEditBillingAddressVisible(false);setBillingIdentifier('');setBillingName('');setBillingLine1('');setBillingLine2('');setBillingCity('');setBillingStateProvince('');setBillingCountry('');setBillingPostalCode('');}}>
                    Cancel
                  </button>
                  <button className='std-button-lite flex-grow' onClick={handleUpdateBillingAddress}>
                    Update Address
                  </button>
                </div>
                <div className='text-[#800]'>{newBillingAddressErrStatus}</div>
              </>
            )}
          </section>
        </section>
      </section>
      <section className={`fixed ${(newProjectVisible || editProjectVisible) ? `grid` : `hidden`} grid-cols-12 items-start pt-[5vh] bg-black/50 w-screen h-screen top-0 left-0`}>
        <section className='flex bg-white rounded-lg p-0 col-start-2 col-span-10 md:col-start-3 md:col-span-8 lg:col-start-4 lg:col-span-6'>
          <section className='flex flex-col p-4 bg-secondary/20 rounded-lg w-full gap-2'>
            { (!addingNewContact && !addingExistingContact && !editingExistingContact) && (
            <>
            <h5>{newProjectVisible ? `Add Project` : `Edit Project Details`}</h5>
            <table className='w-full text-left border-collapse'>
            <thead>
              <tr>
                <th className='w-[20%]'></th>
                <th className='w-[80%]'></th>
              </tr>
            </thead>
              <tbody>
                {/* Project Name */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Name</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <input className='std-input w-full' value={projectName} onChange={(e)=>setProjectName(e.target.value)} />
                  </td>
                </tr>
                {/* Project NDA */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>NDA Signed?</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <label className='form-control cursor-pointer'>
                    <input type='checkbox' checked={projectNDA} onChange={(e)=>setProjectNDA(e.target.checked)} />
                    
                    </label>
                  </td>
                </tr>
                {/* Project Billing */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Billing</td>
                  <td className='bg-white/50 border border-secondary/80 p-2'>
                    <div className='flex items-center gap-2'>
                      <select className='std-input w-full' value={projectBillingId} onChange={(e) => setProjectBillingId(e.target.value)}>
                        <option value=''>N/A</option>
                        {billingAddresses.map((address:any, index:number) => (
                          <option key={`address-${index}`} value={address._id}>
                            {address.identifier}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
                {/* Project Contacts */}
                <tr>
                <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Contacts</td>
                  <td className='bg-white/50 border border-secondary/80 p-2'>
                    <table className='w-full text-left border-collapse my-2'>
                      <thead>
                        <tr>
                          <th className='w-[60%]'>Name</th>
                          <th className='w-[10%]'>Key</th>
                          <th className='w-[30%]'>Options</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectContacts?.length > 0 ? (
                          <>
                          {projectContacts.map((contact:any,index:number) => (
                            <tr key={`contact-${index}`}>
                              <td className='bg-white/50 border border-secondary/80 p-1'>
                                {`${contact.first} ${contact.last}`}
                              </td>
                              <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                                <label className='form-control cursor-pointer'>
                                  <input type='checkbox' checked={projectKeyContacts[index]} onChange={()=>{
                                    
                                    console.log('key contacts',projectKeyContacts)
                                    const newKeyContacts = [...projectKeyContacts];
                                    newKeyContacts.splice(index,1,!projectKeyContacts[index]);
                                    console.log("new key contacts: ",newKeyContacts)
                                    setProjectKeyContacts(newKeyContacts);
                                  }} />
                                </label>
                              </td>
                              <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                                <div className='flex items-center gap-2 w-full justify-center'>
                                  <button className='std-button-lite' onClick={()=>handleShowEditContact(contact)}>
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  <button className='danger-button-lite' onClick={()=>{setProjectContacts(projectContacts.filter((prevContact:any)=>contact._id !== prevContact._id));}}>
                                    <FontAwesomeIcon icon={faUserMinus} />
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
                                No contacts on file.
                              </td>
                            </tr>
                          </>
                          
                        )}
                      </tbody>
                    </table>
                    <div className='p-1 flex gap-2'>
                      <button className='std-button-lite flex items-center gap-2' onClick={() => setAddingNewContact(true)}>
                        <FontAwesomeIcon icon={faPlus} />
                        <div>Add New</div>
                      </button>
                      <button className='std-button-lite flex items-center gap-2' onClick={() => setAddingExistingContact(true)}>
                        <FontAwesomeIcon icon={faUserGroup} />
                        <div>Add Existing</div>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            { newProjectVisible && (
              <>
                <div className='flex gap-2'>
                  <button className='secondary-button-lite flex-grow' onClick={() => {setNewProjectVisible(false);setProjectName('');setProjectNDA(false);setProjectBillingId('');setProjectContacts([]);setProjectKeyContacts([]);setNewProjectErrStatus('');}}>
                    Cancel
                  </button>
                  <button className='std-button-lite flex-grow' onClick={handleAddProject}>
                    Add Project
                  </button>
                </div>
                <div className='text-[#800]'>{newProjectErrStatus}</div>
              </>
            )}
            { editProjectVisible && (
              <>
                <div className='flex gap-2'>
                  <button className='secondary-button-lite flex-grow' onClick={() => {setEditProjectVisible(false);setProjectName('');setProjectNDA(false);setProjectBillingId('');setProjectContacts([]);setProjectKeyContacts([]);setEditProjectErrStatus('');}}>
                    Cancel
                  </button>
                  <button className='std-button-lite flex-grow' onClick={handleUpdateProject}>
                    Save Changes
                  </button>
                </div>
                <div className='text-[#800]'>{editProjectErrStatus}</div>
              </>
            )}
            
          </>
            )}
            {(addingNewContact || editingExistingContact) && (
              <>
                <h5>{ addingNewContact ? `Create / Add New Contact` : `Edit Contact Details`}</h5>
                <ContactNew 
                  first={contactFirst}
                  last={contactLast}
                  referred={contactReferredBy}
                  email={contactEmail}
                  phone={contactPhone}
                  links={contactLinks}
                  notes={contactNotes}
                  contacts={contacts}
                  setFirst={setContactFirst}
                  setLast={setContactLast}
                  setReferred={setContactReferredBy}
                  setEmail={setContactEmail}
                  setPhone={setContactPhone}
                  setLinks={setContactLinks}
                  setNotes={setContactNotes}
                />
                { addingNewContact && (
                  <>
                    <div className='flex gap-2'>
                      <button className='secondary-button-lite flex-grow' onClick={() => {setAddingNewContact(false);setNewContactErrStatus('');setContactFirst('');setContactLast('');setContactReferredBy(null);setContactEmail('');setContactPhone('');setContactLinks('');setContactNotes('');}}>
                        Cancel
                      </button>
                      <button className='std-button-lite flex-grow' onClick={handleAddNewContact}>
                        Create New Contact
                      </button>
                    </div>
                    <div className='text-[#800]'>{newContactErrStatus}</div>
                  </>
                )}
                { editingExistingContact && (
                  <>
                    <div className='flex gap-2'>
                      <button className='secondary-button-lite flex-grow' onClick={() => {setEditingExistingContact(false);setEditContactErrStatus('');setContactFirst('');setContactLast('');setContactReferredBy(null);setContactEmail('');setContactPhone('');setContactLinks('');setContactNotes('');}}>
                        Cancel
                      </button>
                      <button className='std-button-lite flex-grow' onClick={handleUpdateContact}>
                        Save Changes
                      </button>
                    </div>
                    <div className='text-[#800]'>{editContactErrStatus}</div>
                  </>
                )}
                
              </>
            )}
            {addingExistingContact && (
              <>
                <h5>Add Existing Contact</h5>
                <ContactSearch 
                  contacts={contacts}
                  addedContacts={projectContacts}
                  contactSearch={contactSearch}
                  contactSelected={contactSelected}
                  setContactSearch={setContactSearch}
                  setContactSelected={setContactSelected}
                />
                <div className='flex gap-2'>
                  <button className='secondary-button-lite flex-grow' onClick={() => {setAddingExistingContact(false);setContactSearch('');setContactSelected(null)}}>
                    Cancel
                  </button>
                  <button className='std-button-lite flex-grow' disabled={contactSelected === null} onClick={handleAddExistingContact}>
                    Add Contact
                  </button>
                </div>
                <div className='text-[#800]'>{newProjectErrStatus}</div>
              </>
            )}

          </section>
        </section>
      </section>
    </>
  );

}