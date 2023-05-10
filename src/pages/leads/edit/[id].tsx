
import Navbar from "@/components/Navbar";
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]';
import { initializeApollo, addApolloState } from "../../../../utils/apolloClient";
import { GET_CLIENTS, GET_USERS, GET_LEAD_LATEST, GET_LEADS } from "@/utils/queries";
import { useSession } from "next-auth/react";
import { ChangeEvent, MouseEventHandler, useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ADD_LEAD_NOTE, ADD_LEAD_REVISION, ADD_NEW_LEAD } from "@/utils/mutations";
import { useParams } from 'next/navigation';
import DiscussionBoard from "@/components/DiscussionBoard";

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
    query: GET_LEAD_LATEST,
    variables: {
      getLeadLatestRevisionId: context.params.id
    }
  });

  return addApolloState(apolloClient, {
    props: {
      session,
      editId: context.params.id
    },
  });

}


export default function LeadManager (props:any) {

  const { data: session, status } = useSession();
  const { loading, data: leadResponseData } = useQuery(GET_LEAD_LATEST, {
    variables: {
      getLeadLatestRevisionId: props.editId
    }
  });
  const leadData = leadResponseData?.getLeadLatestRevision;
  const leadContent = JSON.parse(leadData?.revisions[0].content);
  const [errStatus, setErrStatus] = useState('');
  const [successStatus, setSuccessStatus] = useState('');
  const [client, setClient] = useState(leadData.client.code);


  const [addLeadRevision, { error: leadRevisionError, data: addLeadRevisionData }] = useMutation(ADD_LEAD_REVISION, {
    refetchQueries: [GET_LEAD_LATEST, GET_LEADS]
  });
  const [addLeadNote, { error: leadNoteError, data: addLeadNoteData }] = useMutation(ADD_LEAD_NOTE, {
    refetchQueries: [GET_LEAD_LATEST, GET_LEADS]
  });

  // Maybe make this a more generic interface in the future?
  // Like a JSON object based on a loaded template?
  const [leadStatus, setLeadStatus] = useState(leadData.status);
  const [purpose, setPurpose] = useState(leadContent.purpose);
  const [endpoints, setEndpoints] = useState(leadContent.endpoints);
  const [testArticleInfo, setTestArticleInfo] = useState(leadContent.testArticleInfo);
  const [controlArticleInfo, setControlArticleInfo] = useState(leadContent.controlArticleInfo);
  const [ancillaryProductInfo, setAncillaryProductInfo] = useState(leadContent.ancillaryProductInfo);
  const [testSystemInfo, setTestSystemInfo] = useState(leadContent.testSystemInfo);
  const [methods, setMethods] = useState(leadContent.methods);
  const [specialInstructions, setSpecialInstructions] = useState(leadContent.specialInstructions);
  const [note, setNote] = useState('');
  const [changes, setChanges] = useState(0);

  useEffect( () => {
    let changeSum = 0;
    if (leadStatus !== leadData.status) changeSum++;
    if (purpose !== leadContent.purpose) changeSum++;
    if (JSON.stringify(endpoints) !== JSON.stringify(leadContent.endpoints)) changeSum++;
    if (JSON.stringify(testArticleInfo) !== JSON.stringify(leadContent.testArticleInfo)) changeSum++;
    if (JSON.stringify(controlArticleInfo) !== JSON.stringify(leadContent.controlArticleInfo)) changeSum++;
    if (JSON.stringify(ancillaryProductInfo) !== JSON.stringify(leadContent.ancillaryProductInfo)) changeSum++;
    if (JSON.stringify(testSystemInfo) !== JSON.stringify(leadContent.testSystemInfo)) changeSum++;
    if (JSON.stringify(methods) !== JSON.stringify(leadContent.methods)) changeSum++;
    if (specialInstructions !== leadContent.specialInstructions) changeSum++;
    setChanges(changeSum);
  }, [purpose, leadContent.purpose, leadContent.endpoints, leadContent.testArticleInfo, leadContent.controlArticleInfo, leadContent.ancillaryProductInfo, leadContent.testSystemInfo, leadContent.methods, leadContent.specialInstructions, endpoints, testArticleInfo, controlArticleInfo, ancillaryProductInfo, testSystemInfo, methods, specialInstructions, leadStatus, leadData.status]);

  function handleTestSystemUpdate (e:any) {
    let newTestSystemInfo = {...testSystemInfo};
    switch (e.target.name) {
      case 'animalHeart':
        testSystemInfo.type.animalHeart = e.target.checked;
        break;
      case 'humanHeart':
        testSystemInfo.type.humanHeart = e.target.checked;
        break;
      case 'humanCadaver':
        testSystemInfo.type.humanCadaver = e.target.checked;
        break;
      case 'antelope':
        testSystemInfo.specs.animalHeartSpecs.antelope = e.target.checked;
        break;
      case 'cow':
        testSystemInfo.specs.animalHeartSpecs.cow = e.target.checked;
        break;
      case 'elk':
        testSystemInfo.specs.animalHeartSpecs.elk = e.target.checked;
        break;
      case 'pig':
        testSystemInfo.specs.animalHeartSpecs.pig = e.target.checked;
        break;
      case 'fresh':
        testSystemInfo.specs.humanHeartSpecs.fresh = e.target.checked;
        break;
      case 'mrosourced':
        testSystemInfo.specs.humanHeartSpecs.MROSourced = e.target.checked;
        break;
      case 'full':
        testSystemInfo.specs.humanCadaverSpecs.full = e.target.checked;
        break;
      case 'torso':
        testSystemInfo.specs.humanCadaverSpecs.torso = e.target.checked;
        break;
      case 'leg':
        testSystemInfo.specs.humanCadaverSpecs.leg = e.target.checked;
        break;
      case 'animalHeartQuantity':
        testSystemInfo.quantity.animalHeartQuantity = e.target.value;
        break;
      case 'humanHeartQuantity':
        testSystemInfo.quantity.humanHeartQuantity = e.target.value;
        break;
      case 'humanCadaverQuantity':
        testSystemInfo.quantity.humanCadaverQuantity = e.target.value;
        break;
      default:
        break;
    }
    setTestSystemInfo(newTestSystemInfo);
  }

  function handleRevertChanges () {
    setLeadStatus(leadData.status);
    setPurpose(leadContent.purpose);
    setEndpoints(leadContent.endpoints);
    setTestArticleInfo(leadContent.testArticleInfo);
    setControlArticleInfo(leadContent.controlArticleInfo);
    setAncillaryProductInfo(leadContent.ancillaryProductInfo);
    setTestSystemInfo(leadContent.testSystemInfo);
    setMethods(leadContent.methods);
    setSpecialInstructions(leadContent.specialInstructions);
  }

  async function handleSubmitLeadRevision () {
    if (changes === 0) {
      setSuccessStatus('');
      setErrStatus('Nothing to commit.');
      return;
    }
    if (!note.trim()) {
      setSuccessStatus('');
      setErrStatus('Please enter a comment explaining your changes.');
      return;
    }
    const leadData = {
      addLeadRevisionId: props.editId,
      status: leadStatus,
      author: session?.user.id,
      content: JSON.stringify({
        purpose: purpose,
        endpoints: endpoints,
        testArticleInfo: testArticleInfo,
        controlArticleInfo: controlArticleInfo,
        ancillaryProductInfo: ancillaryProductInfo,
        testSystemInfo: testSystemInfo,
        methods: methods,
        specialInstructions: specialInstructions
      }),
      note: note
    }
    try {
      const response = await addLeadRevision({
        variables: leadData
      });
      setNote('');
      setSuccessStatus('Draft successfully updated.');
      setErrStatus('');
    } catch (err:any) {
      setSuccessStatus('');
      setErrStatus(err.message);
    }
  }

  async function handleSubmitBareNote () {
    if (!note.trim()) {
      setErrStatus('Note field must not be empty.');
      return;
    }
    try {
      const response = await addLeadNote({
        variables: {
          addLeadNoteId: leadData._id,
          revisionId: leadData.revisions[0]._id,
          author: session?.user.id,
          note: note
        }
      });
      setNote('');
      setSuccessStatus('Note successfully posted.');
      setErrStatus('');
    } catch (err:any) {
      setSuccessStatus('');
      setErrStatus(err.message);
    }
  }

  return (
    <>
      <main className='md:h-screen overflow-x-hidden flex flex-col gap-2 pb-4'>
      <Navbar/>
      { status === 'authenticated' ?
        <>
        <div className='flex items-center'>

          <Link className='std-link ml-4 my-2' href='/leads'>&larr; Back</Link>
          <h1 className='mx-4'>Editing: {leadData.name}</h1>
        </div>
        <div className='flex justify-between items-center bg-secondaryHighlight rounded-xl p-2 mx-4 flex-grow'>
          <div className='pl-2'>
            {errStatus && 
              <div className='flex items-center gap-2 bg-[#FDD] pl-2 pr-1 py-1 rounded-md text-[#800]'>
              {errStatus}
                <button className='bg-[#800] px-2 py-[2px] rounded-md text-white text-[12px] hover:bg-[#B00]' onClick={()=>setErrStatus('')}>
                  <FontAwesomeIcon icon={faX} />
                </button>
              </div>
            }
            {successStatus && 
              <div className='flex items-center gap-2 bg-[#DFD] pl-2 pr-1 py-1 rounded-md text-[#080]'>
                {successStatus}
                <button className='bg-[#080] px-2 py-[2px] rounded-md text-white text-[12px] hover:bg-[#0B0]' onClick={()=>setSuccessStatus('')}>
                  <FontAwesomeIcon icon={faX} />
                </button>
              </div>
            }
          </div>
          <div className='flex gap-2'>
            <button className='secondary-button-lite' disabled={changes === 0} onClick={handleRevertChanges}>Revert to Saved</button>
            <button className='std-button-lite flex items-center gap-2' disabled={changes === 0} onClick={handleSubmitLeadRevision}>
              Commit Changes
            </button>
          </div>
        </div>
        <main className='max-md:flex max-md:flex-col-reverse md:grid md:grid-cols-2 xl:grid-cols-5 gap-2 px-4 overflow-y-hidden'>
          <div id="discussion" className='bg-secondaryHighlight xl:col-span-2 p-4 rounded-xl md:overflow-y-hidden h-full'>
            <h1 className='mb-2'>Discussion</h1>
            <div className='flex flex-col gap-2'>
              <div className='flex justify-between items-center'>
                <div className='font-bold'>Note:</div>
                <button className='std-button-lite' disabled={changes !== 0 || !note.trim()} onClick={handleSubmitBareNote}>Post Without Changes</button>
              </div>
              <textarea className='std-input mb-4 h-[150px] resize-none' value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div className='md:overflow-y-hidden overflow-x-visible h-[calc(100%-238px)]'>
              <div className='md:overflow-y-auto overflow-x-visible h-full pr-4'>
                <DiscussionBoard leadData={leadData} />
              </div>
            </div>
          </div>
          <div id="edit-study" className='bg-secondaryHighlight xl:col-span-3 p-4 rounded-xl md:overflow-y-hidden h-full'>
          <h1 className='mb-2'>Lead Details</h1>
            <div className='md:overflow-y-hidden h-[calc(100%-40px)]'>
              <div className='md:overflow-y-auto h-full pr-4'>
                <section id='step-1'>
                  <form>
                    <section>
                      <div className='mr-2 font-bold'>Status:</div>
                      <div className='flex border border-black rounded-md items-center p-4 mt-2 mb-4'>
                        <select className='std-input' value={leadStatus} onChange={(e) => setLeadStatus(e.target.value)}>
                          <option value='active'>Active</option>
                          <option value='inactive'>Inactive</option>
                          <option value='inactive'>Completed</option>
                        </select>
                      </div>
                    </section>
                    <section>
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
                    </section>
                  </form>
                </section>
              </div>
            </div>
        </div>
        </main>
        </>
        :
        <main className="flex items-top p-4">
          {`It looks like you aren't authorized to view this page (admin access only). If you think this is an error, please contact your system administrator.`}
        </main>
      }
      </main>
    </>
  );
}