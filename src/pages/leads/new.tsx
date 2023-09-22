import Navbar from "@/components/Navbar";
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { initializeApollo, addApolloState } from "../../../utils/apolloClient";
import { GET_CLIENTS, GET_STUDY_PLAN_FORMS, GET_STUDY_PLAN_FORM_LATEST, GET_USERS } from "@/utils/queries";
import { useSession } from "next-auth/react";
import { ChangeEvent, MouseEventHandler, useEffect, useState } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ADD_NEW_LEAD } from "@/utils/mutations";
import { useRouter } from "next/router";
import LeadSetup from "@/components/leads/LeadSetup";
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
    query: GET_CLIENTS,
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
    },
  });

}


export default function NewLead () {

  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: clientData } = useQuery(GET_CLIENTS);
  const clients = clientData?.getClients;
  const { data: userData } = useQuery(GET_USERS);
  const users = userData?.getUsers;
  const [creatorStep, setCreatorStep] = useState(1);
  const [errStatus, setErrStatus] = useState('');
  const [client, setClient] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [leadName, setLeadName] = useState('');
  const initialDrafters = session ? [session.user] : [];
  const [drafterList, setDrafterList] = useState(initialDrafters);
  const [addNewLead, { error, data: addNewLeadData }] = useMutation(ADD_NEW_LEAD);
  const { data: studyPlanFormsData } = useQuery(GET_STUDY_PLAN_FORMS);
  const studyPlanForms = studyPlanFormsData?.getStudyPlanForms;
  const [firstNote, setFirstNote] = useState('');
  const [getLatestStudyPlanFormRevision, { data }] = useLazyQuery(GET_STUDY_PLAN_FORM_LATEST);
  const [templateList, setTemplateList] = useState<any>([]);
  const [content, setContent] = useState<any>(null);

  useEffect( () => {
    console.log(project);
  },[project]);

  useEffect( () => {
    const fetchTemplateObjects = async () => {
      const newContent = [];
      try {
        for (let i=0; i<templateList.length; i++) {
          // Check to see if this plan template already exists in content
          const existingTemplate = content ? content.filter((plan:any) => plan.name === templateList[i].name) : [];
          if (existingTemplate.length > 0) {
            newContent.push(existingTemplate[0]);
          } else {
            const planResponse = await getLatestStudyPlanFormRevision({
              variables: {
                getStudyPlanFormLatestRevisionId: templateList[i]._id
              }
            });
            if (planResponse.data?.getStudyPlanFormLatestRevision) {
              const templateObject = planResponse.data?.getStudyPlanFormLatestRevision;
              newContent.push({
                associatedStudyId: null,
                studyPlanFormId: templateObject._id,
                studyPlanFormRevisionId: templateObject.revisions[0]._id,
                sections: templateObject.revisions[0].sections.map( (section:any) => {
                  return { 
                    "name": section.name,
                    "index": section.index,
                    "extensible": section.extensible,
                    "extensibleReference" : section.extensibleReference,
                    "rows": section.rows.map( (row:any) => {
                      return {
                        "index": row.index,
                        "extensible": row.extensible,
                        "extensibleReference" : row.extensibleReference,
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
      } catch (err:any) {
        console.log(err);
      }
    }
    
    fetchTemplateObjects();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateList, getLatestStudyPlanFormRevision]);

  if (status !== 'authenticated') {
    router.push('/login');
    return;
  }

  function handleChangeStep (delta:number) {
    const newCreatorStep = creatorStep + delta;
    if (newCreatorStep === 1 || newCreatorStep === 2 || newCreatorStep === 3) setErrStatus('');
    if (newCreatorStep === 2 && (!client || !leadName || !project)) {
      setErrStatus('Please select a value for all fields before proceeding!');
      return;
    }
    if (newCreatorStep === 2 && templateList.length === 0) {
      setErrStatus('Please add at least one study plan before proceeding!');
      return;
    }
    setCreatorStep(newCreatorStep);
  }

  async function handleSubmitNewLead () {
    const leadData = {
      name: leadName,
      author: session?.user.id,
      drafters: drafterList.map((drafter:any) => drafter.id || drafter._id),
      client: clients.filter((clientObject:any) => clientObject.code === client.code)[0]._id,
      project: project._id,
      content: JSON.stringify(content),
      firstNote: firstNote
    }
    console.log(leadData);
    try {
      const response = await addNewLead({
        variables: leadData
      });
      handleChangeStep(1);
    } catch (err:any) {
      setErrStatus(`${JSON.stringify(err)}`);
    }
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
            <>
              <h2 className='mb-2'>Basic Setup (Step 1 of 3)</h2>
              <div className='flex items-center mb-4'>
                Choose a name for your draft lead and specify the client. The name is only used for identification on the draft dashboard, and the lead will be given a permanent ID when it is finalized and converted into a study. The client ID will be permanently associated with this draft and cannot be changed.
              </div>
              <LeadSetup 
                session={session}
                leadName={leadName}
                client={client}
                project={project}
                users={users}
                clients={clients}
                studyPlanForms={studyPlanForms}
                templateList={templateList}
                drafterList={drafterList}
                setLeadName={setLeadName}
                setClient={setClient}
                setProject={setProject}
                setTemplateList={setTemplateList}
                setDrafterList={setDrafterList}
              />
              <div className='flex gap-2'>
                <button className='std-button' onClick={() => handleChangeStep(1)}>Next</button>
                <div className='my-2 text-[#800] whitespace-pre'>{errStatus}</div>
              </div>
            </>
          }
          { (creatorStep === 2) &&
            <>
            <h2 className='mb-2'>Add Details (Step 2 of 3)</h2>
            <div className='flex items-center mb-4'>
              Use the form below to add whatever details are known about the lead. These fields can be edited later by you and your drafting team, so just include the information you currently have. 
            </div>
            <LeadEditor
              client={client}
              content={content}
              studyPlanNames={templateList.map((form:any) => form.name)}
              upgradeFormContent={''}
              leadData={{project:project}}
              users={users}
              setContent={setContent}
              setUpgradeFormContent={()=>{}}
              handleUpgradeForm={()=>{}}
              upgradable={false}
            />
            <div className='flex gap-2'>
              <button className='std-button' onClick={() => handleChangeStep(-1)}>Back</button>
              <button className='std-button' onClick={() => handleChangeStep(1)}>Next</button>
            </div>
            <div className='my-2 text-[#800] whitespace-pre font-mono'>{errStatus}</div>          
            </>
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