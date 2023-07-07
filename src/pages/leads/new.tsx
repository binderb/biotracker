import Navbar from "@/components/Navbar";
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { initializeApollo, addApolloState } from "../../../utils/apolloClient";
import { GET_CLIENTS, GET_LEAD_TEMPLATES, GET_LEAD_TEMPLATE_LATEST, GET_USERS } from "@/utils/queries";
import { useSession } from "next-auth/react";
import { ChangeEvent, MouseEventHandler, useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ADD_NEW_LEAD } from "@/utils/mutations";
import { useRouter } from "next/router";

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
  await apolloClient.query({
    query: GET_CLIENTS,
  });
  await apolloClient.query({
    query: GET_LEAD_TEMPLATES,
  });
  await apolloClient.query({
    query: GET_USERS,
  });

  return addApolloState(apolloClient, {
    props: {
      session,
    },
  });

}


export default function NewLead () {

  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: clientData } = useQuery(GET_CLIENTS);
  const clients = clientData.getClients;
  const { data: userData } = useQuery(GET_USERS);
  const users = userData.getUsers;
  const [creatorStep, setCreatorStep] = useState(1);
  const [errStatus, setErrStatus] = useState('');
  const [client, setClient] = useState('');
  const [leadName, setLeadName] = useState('');
  const [drafterToAdd, setDrafterToAdd] = useState('');
  const initialDrafters = session ? [session.user] : [];
  const [drafterList, setDrafterList] = useState(initialDrafters);
  const [addNewLead, { error, data: addNewLeadData }] = useMutation(ADD_NEW_LEAD);
  const { data: templateData } = useQuery(GET_LEAD_TEMPLATES);
  const templates = templateData.getLeadTemplates;
  const [currentTemplate, setCurrentTemplate] = useState('');
  const [firstNote, setFirstNote] = useState('');
  const { data: currentTemplateData } = useQuery(GET_LEAD_TEMPLATE_LATEST, {
    variables: {
      getLeadTemplateLatestRevisionId: currentTemplate
    }
  });
  const templateObject = currentTemplateData?.getLeadTemplateLatestRevision;
  const [content, setContent] = useState<any>(null);

  useEffect( () => {
    setContent(templateObject ? {
      name: templateObject.name,
      sections: templateObject.revisions[0].sections.map( (section:any) => {
        return { 
          "name": section.name,
          "index": section.index,
          "extensible": section.extensible,
          "rows": section.rows.map( (row:any) => {
            return {
              "index": row.index,
              "extensible": row.extensible,
              "fields" : row.fields.map( (field:any) => {
                return {
                  "type" : field.type,
                  "extensible" : field.extensible,
                  "params" : field.params,
                  "data" : field.data
                }
              })
            }
          })
        };
      }),
    } : null);
  },[templateObject]);

  if (status !== 'authenticated') {
    router.push('/login');
    return;
  }

  function handleUpdateLeadName (e:ChangeEvent<HTMLInputElement>) {
    setLeadName(e.target.value);
  }

  function handleClientChange (e:ChangeEvent<HTMLSelectElement>) {
    setClient(e.target.value);
  }

  function handleTemplateChange (e:ChangeEvent<HTMLSelectElement>) {
    setCurrentTemplate(e.target.value);
  }

  function handleDrafterToAddChange (e:ChangeEvent<HTMLSelectElement>) {
    setDrafterToAdd(e.target.value);
  }

  function handleAddDrafter (e:ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    const drafterObject = users.filter((user:any) => user.username === drafterToAdd)[0];
    setDrafterList([...drafterList, drafterObject]);
    setDrafterToAdd('');
  }

  function handleRemoveDrafter (username:string) {
    const newDrafterList = drafterList.filter((drafter:any) => drafter.username !== username);
    setDrafterList(newDrafterList);
  }

  function handleChangeStep (delta:number) {
    const newCreatorStep = creatorStep + delta;
    if (newCreatorStep === 1 || newCreatorStep === 2 || newCreatorStep === 3) setErrStatus('');
    if (newCreatorStep === 2 && (!client || !leadName || !currentTemplate)) {
      setErrStatus('Please select a value for all fields before proceeding!');
      return;
    }
    setCreatorStep(newCreatorStep);
  }

  function handleUpdateLeadInputField(e:ChangeEvent<HTMLInputElement>,sectionIndex:number,rowIndex:number,fieldIndex:number,dataIndex:number,type:string) {
    const newContent = {...content};
    if (type === 'checkbox' || type === 'multicheckbox') {
      const newData = [...newContent.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].data];
      newData.splice(dataIndex,1,e.target.checked);
      newContent.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].data = newData;
    } else { 
      const newData = [...newContent.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].data];
      newData.splice(dataIndex,1,e.target.value);
      newContent.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].data = newData;
    }
    setContent(newContent);
  }

  function handleUpdateLeadTextArea(e:ChangeEvent<HTMLTextAreaElement>,sectionIndex:number,rowIndex:number,fieldIndex:number,dataIndex:number,type:string) {
    const newContent = {...content};
    const newData = [...newContent.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].data];
    newData.splice(dataIndex,1,e.target.value);
    newContent.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].data = newData;
    setContent(newContent);
  }

  function handleAddExtensibleRow(e:any,sectionIndex:number,rowIndex:number) {
    e.preventDefault();
    const newRow = {
      ...content.sections[sectionIndex].rows[rowIndex], 
      index: content.sections[sectionIndex].rows[rowIndex].index+1,
      fields: [
        ...content.sections[sectionIndex].rows[rowIndex].fields.map( (field:any) => {return {...field, data: ''};})
      ]
    };
    const newContent = {...content};
    newContent.sections[sectionIndex].rows.push(newRow);
    setContent(newContent);
  }

  function handleDeleteExtensibleRow(e:any, sectionIndex: number, rowIndex: number) {
    e.preventDefault();
    const newContent = {...content};
    newContent.sections[sectionIndex].rows.splice(rowIndex,1);
    setContent(newContent);
  }

  async function handleSubmitNewLead () {
    const leadData = {
      name: leadName,
      author: session?.user.id,
      drafters: drafterList.map((drafter:any) => drafter.id || drafter._id),
      client: clients.filter((clientObject:any) => clientObject.code === client)[0]._id,
      content: JSON.stringify(content),
      firstNote: firstNote
    }
    try {
      const response = await addNewLead({
        variables: leadData
      });
      handleChangeStep(1);
    } catch (err:any) {
      setErrStatus(err.message);
    }
  }

  interface Client {
    _id: string,
    name: string,
    code: string
  }

  return (
    <>
      <Navbar/>
      <div className='mt-4'>
        <Link className='std-link ml-4' href='/leads'>&larr; Back</Link>
      </div>
      { status === 'authenticated' && (session.user.role === 'dev' || session.user.role === 'admin') ?
        <main className="flex items-top p-4">
          <div id="create-study" className='bg-secondary/20 border border-secondary/80 p-4 rounded-lg flex-grow'>
          <h5>Create New Lead</h5>
          { (creatorStep === 1) &&
            <section id='step-1'>
            <h2 className='mb-2'>Basic Setup (Step 1 of 3)</h2>
            <div className='flex items-center mb-4'>
              Choose a name for your draft lead and specify the client. The name is only used for identification on the draft dashboard, and the lead will be given a permanent ID when it is finalized and converted into a study. The client ID will be permanently associated with this draft and cannot be changed.
            </div>
            <div className='flex items-center mb-2'>
              <div className='mr-2'>Draft Name:</div>
              <input type='text' className='std-input' name='leadName' value={leadName} onChange={handleUpdateLeadName} />
            </div>
            <div className='flex items-center mb-2'>
              <div className='mr-2'>Client:</div>
              <select className='std-input mr-2' onChange={handleClientChange} value={client}>
                <option value=''>-- Choose --</option> 
                {clients.map( (client:Client) => (
                  <option value={client.code} key={client.code}>{`${client.name} - ${client.code}`}</option>  
                ))}
              </select>
              <div>Don&apos;t have a client code? <Link className='std-link' href='/client-manager'>Create one</Link> before starting this process!</div>
            </div>
            <div className='flex items-center mb-2'>
              <div className='mr-2'>Lead Template:</div>
              <select className='std-input mr-2' onChange={handleTemplateChange} value={currentTemplate}>
                <option value=''>-- Choose --</option> 
                {templates.map( (template:any) => (
                  <option value={template._id} key={template.name}>{`${template.name}`}</option>  
                ))}
              </select>
            </div>
            <div className='flex flex-col justify-center mb-2'>
              <div className='mr-2'>Who should be included in the drafting process?</div>
              <div className='flex flex-col border border-secondary rounded-md justify-center p-4 mt-2 mb-4'>
                <form
                  className="flex items-center mb-2"
                  onSubmit={handleAddDrafter}
                >
                  <div className="font-bold mr-2">Add Members:</div>
                  <button className="std-button mr-2" disabled={drafterToAdd === ''}>Add</button>
                  <select className="std-input flex-grow" onChange={handleDrafterToAddChange} value={drafterToAdd}>
                    <option value=''>-- Choose --</option>
                    { users.map((user:any) => (<option key={user.username} value={user.username} disabled={drafterList.filter((drafter:any) => drafter.username === user.username).length > 0}>
                      {`${user.first} ${user.last}`}
                    </option>))}
                  </select>
                </form>
                <div className="font-bold mb-2">Team members to be included:</div>
                <ul>
                  { drafterList.map((drafter:any) => (
                    <li key={drafter.username} className='flex justify-between items-center std-input rounded-md mb-2'>
                      <div>
                      {drafter.username === session.user.username ? `${drafter.first} ${drafter.last} (author)` : `${drafter.first} ${drafter.last}`}
                      </div>
                      <button className='secondary-button-lite' onClick={()=>handleRemoveDrafter(drafter.username)} disabled={drafter.username === session.user.username}><FontAwesomeIcon icon={faX} size='xs' /></button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <button className='std-button' onClick={() => handleChangeStep(1)}>Next</button>
            <div className='my-2 text-[#800] whitespace-pre font-mono'>{errStatus}</div>          
            </section>
          }
          { (creatorStep === 2) &&
            <section id='step-2'>
              <h2 className='mb-2'>Add Details (Step 2 of 3)</h2>
              <div className='flex items-center mb-4'>
                Use the form below to add whatever details are known about the lead. These fields can be edited later by you and your drafting team, so just include the information you currently have. 
              </div>
              <form>
                <div className='mr-2 font-bold'>Sponsor Information:</div>
                <div className='flex border border-secondary rounded-md items-center p-4 mt-2 mb-4'>
                  <div className='mr-2'>Client:</div>
                  <div>{client}</div>
                </div>
                {content.sections.map( (section:any, sectionIndex:number) => (
                  <section key={sectionIndex}>
                    <div className='mr-2 font-bold'>{section.name}:</div>
                    <div className='border border-secondary rounded-lg p-2 overflow-x-auto my-2'>
                    <table className='w-full'><tbody>
                    {section.rows.map( (row:any, rowIndex:number) => (
                      // <div key={rowIndex} className='flex gap-2 items-center'>
                      <tr key={rowIndex}>
                        {row.fields.map((field:any, fieldIndex:number) => (
                          <>
                            {field.type === 'label' && (
                              <td key={fieldIndex} className='align-top py-1'>
                                { row.fields.length > 1 && !row.extensible &&
                                  <div className='font-bold'>{field.params[0]}:</div>
                                }
                                { row.extensible &&
                                  <div className='font-bold'>{field.params[0]} {section.rows.indexOf(row)+1}:</div>
                                }
                              </td>
                            )}
                            {field.type === 'textarea' && (
                              <td className='align-middle py-1'>
                              <textarea className='resize-none std-input w-full h-[100px]' value={field.data} onChange={(e) => handleUpdateLeadTextArea(e, sectionIndex, rowIndex, fieldIndex, 0, field.type)} />
                              </td>
                            )}
                            {field.type === 'input' && (
                              <td className='flex gap-2 align-middle py-1'>
                              <input type='text' className='std-input flex-grow w-full' value={field.data} onChange={(e) => handleUpdateLeadInputField(e, sectionIndex, rowIndex, fieldIndex, 0, field.type)} />
                              {/* ROW DELETE BUTTON */}
                              { row.extensible && rowIndex > 0 &&
                                <button className='secondary-button-lite' onClick={(e) => handleDeleteExtensibleRow(e, sectionIndex, rowIndex)}><FontAwesomeIcon icon={faX}/></button>
                              }
                              {/* ROW ADD BUTTON */}
                              {row.extensible && section.rows.indexOf(row) == section.rows.length-1 &&
                                <div className='flex'>
                                  <button className='std-button-lite' onClick={(e) => handleAddExtensibleRow(e, sectionIndex, rowIndex)}>Add</button>
                                </div>
                              }
                              </td>
                              
                            )}
                            {field.type === 'checkbox' && (
                              <td className='align-middle py-1'>
                              <label className='form-control'>
                              <input type='checkbox' checked={field.data[0]} onChange={(e) => handleUpdateLeadInputField(e, sectionIndex, rowIndex, fieldIndex, 0, field.type)} />
                              {field.params[0]}
                              </label>
                              </td>
                            )}
                            {field.type === 'multicheckbox' && (
                              <td className='align-top'>
                              <div className='flex flex-col gap-2 justify-start items-start'>
                                { field.params.map( (param:string, i:number) => (
                                    <label key={i} className='form-control'>
                                    <input type='checkbox' checked={field.data[i]} onChange={(e) => handleUpdateLeadInputField(e, sectionIndex, rowIndex, fieldIndex, i, field.type)} />
                                    {param}
                                    </label>
                                ))}
                              </div>
                              </td>
                            )}
                          
                          </>
                        ))}
                        
                        </tr>
                    ))}
                    </tbody></table>
                    </div>
                  </section>
                ))}
              </form>
              <div className='flex gap-2'>
                <button className='std-button' onClick={() => handleChangeStep(-1)}>Back</button>
                <button className='std-button' onClick={() => handleChangeStep(1)}>Next</button>
              </div>
              <div className='my-2 text-[#800] whitespace-pre font-mono'>{errStatus}</div>          
            </section>
          }
          { (creatorStep === 3) &&
            <section id='step-3'>
              <h2 className='mb-2'>Start the Conversation (Step 3 of 3)</h2>
              <div className='flex items-center mb-4'>
                Add some comments below to contextualize the draft you are creating. This will start a conversation thread with your drafting team, and enter this first draft into version control so that you can always refer back to it. After submitting, other members of your team will be notified and can update this draft with their own changes and comments.
              </div>
              <div className='flex items-center mb-4'>
                Note that an official study (or studies) will NOT be created based on this draft until you (as the author) decide to finalize it.
              </div>
              <textarea className='std-input w-full resize-none h-[200px] mb-4' value={firstNote} onChange={(e) => setFirstNote(e.target.value)} />
              <button className='std-button mr-1' onClick={() => handleChangeStep(-1)}>Back</button>
              {/* <button className='std-button' onClick={() => handleChangeStep(1)}>Next</button> */}
              <button className='std-button' onClick={handleSubmitNewLead}>Submit</button>
              <div className='my-2 text-[#800] whitespace-pre font-mono'>{errStatus}</div>          
            </section>
          }
          { (creatorStep === 4) &&
            <section className='flex flex-col' id='step-4'>
              <h2 className='mb-2'>Success!</h2>
              <div className='flex items-center mb-4'>
                Your new lead <span className='font-bold mx-1'>{leadName}</span> has been created.
              </div>
              <div className='mb-4'>
                <Link className='std-button mt-4' href='/leads'>Return to Lead List</Link>
              </div>
            </section>
          }
        </div>
        </main>
        :
        <main className="flex items-top p-4">
          {`It looks like you aren't authorized to view this page (admin access only). If you think this is an error, please contact your system administrator.`}
        </main>
      }
    </>
  );
}