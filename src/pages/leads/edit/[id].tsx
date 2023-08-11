
import Navbar from "@/components/Navbar";
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]';
import { initializeApollo, addApolloState } from "../../../../utils/apolloClient";
import { GET_CLIENTS, GET_USERS, GET_LEAD_LATEST, GET_LEADS, GET_NEXT_STUDY, GET_FORM_DETAILS_FROM_REVISION_ID, GET_STUDY_PLAN_FORMS, GET_STUDY_PLAN_FORM_LATEST } from "@/utils/queries";
import { useSession } from "next-auth/react";
import { ChangeEvent, MouseEventHandler, useEffect, useState } from "react";
import { useApolloClient, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import { faCog, faFileExport, faFlagCheckered, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ADD_LEAD_NOTE, ADD_LEAD_REVISION, ADD_NEW_LEAD, ADD_STUDY, PUBLISH_LEAD_TO_DRIVE, CREATE_DRIVE_STUDY_TREE, UPDATE_LEAD_DRAFTERS, UPDATE_LEAD_ON_DRIVE, UPDATE_LEAD_REVISION_PUBLISH_STATUS } from "@/utils/mutations";
import { useParams } from 'next/navigation';
import DiscussionBoard from "@/components/leads/DiscussionBoard";
import { useRouter } from "next/router";
import LeadEditor from "@/components/leads/LeadEditor";


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
  await apolloClient.query({
    query: GET_STUDY_PLAN_FORMS,
  });
  await apolloClient.query({
    query: GET_USERS,
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
  const apolloClient = useApolloClient();
  const router = useRouter();
  const { loading, data: leadResponseData } = useQuery(GET_LEAD_LATEST, {
    variables: {
      getLeadLatestRevisionId: props.editId
    }
  });
  let leadData = leadResponseData?.getLeadLatestRevision;
  const [loadLeadLatest] = useLazyQuery(GET_LEAD_LATEST, {
    variables: {
      getLeadLatestRevisionId: props.editId
    },
    fetchPolicy: 'network-only'
  })
  const [leadStatus, setLeadStatus] = useState(leadData.status);
  let leadContent = JSON.parse(leadData?.revisions[0].content);
  const [content, setContent] = useState(leadContent);
  const [errStatus, setErrStatus] = useState('');
  const [successStatus, setSuccessStatus] = useState('');
  const [client, setClient] = useState(leadData.client.code);
  const { data: getLeadsResponseData } = useQuery(GET_LEADS);
  const [addLeadRevision, { error: leadRevisionError, data: addLeadRevisionData }] = useMutation(ADD_LEAD_REVISION, {
    refetchQueries: [{query: GET_LEAD_LATEST,
      variables: {
        getLeadLatestRevisionId: props.editId
      }},{query: GET_LEADS}]
  });
  const [addLeadNote, { error: leadNoteError, data: addLeadNoteData }] = useMutation(ADD_LEAD_NOTE, {
    refetchQueries: [{query: GET_LEAD_LATEST,
      variables: {
        getLeadLatestRevisionId: props.editId
      }},{query: GET_LEADS}]
  });
  const [note, setNote] = useState('');
  const [changes, setChanges] = useState(0);
  const [publishVisible, setPublishVisible] = useState(false);
  const [publishErrStatus, setPublishErrStatus] = useState('');
  const [getNextStudy, { data: newIdData }] = useLazyQuery(GET_NEXT_STUDY, {
    fetchPolicy: 'network-only'
  });
  const [getFormDetails, {data: formDetailsData}] = useLazyQuery(GET_FORM_DETAILS_FROM_REVISION_ID);
  const [nextStudy, setNextStudy] = useState('');
  const [studyIds, setStudyIds] = useState(new Array<string>);
  const [createDriveStudyTree, { data : driveTreeResponse }] = useMutation(CREATE_DRIVE_STUDY_TREE);
  const [publishLeadToDrive, { data : driveResponse }] = useMutation(PUBLISH_LEAD_TO_DRIVE, {
    refetchQueries: [{query: GET_LEAD_LATEST,
      variables: {
        getLeadLatestRevisionId: props.editId
      }}]
  });
  const [updateLeadOnDrive] = useMutation(UPDATE_LEAD_ON_DRIVE, {
    refetchQueries: [{query: GET_LEAD_LATEST, 
      variables: {
        getLeadLatestRevisionId: props.editId
      }
    }]
  })
  const [addStudy, { error, data : newStudyData }] = useMutation(ADD_STUDY, {
    refetchQueries: [{query: GET_NEXT_STUDY}, 'GetNextStudy']
  });
  const [updateLeadRevisionPublishStatus] = useMutation(UPDATE_LEAD_REVISION_PUBLISH_STATUS);
  const [completedPublish, setCompletedPublish] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settingsErrStatus, setSettingsErrStatus] = useState('');
  const [drafterToAdd, setDrafterToAdd] = useState('');
  const [templateToAdd, setTemplateToAdd] = useState('');
  const { data: userData } = useQuery(GET_USERS);
  const users = userData.getUsers;
  const { data: studyPlanFormsData } = useQuery(GET_STUDY_PLAN_FORMS);
  const studyPlanForms = studyPlanFormsData.getStudyPlanForms;
  const [templateList, setTemplateList] = useState(leadContent);
  const [drafterList, setDrafterList] = useState(leadData.drafters);
  const [updateLeadDrafters] = useMutation(UPDATE_LEAD_DRAFTERS);
  const [getLatestStudyPlanFormRevision] = useLazyQuery(GET_STUDY_PLAN_FORM_LATEST);


  useEffect( () => {
    let changeSum = 0;
    if (leadStatus !== leadData.status) changeSum++;
    for (let i=0;i<content.length;i++) {
      content[i].sections.map( (section:any, sectionIndex:number) => {
        if (leadContent.length-1 >= i) {
          if (leadContent[i].sections[sectionIndex].rows.length !== section.rows.length) changeSum++;
          section.rows.map( (row:any, rowIndex:number) => {
            row.fields.map( (field:any, fieldIndex:number) => {
              if (leadContent[i].sections[sectionIndex].rows[rowIndex]?.fields[fieldIndex]?.data.toString() !== field.data.toString()) changeSum++;
            });
          });
        } else {
          // There's a newly-added study plan, since the content array is longer than leadContent.
          changeSum++;
        }
      });
    }
    
    setChanges(changeSum);
  }, [leadStatus, leadContent, content, leadData.status]);

  useEffect( () => {
    console.log('content changed');
    console.log(content);
  },[content]);

  if (status !== 'authenticated') {
    router.push('/login');
    return;
  }

  function handleRevertChanges () {
    setLeadStatus(leadData.status);
    setTemplateList(leadContent);
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

  async function handleShowPublish () {
    if (changes === 0) {
      const nextStudyResponse = await getNextStudy({variables: {clientCode: client}});
      setNextStudy(nextStudyResponse?.data.getNextStudy);
      const studyIds = Array<string>();
      for (let i=0;i<content.length;i++) {
        // Only generate study IDs for studies that haven't already been saved.
        if (i > leadData.studies.length-1) {
          const formDetailsResponse = await getFormDetails({variables: {revisionId: content[i].studyPlanFormRevisionId}})
          const formMetadata = formDetailsResponse?.data?.getFormDetailsFromRevisionId.metadata;
          studyIds.push(`${client}${(nextStudyResponse?.data.getNextStudy+(i-leadData.studies.length)).toString().padStart(4,'0')}-${JSON.parse(formMetadata).studyTypeCode}`);
        }
      }
      setStudyIds(studyIds);
      setCompletedPublish(false);
      setPublishVisible(true);
    } else {
      setSuccessStatus('');
      setErrStatus('Please commit your most recent changes before publishing.');
    }
  }

  async function handlePublish () {
    try {
      for (let i=0;i<content.length;i++) {

        if (leadData.studies.length-1 < i) {
          // Create a new study.
          setPublishErrStatus(`Creating files in Google Drive for ${studyIds[i-leadData.studies.length]}...`);
          const formDetailsResponse = await getFormDetails({variables: {revisionId: content[i].studyPlanFormRevisionId}})
          const studyTypeCode = JSON.parse(formDetailsResponse?.data?.getFormDetailsFromRevisionId.metadata).studyTypeCode;
          const treeResult = await publishLeadToDrive({
            variables: {
              clientCode: client,
              studyName: studyIds[i-leadData.studies.length],
              formRevisionId: content[i].studyPlanFormRevisionId,
              formData: JSON.stringify(formDetailsResponse.data.getFormDetailsFromRevisionId),
              studyData: JSON.stringify(content[i])
            }
          }); 
          setPublishErrStatus(`Updating database for ${studyIds[i-leadData.studies.length]}...`);
          const newStudy = await addStudy({
            variables: {
              clientCode: client,
              studyType: studyTypeCode,
              leadId: leadData._id,
              studyPlanIndex: i
            }
          });
          setPublishErrStatus(`Completed publishing study: ${studyIds[i-leadData.studies.length]}`);
        } else {
          // Update existing study.
          const formDetailsResponse = await getFormDetails({variables: {revisionId: content[i].studyPlanFormRevisionId}});
          const studyTypeCode = JSON.parse(formDetailsResponse?.data?.getFormDetailsFromRevisionId.metadata).studyTypeCode;
          const studyName = `${client}${leadData.studies[i].index.toString().padStart(4,'0')}-${studyTypeCode}`;
          setPublishErrStatus(`Updating files in ${studyName}...`);
          const updateResult = await updateLeadOnDrive({
            variables: {
              clientCode: client,
              studyName: studyName,
              formRevisionId: content[i].studyPlanFormRevisionId,
              formData: JSON.stringify(formDetailsResponse.data.getFormDetailsFromRevisionId),
              studyData: JSON.stringify(content[i])
            }
          });
          const updateRevisionResult = await updateLeadRevisionPublishStatus({
            variables: {
              leadRevisionId: leadData.revisions[0]._id
            }
          })
        }
      }
      const newResponse = await loadLeadLatest();
      leadData = newResponse?.data?.getLeadLatestRevision;
      leadContent = JSON.parse(leadData?.revisions[0].content);
      setContent([...leadContent]);
      setPublishErrStatus(`Completed publishing lead.`);
      setCompletedPublish(true);
    } catch (err:any) {
      setPublishErrStatus(JSON.stringify(err));
    }
  }

  function handleShowSettings () {
    setSettingsVisible(true);
  }

  function handleAddTemplate (e:ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    const templateObject = studyPlanForms.filter((template:any) => template.name === templateToAdd)[0];
    setTemplateList([...templateList, templateObject]);
    setTemplateToAdd('');
  }

  function handleRemoveTemplate (name:string) {
    const newTemplateList = templateList.filter((template:any) => template.name !== name);
    setTemplateList(newTemplateList);
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

  async function handleSaveSettings () {
    // Write new update lead mutation that sets drafters.
    try {
      // Update study plans
      const newContent = [];
      for (let i=0; i<templateList.length; i++) {
        // Check to see if this plan template already exists in content
        const existingTemplate = content ? content.filter((plan:any) => plan.name === templateList[i].name) : [];
        if (existingTemplate.length > 0) {
          console.log('found!');
          console.log(existingTemplate[0]);
          newContent.push(existingTemplate[0]);
        } else {
          console.log('not found!');
          console.log(templateList[i]._id)
          const planResponse = await getLatestStudyPlanFormRevision({
            variables: {
              getStudyPlanFormLatestRevisionId: templateList[i]._id
            }
          });
          if (planResponse.data?.getStudyPlanFormLatestRevision) {
            const templateObject = planResponse.data?.getStudyPlanFormLatestRevision;
            console.log(templateObject);
            newContent.push({
              name: templateObject.name,
              associatedStudyId: null,
              studyPlanFormRevisionId: templateObject.revisions[0]._id,
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
              })
            });
          }
        }
      }
      setContent(newContent);
      // Update drafter list
      await updateLeadDrafters({
        variables: {
          leadId: props.editId,
          drafters: drafterList.map((drafter:any) => drafter._id)
        }
      });
      await apolloClient.refetchQueries({
        include: [GET_LEADS, GET_LEAD_LATEST]
      });
      setSettingsVisible(false);
      setSettingsErrStatus('');
    } catch (err:any) {
      setSettingsErrStatus(JSON.stringify(err));
    }

    // How to handle adding plans? That data is stored in a revision's "content".
    // Could just provide a pop-up that notifies the user that a new commit will be
    // created, and then do just that.

    // Since the user might have already made changes, better to just make the appropriate changes to the "content" variable.


    // Once this is implemented, ALSO need to make sure the "re-publish" option can
    // handle assigning new study IDs to plans that were added since the last publish.
  }

  

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
          <button className='std-button-lite flex items-center gap-2' onClick={handleShowPublish}>
            {
              leadData.published ?
                <>
                  <FontAwesomeIcon icon={faFileExport} />
                  Re-Publish
                </>
              :
                <>
                  <FontAwesomeIcon icon={faFlagCheckered} />
                  Publish
                </>
            }
            
          </button>
          <button className='secondary-button-lite flex items-center gap-2' onClick={handleShowSettings}>
            <FontAwesomeIcon icon={faCog} />
          </button>
        </div>
      </div>
      <section className='max-md:flex max-md:flex-col-reverse md:grid md:grid-cols-12 gap-2 px-4 overflow-y-hidden h-full'>
        <div id="discussion" className='bg-secondary/20 border border-secondary/80 md:col-span-5 xl:col-span-4 p-4 rounded-lg md:overflow-y-hidden h-full'>
          <h5>Discussion</h5>
          <div className='flex flex-col gap-2'>
            <div className='flex justify-between items-center'>
              <div className='font-bold'>Note:</div>
              <div className='flex gap-2 items-center'>
                <button className='std-button-lite' disabled={changes !== 0 || !note.trim()} onClick={handleSubmitBareNote}>Post Without Changes</button>
                <button className='std-button-lite flex items-center gap-2' disabled={changes === 0} onClick={handleSubmitLeadRevision}>
                  Commit Changes
                </button>
              </div>
            </div>
            <textarea className='std-input mb-4 h-[150px] resize-none' value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className='md:overflow-y-hidden overflow-x-visible h-[calc(100%-238px)]'>
            <div className='md:overflow-y-auto overflow-x-visible h-full pr-4'>
              <DiscussionBoard leadData={leadData} />
            </div>
          </div>
        </div>
        <div id="edit-study" className='bg-secondary/20 border border-secondary/80 md:col-span-7 xl:col-span-8 p-4 rounded-lg md:overflow-y-hidden h-full'>
        <div className='flex justify-between items-center pb-2'>
          <h5>Lead Details</h5>
          <button className='secondary-button-lite' disabled={changes === 0} onClick={handleRevertChanges}>Revert to Saved</button>
        </div>
        
          <div className='md:overflow-y-hidden h-[calc(100%-40px)]'>
            <div className='md:overflow-y-auto h-full pr-4'>
              <section id='step-1'>
                  <section>
                    <div className='mr-2 font-bold'>Status:</div>
                    <div className='flex border border-secondary rounded-md items-center p-4 mt-2 mb-4'>
                      <select className='std-input' value={leadStatus} onChange={(e) => setLeadStatus(e.target.value)}>
                        <option value='active'>Active</option>
                        <option value='inactive'>Inactive</option>
                      </select>
                    </div>
                  </section>
                  <LeadEditor 
                    client={client}
                    content={content}
                    leadData={leadData}
                    users={users}
                    setContent={setContent}
                  />
              </section>
            </div>
          </div>
        </div>
      </section>
      </main>
      <section className={`absolute ${publishVisible ? `grid` : `hidden`} grid-cols-12 items-start pt-[5vh] bg-black/50 w-screen h-screen top-0 left-0`}>
        <section className='flex bg-white rounded-lg p-0 col-start-3 col-span-8 md:col-start-4 md:col-span-6 lg:col-start-5 lg:col-span-4'>
          {leadData.published && !completedPublish &&
            <section className='flex flex-col p-4 bg-secondary/20 rounded-lg w-full gap-2'>
              <h5>Re-Publish Lead</h5>
              <div>
                You have already published this lead at least once before, so this action will <b>update</b> the current Study Plan(s) that already exist in your linked directory on Google Drive, replacing their PDFs with updated versions.
              </div>
              <div>
                If you have added additional Study Plans since this lead was last published, new corresponding study folders and documents will be generated (see below).
              </div>
              <div className='font-bold'>Existing Studies ({leadData.studies.length}):</div>
              {
                leadData.studies.map((study:any, index:number) => (
                  <div key={index} className='flex flex-col justify-center items-start'>
                    <div className='flex gap-2 items-center'>
                      <div>
                        {`${client}${study.index.toString().padStart(4,'0')}-${study.type}`}
                      </div>
                    </div>
                </div>
                ))
              }
              <div className='font-bold'>New Studies ({studyIds.length}):</div>
              {
                content.map((plan:any, index:number) => {
                  if (index > leadData.studies.length-1) {
                    return (
                      <div key={index} className='flex flex-col justify-center items-start'>
                          <div className='flex gap-2 items-center'>
                            <div className='font-bold'>Form:</div>
                            <div>
                              {plan.name}
                            </div>
                          </div>
                          <div className='flex gap-2 items-center'>
                            <div className='font-bold'>Generated ID:</div>
                            <div>
                              {studyIds[index-leadData.studies.length]}
                            </div>
                          </div>
                      </div>
                    );
                  }
                })
              }
              <div className='flex gap-2 pt-2'>
                <button className='secondary-button-lite flex-grow' onClick={() => {setPublishErrStatus(''); setPublishVisible(false);}}>Cancel</button>
                <button className='std-button-lite flex-grow' onClick={handlePublish}>Re-Publish</button>
              </div>
              <div className='text-[#800]'>{publishErrStatus}</div>
            </section>
          }
          {!leadData.published && !completedPublish &&
            <section className='flex flex-col p-4 bg-secondary/20 rounded-lg w-full gap-2'>
              <h5>Publish Lead</h5>
              <div>
                This action will build a new <b>Study</b> for each Study Plan that is included in this lead.
              </div>
              <div>
                A new study folder will be generated with an automatically-assigned Study ID for each plan (below), and the details for each plan will be typeset into a PDF form and placed within the study folder.
              </div>
              {
                content.map((plan:any, index:number) => (
                  <div key={index} className='flex flex-col justify-center items-start'>
                    <div className='flex gap-2 items-center'>
                      <div className='font-bold'>Study Plan Form:</div>
                      <div>
                        {plan.name}
                      </div>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <div className='font-bold'>Generated ID:</div>
                      <div>
                        {studyIds[index]}
                      </div>
                    </div>
                </div>
                ))
              }
              <div className='flex gap-2 pt-2'>
                <button className='secondary-button-lite flex-grow' onClick={() => {setPublishErrStatus(''); setPublishVisible(false);}}>Cancel</button>
                <button className='std-button-lite flex-grow' onClick={handlePublish}>Publish</button>
              </div>
              <div className='text-[#800]'>{publishErrStatus}</div>
            </section>
          }
          {completedPublish && 
            <section className='flex flex-col p-4 bg-secondary/20 rounded-lg w-full gap-2'>
              <h5>Publish Completed</h5>
              <div className='flex gap-2 pt-2'>
                <button className='secondary-button-lite flex-grow' onClick={() => {setPublishErrStatus(''); setPublishVisible(false);}}>Done</button>
              </div>
              <div className='text-[#800]'>{publishErrStatus}</div>
            </section>
          }
        </section>
      </section>
      <section className={`absolute ${settingsVisible ? `grid` : `hidden`} grid-cols-12 items-start pt-[5vh] bg-black/50 w-screen h-screen top-0 left-0`}>
        <section className='flex bg-white rounded-lg p-0 col-start-2 col-span-10 md:col-start-3 md:col-span-8 lg:col-start-4 lg:col-span-6'>
          <section className='flex flex-col p-4 bg-secondary/20 rounded-lg w-full gap-2'>
            <h5>Lead Settings</h5>
            <section className='flex flex-col justify-center mb-2'>
              <div className='mr-2'>Choose what types of studies will be included in the lead. Study plans cannot be deleted once they are added to the lead, but they can be marked as not performed.</div>
              <section className='flex flex-col border border-secondary rounded-md justify-center p-4 mt-2 mb-4'>
                <form className="flex items-center mb-2" onSubmit={handleAddTemplate}>
                  <div className="font-bold mr-2">Study Plan Forms:</div>
                  <button className="std-button-lite mr-2" disabled={templateToAdd === ''}>Add</button>
                  <select className="std-input flex-grow" onChange={(e) => setTemplateToAdd(e.target.value)} value={templateToAdd}>
                    <option value=''>-- Choose --</option>
                    { studyPlanForms.map((template:any, index:number) => (<option key={index} value={template.name} disabled={templateList.filter((templatelistitem:any) => template.name === templatelistitem.name).length > 0}>
                      {template.name}
                    </option>))}
                  </select>
                </form>
                <div className="font-bold mb-2">Study Plans Included:</div>
                <ul>
                  { templateList.length > 0 ? templateList.map((template:any, index:number) => (
                    <li key={index} className='flex justify-between items-center std-input rounded-md mb-2'>
                      {template.name}
                      <button className='secondary-button-lite' onClick={()=>handleRemoveTemplate(template.name)} disabled={leadContent.filter((e:any) => e.name === template.name).length > 0}><FontAwesomeIcon icon={faX} size='xs' /></button>
                    </li>
                  ))
                  :
                  'Please add at least one study plan.'
                  }
                </ul>
              </section>
            </section>
            <section className='flex flex-col justify-center mb-2'>
              <div className='mr-2'>Manage team members with editing access. Removing a team member will preserve all their contributions, but they will be unable to access this lead until they are added again.</div>
              <section className='flex flex-col border border-secondary rounded-md justify-center p-4 mt-2 mb-4'>
                <form className="flex items-center mb-2" onSubmit={handleAddDrafter}>
                  <div className="font-bold mr-2">Add Members:</div>
                  <button className="std-button-lite mr-2" disabled={drafterToAdd === ''}>Add</button>
                  <select className="std-input flex-grow" onChange={(e) => setDrafterToAdd(e.target.value)} value={drafterToAdd}>
                    <option value=''>-- Choose --</option>
                    { users.map((user:any) => (<option key={user.username} value={user.username} disabled={drafterList.filter((drafter:any) => drafter.username === user.username).length > 0}>
                      {`${user.first} ${user.last}`}
                    </option>))}
                  </select>
                </form>
                <div className="font-bold mb-2">Team members with editing access:</div>
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
              </section>
            </section>
            <div className='flex gap-2'>
              <button className='secondary-button-lite flex-grow' onClick={() => {setSettingsErrStatus(''); setSettingsVisible(false); setDrafterList(leadData.drafters); setTemplateList(leadContent);}}>
                Cancel
              </button>
              <button className='std-button-lite flex-grow' onClick={handleSaveSettings}>
                Save Changes
              </button>
            </div>
            <div className='text-[#800]'>{settingsErrStatus}</div>
          </section>
        </section>
      </section>
    </>
  );
}