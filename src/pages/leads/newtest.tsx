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
          "extensible": section.extensible,
          "fields": section.fields.map( (field:any) => {
            return {
              "name" : field.name,
              "type" : field.type,
              "extensible" : field.extensible,
              "data" : ''
            }
          })
        };
      }),
    } : null);
  },[templateObject]);

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

  function handleUpdateLeadInputField(e:ChangeEvent<HTMLInputElement>,sectionIndex:number,fieldIndex:number,type:string) {
    const newContent = {...content};
    if (type === 'checkbox') newContent.sections[sectionIndex].fields[fieldIndex].data = e.target.checked;
    else newContent.sections[sectionIndex].fields[fieldIndex].data = e.target.value;
    setContent(newContent);
  }

  function handleUpdateLeadTextArea(e:ChangeEvent<HTMLTextAreaElement>,sectionIndex:number,fieldIndex:number,type:string) {
    const newContent = {...content};
    newContent.sections[sectionIndex].fields[fieldIndex].data = e.target.value;
    setContent(newContent);
  }

  function handleAddExtensibleField(e:any,sectionIndex:number, fieldIndex:number) {
    e.preventDefault();
    const newField = {
      ...content.sections[sectionIndex].fields[fieldIndex], 
      index: content.sections[sectionIndex].fields[fieldIndex].index+1,
      data: ''
    };
    const newContent = {...content};
    newContent.sections[sectionIndex].fields.push(newField);
    setContent(newContent);
  }

  function handleDeleteExtensibleField(e:any, sectionIndex: number, fieldIndex: number) {
    e.preventDefault();
    const newContent = {...content};
    newContent.sections[sectionIndex].fields.splice(fieldIndex,1);
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
      { status === 'authenticated' && session.user.role === 'admin' ?
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
              <div className='flex flex-col border border-black rounded-md justify-center p-4 mt-2 mb-4'>
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
                <div className='flex border border-black rounded-md items-center p-4 mt-2 mb-4'>
                  <div className='mr-2'>Client:</div>
                  <div>{client}</div>
                </div>
                {content.sections.map( (section:any, sectionIndex:number) => (
                  <>
                    <div className='mr-2 font-bold'>{section.name}:</div>
                    <div className='flex flex-col border border-black rounded-md p-4 mt-2 mb-4 gap-2'>
                      {section.fields.map( (field:any, fieldIndex:number) => (
                        <>
                          {field.type === 'textarea' && (
                            <>
                              <div className='flex flex-col gap-2'>
                                { section.fields.length > 1 &&
                                  <div className='font-bold'>{field.name}:</div>
                                }
                                <textarea className='resize-none std-input w-full h-[100px]' value={field.data} onChange={(e) => handleUpdateLeadTextArea(e, sectionIndex, fieldIndex, field.type)} />
                              </div>
                            </>
                          )}
                          {field.type === 'input' && (
                            <>
                              <div className='flex items-center gap-2'>
                                { section.fields.length > 1 && !field.extensible &&
                                  <div className='font-bold'>{field.name}:</div>
                                }
                                { field.extensible &&
                                  <div className='font-bold'>{field.name} {section.fields.indexOf(field)+1}:</div>
                                }
                                <input type='text' className='std-input flex-grow' value={field.data} onChange={(e) => handleUpdateLeadInputField(e, sectionIndex, fieldIndex, field.type)} />
                                { field.extensible && fieldIndex > 0 &&
                                  <>
                                  <button className='secondary-button-lite' onClick={(e) => handleDeleteExtensibleField(e, sectionIndex, fieldIndex)}><FontAwesomeIcon icon={faX}/></button>
                                  </>
                                }
                              </div>
                            </>
                          )}
                          {field.type === 'checkbox' && (
                            <>
                              <label className='form-control'>
                              <input name='humanHeart' type='checkbox' checked={field.data} onChange={(e) => handleUpdateLeadInputField(e, sectionIndex, fieldIndex, field.type)}></input>
                              {field.name}
                              </label>
                            </>
                          )}
                          {field.extensible && section.fields.indexOf(field) == section.fields.length-1 &&
                            <>
                            <div className='flex'>
                              <button className='std-button-lite' onClick={(e) => handleAddExtensibleField(e, sectionIndex, fieldIndex)}>Add</button>
                            </div>
                            </>
                          }
                        </>
                      ))}
                    </div>
                  </>
                ))}

                {/* <section>
                  <div className='mr-2 font-bold'>Sponsor Information:</div>
                  <div className='flex border border-black rounded-md items-center p-4 mt-2 mb-4'>
                    <div className='mr-2'>Client:</div>
                    <div>{client}</div>
                  </div>
                </section>
                <section>
                  <div className='mr-2 font-bold'>Purpose of Study:</div>
                  <div className='flex border border-black rounded-md items-center p-4 mt-2 mb-4'>
                    <textarea className='resize-none std-input w-full h-[100px]' value={purpose} onChange={(e)=>setPurpose(e.target.value)} />
                  </div>
                </section>
                <section>
                  <div className='mr-2 font-bold'>Endpoints:</div>
                  <div className='flex flex-col border border-black rounded-md justify-center p-4 mt-2 mb-4'>
                  <table className='whitespace-nowrap'>
                      <thead>
                        <tr>
                        <th></th>
                        <th className='w-full'></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div className='pr-2'>Primary Endpoint:</div>
                          </td>
                          <td>
                            <input type='text' className='std-input w-full mb-2' name='leadName' value={endpoints.primary} onChange={(e) => setEndpoints({...endpoints, primary: e.target.value})} />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className='pr-2'>Secondary Endpoint:</div>
                          </td>
                          <td>
                            <input type='text' className='std-input w-full mb-2' name='leadName' value={endpoints.secondary} onChange={(e) => setEndpoints({...endpoints, secondary: e.target.value})} />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className='pr-2'>Tertiary Endpoint:</div>
                          </td>
                          <td>
                            <input type='text' className='std-input w-full mb-2' name='leadName' value={endpoints.tertiary} onChange={(e) => setEndpoints({...endpoints, tertiary: e.target.value})} />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
                <section>
                  <div className='mr-2 font-bold'>Test Article Information:</div>
                  <div className='flex flex-col border border-black rounded-md justify-center p-4 mt-2 mb-4'>
                    <table className='whitespace-nowrap'>
                      <thead>
                        <tr>
                        <th></th>
                        <th className='w-full'></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className='pr-2 align-top'>
                            Description:
                          </td>
                          <td>
                            <textarea className='std-input resize-none w-full mb-1 h-[100px]' value={testArticleInfo.description} onChange={(e) => setTestArticleInfo({...testArticleInfo, description: e.target.value})} />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className='pr-2'>Size:</div>
                          </td>
                          <td>
                            <input type='text' className='std-input mb-2' value={testArticleInfo.size} onChange={(e) => setTestArticleInfo({...testArticleInfo, size: e.target.value})} />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className='pr-2'>Concentration:</div>
                          </td>
                          <td>
                            <input type='text' className='std-input mb-2' value={testArticleInfo.concentration} onChange={(e) => setTestArticleInfo({...testArticleInfo, concentration: e.target.value})} />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
                <section>
                  <div className='mr-2 font-bold'>Control Article Information:</div>
                  <div className='flex flex-col border border-black rounded-md justify-center p-4 mt-2 mb-4'>
                  <table className='whitespace-nowrap'>
                      <thead>
                        <tr>
                        <th></th>
                        <th className='w-full'></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className='pr-2 align-top'>
                            Description:
                          </td>
                          <td>
                            <textarea className='std-input resize-none w-full mb-1 h-[100px]' value={controlArticleInfo.description} onChange={(e) => setControlArticleInfo({...controlArticleInfo, description: e.target.value})}/>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className='pr-2'>Size:</div>
                          </td>
                          <td>
                            <input type='text' className='std-input mb-2' value={controlArticleInfo.size} onChange={(e) => setControlArticleInfo({...controlArticleInfo, size: e.target.value})} />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className='pr-2'>Concentration:</div>
                          </td>
                          <td>
                            <input type='text' className='std-input mb-2' value={controlArticleInfo.concentration} onChange={(e) => setControlArticleInfo({...controlArticleInfo, concentration: e.target.value})} />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
                <section>
                  <div className='mr-2 font-bold'>Ancillary Product(s) Information:</div>
                  <div className='flex flex-col border border-black rounded-md justify-center p-4 mt-2 mb-4'>
                  <table className='whitespace-nowrap'>
                      <thead>
                      <tr>
                        <th></th>
                        <th className='w-full'></th>
                      </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className='pr-2 align-top'>
                            Description:
                          </td>
                          <td>
                            <textarea className='std-input resize-none w-full mb-1 h-[100px]' value={ancillaryProductInfo.description} onChange={(e) => setAncillaryProductInfo({...ancillaryProductInfo, description: e.target.value})} />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className='pr-2'>Size:</div>
                          </td>
                          <td>
                            <input type='text' className='std-input mb-2' value={ancillaryProductInfo.size} onChange={(e) => setAncillaryProductInfo({...ancillaryProductInfo, size: e.target.value})} />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className='pr-2'>Concentration:</div>
                          </td>
                          <td>
                            <input type='text' className='std-input mb-2' value={ancillaryProductInfo.concentration} onChange={(e) => setAncillaryProductInfo({...ancillaryProductInfo, concentration: e.target.value})} />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
                <section>
                  <div className='mr-2 font-bold'>Test System Information:</div>
                  <div className='flex flex-col border border-black rounded-md justify-center p-4 mt-2 mb-4'>
                    <table className='whitespace-nowrap border-separate border-spacing-1'>
                      <thead>
                      <tr>
                        <th></th>
                        <th className='w-[33%]'></th>
                        <th className='w-[33%]'></th>
                        <th className='w-[33%]'></th>
                      </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className='pr-2 align-top'>
                            Type:
                          </td>
                          <td className='visible-cell'>
                            <label className='form-control'>
                              <input name='animalHeart' type='checkbox' checked={testSystemInfo.type.animalHeart} onChange={handleTestSystemUpdate}></input>
                              Animal Heart
                            </label>
                          </td>
                          <td className='visible-cell'>
                            <label className='form-control'>
                              <input name='humanHeart' type='checkbox' checked={testSystemInfo.type.humanHeart} onChange={handleTestSystemUpdate}></input>
                              Human Heart
                            </label>
                          </td>
                          <td className='visible-cell'>
                            <label className='form-control'>
                              <input name='humanCadaver' type='checkbox' checked={testSystemInfo.type.humanCadaver} onChange={handleTestSystemUpdate}></input>
                              Human Cadaver
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td className='pr-2 align-top'>
                            Specs:
                          </td>
                          <td className='visible-cell align-top'>
                            <label className='form-control'>
                              <input name='antelope' type='checkbox' checked={testSystemInfo.specs.animalHeartSpecs.antelope} onChange={handleTestSystemUpdate}></input>
                              Antelope
                            </label>
                            <label className='form-control'>
                              <input name='cow' type='checkbox' checked={testSystemInfo.specs.animalHeartSpecs.cow} onChange={handleTestSystemUpdate}></input>
                              Cow
                            </label>
                            <label className='form-control'>
                              <input name='elk' type='checkbox' checked={testSystemInfo.specs.animalHeartSpecs.elk} onChange={handleTestSystemUpdate}></input>
                              Elk
                            </label>
                            <label className='form-control'>
                              <input name='pig' type='checkbox' checked={testSystemInfo.specs.animalHeartSpecs.pig} onChange={handleTestSystemUpdate}></input>
                              Pig
                            </label>
                          </td>
                          <td className='visible-cell flex-col align-top'>
                            <label className='form-control'>
                              <input name='fresh' type='checkbox' checked={testSystemInfo.specs.humanHeartSpecs.fresh} onChange={handleTestSystemUpdate}></input>
                              Fresh
                            </label>
                            <label className='form-control'>
                              <input name='mrosourced' type='checkbox' checked={testSystemInfo.specs.humanHeartSpecs.MROSourced} onChange={handleTestSystemUpdate}></input>
                              MRO Sourced
                            </label>
                          </td>
                          <td className='visible-cell flex-col align-top'>
                            <label className='form-control'>
                              <input name='full' type='checkbox' checked={testSystemInfo.specs.humanCadaverSpecs.full} onChange={handleTestSystemUpdate}></input>
                              Full
                            </label>
                            <label className='form-control'>
                              <input name='torso' type='checkbox' checked={testSystemInfo.specs.humanCadaverSpecs.torso} onChange={handleTestSystemUpdate}></input>
                              Torso
                            </label>
                            <label className='form-control'>
                              <input name='leg' type='checkbox' checked={testSystemInfo.specs.humanCadaverSpecs.leg} onChange={handleTestSystemUpdate}></input>
                              Leg
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td className='pr-2 align-top'>Quantity Requested:</td>
                          <td className='visible-cell'>
                            <textarea name='animalHeartQuantity' className='std-input resize-none w-full h-[100px]' value={testSystemInfo.quantity.animalHeartQuantity} onChange={handleTestSystemUpdate} />
                          </td>
                          <td className='visible-cell'>
                            <textarea name='humanHeartQuantity' className='std-input resize-none w-full h-[100px]' value={testSystemInfo.quantity.humanHeartQuantity} onChange={handleTestSystemUpdate} />
                          </td>
                          <td className='visible-cell'>
                            <textarea name='humanCadaverQuantity' className='std-input resize-none w-full h-[100px]' value={testSystemInfo.quantity.humanCadaverQuantity} onChange={handleTestSystemUpdate} />
                          </td>
                        </tr>
                        
                        
                      </tbody>
                    </table>
                  </div>
                </section>
                <section>
                  <div className='mr-2 font-bold'>Methods:</div>
                  <div className='flex flex-col border border-black rounded-md justify-center p-4 mt-2 mb-4'>
                  <table className='whitespace-nowrap'>
                      <thead>
                      <tr>
                        <th></th>
                        <th className='w-full'></th>
                      </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div className='pr-2'>Surgical / Vascular Access Points:</div>
                          </td>
                          <td>
                            <input type='text' className='std-input w-full mb-2' value={methods.surgical} onChange={(e) => setMethods({...methods, surgical: e.target.value})} />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className='pr-2'>Imaging: Types and Locations:</div>
                          </td>
                          <td>
                            <input type='text' className='std-input w-full mb-2' value={methods.imaging} onChange={(e) => setMethods({...methods, imaging: e.target.value})} />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className='pr-2'>Fluid Flow Parameters Required:</div>
                          </td>
                          <td>
                            <input type='text' className='std-input w-full mb-2' value={methods.flow} onChange={(e) => setMethods({...methods, flow: e.target.value})} />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
                <section>
                  <div className='mr-2 font-bold'>Special Instructions:</div>
                  <div className='flex border border-black rounded-md items-center p-4 mt-2 mb-4'>
                    <textarea className='std-input resize-none h-[150px] w-full' value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} />
                  </div>
                </section> */}

              </form>
              <div className='flex gap-2'>
                <button className='std-button' onClick={() => handleChangeStep(-1)}>Back</button>
                <button className='std-button' onClick={() => handleChangeStep(1)}>Next</button>
                {/* <button className='std-button' onClick={() => console.log(JSON.stringify(content))}>Test Content</button> */}
              </div>
              {/* <button className='std-button' onClick={handleSubmitNewStudy}>Submit</button> */}
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