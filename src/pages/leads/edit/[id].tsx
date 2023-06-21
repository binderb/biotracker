
import Navbar from "@/components/Navbar";
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]';
import { initializeApollo, addApolloState } from "../../../../utils/apolloClient";
import { GET_CLIENTS, GET_USERS, GET_LEAD_LATEST, GET_LEADS, GET_NEXT_STUDY } from "@/utils/queries";
import { useSession } from "next-auth/react";
import { ChangeEvent, MouseEventHandler, useEffect, useState } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import { faFlagCheckered, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ADD_LEAD_NOTE, ADD_LEAD_REVISION, ADD_NEW_LEAD, ADD_STUDY, CREATE_DRIVE_STUDY_TREE } from "@/utils/mutations";
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
  const [leadStatus, setLeadStatus] = useState(leadData.status);
  const leadContent = JSON.parse(leadData?.revisions[0].content);
  const [content, setContent] = useState(leadContent);
  const [errStatus, setErrStatus] = useState('');
  const [successStatus, setSuccessStatus] = useState('');
  const [client, setClient] = useState(leadData.client.code);
  const [addLeadRevision, { error: leadRevisionError, data: addLeadRevisionData }] = useMutation(ADD_LEAD_REVISION, {
    refetchQueries: [GET_LEAD_LATEST, GET_LEADS]
  });
  const [addLeadNote, { error: leadNoteError, data: addLeadNoteData }] = useMutation(ADD_LEAD_NOTE, {
    refetchQueries: [GET_LEAD_LATEST, GET_LEADS]
  });
  const [note, setNote] = useState('');
  const [changes, setChanges] = useState(0);
  const [publishVisible, setPublishVisible] = useState(false);
  const [publishErrStatus, setPublishErrStatus] = useState('');
  const [getNextStudy, { data: newIdData }] = useLazyQuery(GET_NEXT_STUDY, {
    fetchPolicy: 'network-only'
  });
  const [nextStudy, setNextStudy] = useState('');
  const [studyType, setStudyType] = useState('');
  const [createDriveStudyTree, { data : driveTreeResponse }] = useMutation(CREATE_DRIVE_STUDY_TREE);
  const [addStudy, { error, data : newStudyData }] = useMutation(ADD_STUDY, {
    refetchQueries: [{query: GET_NEXT_STUDY}, 'GetNextStudy']
  });
  const [completedPublish, setCompletedPublish] = useState(false);

  function handleRevertChanges () {
    setLeadStatus(leadData.status);
    setContent(leadContent);
  }

  async function handleSubmitLeadRevision () {
    if (changes === 0) {
      setSuccessStatus('');
      setErrStatus('Nothing to commit.');
      return;
    }
    if (!note.trim()) {
      setSuccessStatus('');
      setErrStatus('Please enter a discussion note explaining your changes.');
      return;
    }
    const leadData = {
      addLeadRevisionId: props.editId,
      status: leadStatus,
      author: session?.user.id,
      content: JSON.stringify(content),
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

  async function handleShowPublish () {
    const nextStudyResponse = await getNextStudy({variables: {clientCode: client}});
    setNextStudy(nextStudyResponse?.data.getNextStudy);
    setCompletedPublish(false);
    setPublishVisible(true);
  }

  async function handlePublish () {
    setPublishErrStatus('Creating file tree in Google Drive...');
    if (studyType === '') {
      setPublishErrStatus('Please specify a study type.');
      return;
    }
    const studyFullName = `${client}${nextStudy.toString().padStart(4,'0')}-${studyType}`;
    try {
      const treeResult = await createDriveStudyTree({
        variables: {
          clientCode: client,
          studyName: studyFullName
        }
      });    
    } catch (err:any) {
      setPublishErrStatus(err.message);
      return;
    }
    setPublishErrStatus('Updating database...');
    try {
      const newStudy = await addStudy({
        variables: {
          clientCode: client,
          studyIndex: nextStudy,
          studyType: studyType
        }
      });
      setPublishErrStatus(`Completed adding new study: ${studyFullName}`);
      setCompletedPublish(true);
    } catch (err:any) {
      setPublishErrStatus(err.message);
    }
  }

  useEffect( () => {
    let changeSum = 0;
    if (leadStatus !== leadData.status) changeSum++;
    content.sections.map( (section:any, sectionIndex:number) => {
      if (leadContent.sections[sectionIndex].fields.length !== section.fields.length) changeSum++;
      section.fields.map( (field:any, fieldIndex:number) => {
        if (leadContent.sections[sectionIndex].fields[fieldIndex]?.data !== field.data) changeSum++;
      });
    });
    setChanges(changeSum);
  }, [leadStatus, leadContent, content, leadData.status]);

  return (
    <>
      <main className='md:h-screen overflow-x-hidden flex flex-col gap-2 pb-4'>
      <Navbar/>
      <div className='flex items-center'>

        <Link className='std-link ml-4 my-2' href='/leads'>&larr; Back</Link>
        <h1 className='mx-4'>Editing: {leadData.name}</h1>
      </div>
      <div className='flex justify-between items-center bg-secondary/20 border border-secondary/80 rounded-lg p-2 mx-4 flex-grow gap-2'>
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
          <button className='std-button-lite flex items-center gap-2' onClick={handleShowPublish}>
            <FontAwesomeIcon icon={faFlagCheckered} />
            Publish
          </button>
        </div>
      </div>
      <section className='max-md:flex max-md:flex-col-reverse md:grid md:grid-cols-2 xl:grid-cols-5 gap-2 px-4 overflow-y-hidden'>
        <div id="discussion" className='bg-secondary/20 border border-secondary/80 xl:col-span-2 p-4 rounded-lg md:overflow-y-hidden h-full'>
          <h5>Discussion</h5>
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
        <div id="edit-study" className='bg-secondary/20 border border-secondary/80 xl:col-span-3 p-4 rounded-lg md:overflow-y-hidden h-full'>
        <h5>Lead Details</h5>
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

                  {content.sections.map( (section:any, sectionIndex:number) => (
                    <section key={sectionIndex}>
                      <div className='mr-2 font-bold'>{section.name}:</div>
                      <div className='flex flex-col border border-black rounded-md p-4 mt-2 mb-4 gap-2'>
                        {section.fields.map( (field:any, fieldIndex:number) => (
                          <section key={fieldIndex}>
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
                          </section>
                        ))}
                      </div>
                    </section>
                  ))}
                </form>
              </section>
            </div>
          </div>
        </div>
      </section>
      </main>
      <section className={`absolute ${publishVisible ? `grid` : `hidden`} grid-cols-12 items-start pt-[5vh] bg-black/50 w-screen h-screen top-0 left-0`}>
        <section className='flex bg-white rounded-lg p-0 col-start-3 col-span-8 md:col-start-4 md:col-span-6 lg:col-start-5 lg:col-span-4'>
          <section className='flex flex-col p-4 bg-secondary/20 rounded-lg w-full gap-2'>
            <h5>Publish Lead</h5>
            <div>
              This action will build a new <b>Study</b>.
            </div>
            <div>
              A new study folder will be generated with an automatically-assigned Study ID (below), and the details for this lead will be copied onto an appropriate form and placed within the study folder.
            </div>
            <select className='std-input' onChange={(e)=>setStudyType(e.target.value)} value={studyType}>
                <option value=''>-- Choose Type Classification --</option>
                <option value='HU'>HU - Human Cadaver</option>
                <option value='IVT'>IVT - In Vitro</option>
                <option value='INT'>INT - Animal Interventional</option>
                <option value='SUR'>SUR - Animal Surgical</option>
              </select>
            <div className='flex gap-2 items-center'>
              <div className='font-bold'>Study ID:</div>
              <div>{`${client}${nextStudy.toString().padStart(4,'0')}-${studyType ? `${studyType}` : 'XXX'}`}</div>
            </div>
            <div className='flex gap-2'>
              <button className='secondary-button-lite flex-grow' onClick={() => {setPublishErrStatus(''); setPublishVisible(false);}}>
                {completedPublish ? 'Done' : 'Cancel'}
              </button>
              { !completedPublish && 
                <button className='std-button-lite flex-grow' onClick={handlePublish}>Publish</button>
              }
            </div>
            <div className='text-[#800]'>{publishErrStatus}</div>
        </section>
        </section>
      </section>
    </>
  );
}