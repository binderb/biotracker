import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { addApolloState, initializeApollo } from "../../../../../utils/apolloClient";
import { GET_FORM_DETAILS, GET_FORM_DETAILS_FROM_REVISION_ID, GET_LEAD_LATEST, GET_STUDY_PLAN_FORMS, GET_USERS } from "@/utils/queries";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft, faCheck, faCheckCircle, faCircleArrowLeft, faClockRotateLeft, faCodeCommit, faCog, faPlus, faRefresh, faX } from "@fortawesome/free-solid-svg-icons";
import { GET_STUDY_PLAN_FORM_LATEST } from "@/utils/queries";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import StudyPlanTemplateSection from "@/components/leads/StudyPlanTemplateSection";
import LeadEditor from "@/components/leads/LeadEditor";
import _ from 'lodash';
import { ADD_FORM_REVISION, UPDATE_FORM_DETAILS } from "@/utils/mutations";
import { getFormattedDate } from "@/utils/helpers";
import FormLayoutEditor from "@/components/leads/FormLayoutEditor";

interface TemplateField {
  index: number
  type: string
  params: Array<string>
  data: Array<string>
}

interface TemplateRow {
  index: number
  fields: Array<TemplateField>
  extensible: boolean
}

interface TemplateSection {
  name: string
  index: number
  rows: Array<TemplateRow>
  extensible: boolean
}

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
  const {data: formDetailsResponse} = await apolloClient.query({
    query: GET_FORM_DETAILS, variables: { formId: context.params.id }
  });
  const formDetails = formDetailsResponse?.getFormDetails;
  await apolloClient.query({
    query: GET_FORM_DETAILS_FROM_REVISION_ID,
    variables: {
      revisionId: formDetails.revisions[formDetails.revisions.length-1]._id
    }
  });
  await apolloClient.query({
    query: GET_STUDY_PLAN_FORM_LATEST,
    variables: {
      getStudyPlanFormLatestRevisionId: context.params.id
    }
  });
  await apolloClient.query({
    query: GET_USERS
  })

  return addApolloState(apolloClient, {
    props: {
      session,
      editId: context.params.id
    },
  });

}

export default function StudyPlanEditor (props:any) {

  const { data:session, status } = useSession();
  const router = useRouter();
  const [errStatus, setErrStatus] = useState('');
  const [successStatus, setSuccessStatus] = useState('');
  const { data: studyPlanDetailsData } = useQuery(GET_FORM_DETAILS, {
    variables: { formId: props.editId }
  });
  let formDetails = studyPlanDetailsData?.getFormDetails;
  const { data: studyPlanLatestData } = useQuery(GET_STUDY_PLAN_FORM_LATEST, {
    variables: {
      getStudyPlanFormLatestRevisionId: props.editId
    }
  });
  const { data: usersData } = useQuery(GET_USERS);
  const users = usersData.getUsers;
  let studyPlan = studyPlanLatestData?.getStudyPlanFormLatestRevision;
  const [sections, setSections] = useState(_.cloneDeep(studyPlan.revisions[0].sections));
  let studyPlanContent = [{
    name: studyPlan.name,
    studyPlanFormRevisionId: studyPlan.revisions[0]._id,
    sections: _.cloneDeep(sections)
  }];
  const [content, setContent] = useState(studyPlanContent);
  const [changes, setChanges] = useState(0);
  const [showCommitChanges, setShowCommitChanges] = useState(false);
  const [showRevisionHistory, setShowRevisionHistory] = useState(false);
  const [commitNote, setCommitNote] = useState('');
  const [addFormRevision] = useMutation(ADD_FORM_REVISION, {
    refetchQueries: [{query: GET_STUDY_PLAN_FORM_LATEST}, {query: GET_STUDY_PLAN_FORMS}]
  });
  const [updateFormDetails] = useMutation(UPDATE_FORM_DETAILS, {
    refetchQueries: [{query: GET_STUDY_PLAN_FORM_LATEST, fetchPolicy: 'network-only'}, {query: GET_STUDY_PLAN_FORMS, fetchPolicy: 'network-only'}]
  })
  const [loadFormLatest] = useLazyQuery(GET_STUDY_PLAN_FORM_LATEST, {
    variables: {
      getStudyPlanFormLatestRevisionId: props.editId
    },
    fetchPolicy: 'network-only'
  });
  const [loadFormDetails] = useLazyQuery(GET_FORM_DETAILS, {
    variables: {
      formId: props.editId
    },
    fetchPolicy: 'network-only'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [formName, setFormName] = useState(studyPlan.name);
  const [studyType, setStudyType] = useState(JSON.parse(studyPlan.metadata).studyTypeCode);

  useEffect ( () => {
    setContent([{
      name: studyPlan.name,
      studyPlanFormRevisionId: studyPlan.revisions[0]._id,
      sections: sections
    }]);
    console.log(sections);
  }, [sections, studyPlan, formDetails]);

  useEffect( () => {
    let changeSum = 0;
    if (sections.length !== studyPlan.revisions[0].sections.length) changeSum++;
    sections.map( (section:any, sectionIndex:number) => {
      if (studyPlan.revisions[0].sections[sectionIndex]?.rows?.length !== section.rows.length) changeSum++;
      if (studyPlan.revisions[0].sections[sectionIndex]?.extensible !== section.extensible) changeSum++;
      if (studyPlan.revisions[0].sections[sectionIndex]?.name !== section.name) changeSum++;
      section.rows.map( (row:any, rowIndex:number) => {
        if (studyPlan.revisions[0].sections[sectionIndex]?.rows[rowIndex]?.fields.length !== row.fields.length) changeSum++;
        if (studyPlan.revisions[0].sections[sectionIndex]?.rows[rowIndex]?.extensible !== row.extensible) changeSum++;
        row.fields.map( (field:any, fieldIndex:number) => {
          if (studyPlan.revisions[0].sections[sectionIndex]?.rows[rowIndex]?.fields[fieldIndex]?.data.toString() !== field.data.toString()) {
            changeSum++;
          }
          if (studyPlan.revisions[0].sections[sectionIndex]?.rows[rowIndex]?.fields[fieldIndex]?.type !== field.type) {
            changeSum++;
          }
          if (studyPlan.revisions[0].sections[sectionIndex]?.rows[rowIndex]?.fields[fieldIndex]?.params.toString() !== field.params.toString()) {
            changeSum++;
          } 
          
        });
      });
    });
    
    setChanges(changeSum);
  }, [studyPlan, sections]);

  if (status !== 'authenticated') {
    router.push('/login');
    return;
  }


  async function handleCommitChanges () {
    try {
      await addFormRevision({
        variables: {
          formId: props.editId,
          sections: JSON.stringify(sections),
          note: commitNote
        }
      });
      await loadFormLatest();
      studyPlan = studyPlanLatestData?.getStudyPlanFormLatestRevision;
      await loadFormDetails();
      formDetails = studyPlanDetailsData?.getFormDetails;
      setErrStatus('');
      setSuccessStatus('Form revision added successfully.');
      setCommitNote('');
      setShowCommitChanges(false);
    } catch (err:any) {
      setSuccessStatus('');
      setErrStatus(JSON.stringify(err));
      setCommitNote('');
      setShowCommitChanges(false);
    }
  }

  async function handleSaveDetails () {
    try {
      const metadata = JSON.stringify({
        studyTypeCode: studyType
      });
      await updateFormDetails({
        variables: {
          formId: props.editId,
          name: formName,
          metadata: metadata
        }
      });
      await loadFormLatest();
      studyPlan = studyPlanLatestData?.getStudyPlanFormLatestRevision;
      await loadFormDetails();
      formDetails = studyPlanDetailsData?.getFormDetails;
      setSuccessStatus('Form details updated successfully.');
      setErrStatus('');
      setShowSettings(false);
    } catch (err:any) {
      setSuccessStatus('');
      setErrStatus(err.message);
      setShowSettings(false);
    }
  }

  function handleRevertChanges () {
    const originalSections = _.cloneDeep(studyPlan.revisions[0].sections);
    setSections(originalSections);
  }

  return (
    <>
      <main className='md:h-screen overflow-x-hidden flex flex-col gap-2 pb-4'>
        <Navbar/>
        <div className='flex items-center'>
          <Link className='std-link ml-4 my-2' href='/leads/study-plans'>&larr; Back</Link>
          <h1 className='mx-4'>Editing: {studyPlan.name}</h1>
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
            <button className='secondary-button-lite flex items-center gap-2' onClick={() => setShowRevisionHistory(true)}>
              <FontAwesomeIcon icon={faClockRotateLeft} />
              <div>Revision History</div>
              <div className='bg-white px-2 rounded-full text-secondary text-[12px] font-bold'>{formDetails.revisions.length}</div>
            </button>
            <button className='secondary-button-lite flex items-center gap-2' onClick={handleRevertChanges} disabled={changes === 0}>
              <FontAwesomeIcon icon={faArrowRotateLeft} />
              Revert to Saved
            </button>
            <button className='std-button-lite flex items-center gap-2' onClick={() => setShowCommitChanges(true)} disabled={changes === 0}>
              <FontAwesomeIcon icon={faCheck} />
              Commit
            </button>
            <button className='secondary-button-lite flex items-center gap-2' onClick={() => setShowSettings(true)}>
              <FontAwesomeIcon icon={faCog} />
            </button>
          </div>
        </div>
        <section className='max-md:flex max-md:flex-col-reverse md:grid md:grid-cols-12 gap-2 px-4 overflow-y-hidden h-full'>
          {/* Template Editor */}
          <div id="create-study" className='bg-secondary/20 border border-secondary/80 p-4 rounded-xl col-span-6 overflow-y-hidden'>
            <h5>Layout Editor</h5>
            <section className='<section className={`flex flex-col gap-2 md:overflow-y-auto overflow-x-visible h-[calc(100%-40px)] pr-2`}>'>
              <FormLayoutEditor 
              sections={sections} 
              setSections={setSections} 
            />
            </section> 
          </div>
          {/* Template Preview */}
          <div id="create-study" className='bg-secondary/20 border border-secondary/80 p-4 rounded-xl col-span-6 overflow-y-hidden'>
            <h5>Template Preview</h5>
            <section className='flex flex-col gap-2 md:overflow-y-auto overflow-x-visible h-[calc(100%-40px)] pr-2'>
              <LeadEditor 
                client={'EXAMPLE'}
                leadData={{name: 'EXAMPLE'}}
                content={content}
                setContent={setContent}
                users={users}
              />
            </section>
          </div>
        </section>
        <section className={`absolute ${showCommitChanges ? `grid` : `hidden`} grid-cols-12 items-start pt-[5vh] bg-black/50 w-screen h-screen top-0 left-0`}>
          <section className='flex bg-white rounded-lg p-0 col-start-2 col-span-10 md:col-start-3 md:col-span-8 lg:col-start-4 lg:col-span-6'>
            <section className='flex flex-col p-4 bg-secondary/20 rounded-lg w-full gap-2'>
              <h5>Commit Form Revision</h5>
              <section className='flex flex-col justify-center'>
                <div>Provide a note to justify the changes made in this revision.</div>
                <section className='flex flex-col border border-secondary rounded-md justify-center p-4 mt-2 mb-4'>
                  <textarea className='std-input resize-none w-full h-[150px]' value={commitNote} onChange={(e) => setCommitNote(e.target.value)}></textarea>
                </section>
              </section>
              <div className='flex gap-2'>
                <button className='secondary-button-lite flex-grow' onClick={() => {setShowCommitChanges(false); setCommitNote('');}}>
                  Cancel
                </button>
                <button className='std-button-lite flex-grow' onClick={handleCommitChanges} disabled={commitNote.trim() === ''}>
                  Confirm
                </button>
              </div>
            </section>
          </section>
        </section>
        <section className={`absolute ${showSettings ? `grid` : `hidden`} grid-cols-12 items-start pt-[5vh] bg-black/50 w-screen h-screen top-0 left-0`}>
          <section className='flex bg-white rounded-lg p-0 col-start-2 col-span-10 md:col-start-3 md:col-span-8 lg:col-start-4 lg:col-span-6'>
            <section className='flex flex-col p-4 bg-secondary/20 rounded-lg w-full gap-2'>
              <h5>Form Details</h5>
              <section className='flex flex-col justify-center'>
                <div className='flex items-center mb-4 gap-2 justify-start'>
                  <div className='flex items-center gap-2 w-full'>
                    <div className='font-bold'>Form Name:</div>
                    <input type='text' className='std-input flex-grow' name='leadName' value={formName} onChange={(e)=>setFormName(e.target.value)} />
                  </div>
                  {/* <div className='flex items-center gap-2'>
                    <div className='font-bold'>Form ID:</div>
                    <div className='font-monospace'>{`F-SP-${nextFormIndex.toString().padStart(4,'0')}`}</div>
                  </div> */}
                </div>
                <div className='flex items-center mb-4 gap-2 justify-start'>
                  <div className='font-bold'>Associated with Study Type:</div>
                  <select className='std-input flex-grow' onChange={(e)=>setStudyType(e.target.value)} value={studyType}>
                    <option value=''>-- Choose --</option>
                    <option value='AH'>AH - Animal Heart</option>
                    <option value='HH'>HH - Human Heart</option>
                    <option value='HU'>HU - Human Cadaver</option>
                    <option value='INT'>INT - Animal Interventional</option>
                    <option value='IVT'>IVT - In Vitro</option>
                    <option value='SUR'>SUR - Animal Surgical</option>
                  </select>
                </div>
              </section>
              <div className='flex gap-2'>
                <button className='secondary-button-lite flex-grow' onClick={() => {setShowSettings(false); setFormName(studyPlan.name);}}>
                  Cancel
                </button>
                <button className='std-button-lite flex-grow' onClick={handleSaveDetails} >
                  Save 
                </button>
              </div>
            </section>
          </section>
        </section>
        <section className={`absolute ${showRevisionHistory ? `grid` : `hidden`} grid-cols-12 items-start pt-[5vh] bg-black/50 w-screen h-screen top-0 left-0`}>
          <section className='flex bg-white rounded-lg p-0 col-start-2 col-span-10 md:col-start-3 md:col-span-8 lg:col-start-4 lg:col-span-6'>
            <section className='flex flex-col p-4 bg-secondary/20 rounded-lg w-full gap-2'>
              <h5>Revision History</h5>
              <section className='flex flex-col justify-center'>
                <div className='md:overflow-y-hidden overflow-x-visible h-[calc(300px)]'>
                  <div className='md:overflow-y-auto overflow-x-visible h-full pr-4'>
                    <ul className='flex flex-col gap-2'>
                      {
                        formDetails.revisions.map( (revision:any, index:number) => (
                          <li key={index} className={`flex flex-col std-input rounded-md gap-2`}>
                            <div className='flex justify-between items-center w-full'>
                              <div className='font-bold'>{`R${index+1}`}</div>
                              <div className='text-[12px]'>{`published ${getFormattedDate(revision.createdAt)}`}</div>
                            </div>
                            <div>
                              {revision.note}
                            </div>
                          </li>
                        ))
                      }

                      
                    </ul>
                  </div>
                </div>
              </section>
              <div className='flex gap-2'>
                <button className='secondary-button-lite flex-grow' onClick={() => {setShowRevisionHistory(false); setFormName(studyPlan.name);}}>
                  Done
                </button>
              </div>
            </section>
          </section>
        </section>
      </main>
    </>
  );
}

