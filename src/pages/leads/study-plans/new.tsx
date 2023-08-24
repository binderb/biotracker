import Navbar from "@/components/Navbar";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { addApolloState, initializeApollo } from "../../../../utils/apolloClient";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faX } from "@fortawesome/free-solid-svg-icons";
import StudyPlanTemplateSection from "@/components/leads/StudyPlanTemplateSection";
import { ADD_FORM } from "@/utils/mutations";
import { useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { GET_NEXT_FORM } from "@/utils/queries";
import FormLayoutEditor from "@/components/leads/FormLayoutEditor";
import _ from 'lodash';
import LeadEditor from "@/components/leads/LeadEditor";

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
  await apolloClient.query({
    query: GET_NEXT_FORM,
    variables: {
      category: 'SP'
    },
    fetchPolicy: 'network-only'
  });

  return addApolloState(apolloClient, {
    props: {
      session,
    },
  });

}

export default function NewStudyPlanForm () {

  const { data: session, status } = useSession();
  const [templateName, setTemplateName] = useState('');
  const [studyType, setStudyType] = useState('');
  const [sections, setSections] = useState<TemplateSection[]>([]);
  const [errStatus, setErrStatus] = useState('');
  const router = useRouter();
  const { loading, error: nextFormError, data: nextFormData } = useQuery(GET_NEXT_FORM, {
    variables: {
      category: 'SP'
    },
  });
  const nextFormIndex = nextFormData.getNextForm;
  const [addForm, { error, data: addNewLeadData }] = useMutation(ADD_FORM, {
    refetchQueries: [{query: GET_NEXT_FORM}]
  });
  let studyPlanContent = [{
    name: templateName,
    sections: _.cloneDeep(sections)
  }];
  const [content, setContent] = useState(studyPlanContent);

  useEffect ( () => {
    setContent([{
      name: templateName,
      sections: sections
    }]);
    console.log(sections);
  }, [sections, templateName]);

  async function handleCreateStudyPlanForm() {
    try {
      console.log(studyType);
      const metadata = JSON.stringify({
        studyTypeCode: studyType
      });
      if (templateName.trim() === '') throw new Error ("You must specify a name for the form.");
      if (studyType === '') throw new Error ("You must select an associated study type.");
      if (sections.length < 1) throw new Error ("Forms must have at least one section.");
      const returnVal = await addForm({
        variables: {
          name: templateName,
          formCategory: 'SP',
          formIndex: nextFormIndex,
          metadata: metadata,
          sections: JSON.stringify(sections)
        }
      });
      console.log(JSON.stringify(sections));
      router.push('/leads/templates');
    } catch (err:any) {
      setErrStatus(err.message);
    }
  }

  if (status !== 'authenticated') {
    router.push('/login');
    return;
  }

  return (
    <>        
      <main className="md:h-screen overflow-x-hidden flex flex-col gap-2 pb-4">
        <Navbar />
        <div className='flex items-center'>
          <Link className='std-link ml-4 my-2' href='/leads/study-plans'>&larr; Back</Link>
        </div>
        { status === 'authenticated' && (session.user.role === 'dev' || session.user.role === 'admin') ?
            <>
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
              </div>
              <div className='flex gap-2'>
                
                <button className='std-button-lite flex items-center gap-2' onClick={handleCreateStudyPlanForm}>
                  Create
                </button>
              </div>
            </div>
            <section className='max-md:flex max-md:flex-col-reverse md:grid md:grid-cols-12 gap-2 px-4 overflow-y-hidden h-full'>
              {/* Template Editor */}
              <div id="create-study" className='bg-secondary/20 border border-secondary/80 p-4 rounded-xl col-span-6 overflow-y-hidden'>
                <h5>New Study Plan Form</h5>
                <div className='flex items-center mb-4 gap-2 justify-start'>
                  <div className='flex items-center gap-2'>
                    <div className='font-bold'>Form Name:</div>
                    <input type='text' className='std-input' name='leadName' value={templateName} onChange={(e)=>setTemplateName(e.target.value)} />
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='font-bold'>Form ID:</div>
                    <div className='font-monospace'>{`F-SP-${nextFormIndex.toString().padStart(4,'0')}`}</div>
                  </div>
                  
                </div>
                <div className='flex items-center mb-4 gap-2 justify-start'>
                  <div className='font-bold'>Associated with Study Type:</div>
                  <select className='std-input' onChange={(e)=>setStudyType(e.target.value)} value={studyType}>
                    <option value=''>-- Choose --</option>
                    <option value='AH'>AH - Animal Heart</option>
                    <option value='HH'>HH - Human Heart</option>
                    <option value='HU'>HU - Human Cadaver</option>
                    <option value='INT'>INT - Animal Interventional</option>
                    <option value='IVT'>IVT - In Vitro</option>
                    <option value='SUR'>SUR - Animal Surgical</option>
                  </select>
                </div>
                <h5>Layout Editor</h5>
                <section className='<section className={`flex flex-col gap-2 md:overflow-y-auto overflow-x-visible h-[calc(100%-190px)] pr-2`}>'>
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
                    users={[]}
                  />
                </section>
              </div>
            </section>
          {/* <div className='grid grid-cols-12 items-top gap-2'> */}
          {/* Template Editor */}
            {/* <div id="create-study" className='bg-secondary/20 border border-secondary/80 p-4 rounded-xl col-span-6'>
              <h5>New Study Plan Form</h5>
              <div className='flex items-center mb-4 gap-2 justify-start'>
                <div className='flex items-center gap-2'>
                  <div className='font-bold'>Form Name:</div>
                  <input type='text' className='std-input' name='leadName' value={templateName} onChange={(e)=>setTemplateName(e.target.value)} />
                </div>
                <div className='flex items-center gap-2'>
                  <div className='font-bold'>Form ID:</div>
                  <div className='font-monospace'>{`F-SP-${nextFormIndex.toString().padStart(4,'0')}`}</div>
                </div>
                
              </div>
              <div className='flex items-center mb-4 gap-2 justify-start'>
                <div className='font-bold'>Associated with Study Type:</div>
                <select className='std-input' onChange={(e)=>setStudyType(e.target.value)} value={studyType}>
                  <option value=''>-- Choose --</option>
                  <option value='AH'>AH - Animal Heart</option>
                  <option value='HH'>HH - Human Heart</option>
                  <option value='HU'>HU - Human Cadaver</option>
                  <option value='INT'>INT - Animal Interventional</option>
                  <option value='IVT'>IVT - In Vitro</option>
                  <option value='SUR'>SUR - Animal Surgical</option>
                </select>
              </div>
              
              <section className='flex flex-col gap-2'>
                <div className='font-bold'>Template Layout:</div>
                  <div className='flex flex-col border border-secondary/80 rounded-lg p-4 my-2 gap-2'>
                    { sections.length > 0 ? 
                      <>
                      {sections.map((section:TemplateSection, index:number) => 
                        <StudyPlanTemplateSection key={index} index={index} sections={sections} setSections={setSections} />
                      )}
                      </>
                      :
                      <>
                      No sections yet.
                      </>
                    }
                  </div>
              </section>
            </div> */}
            {/* Template Preview */}
            {/* <div id="create-study" className='bg-secondary/20 border border-secondary/80 p-4 rounded-xl col-span-6'>
              <h5>Template Preview</h5>
              
            </div>
          </div> */}
          </>
        :
        <div className="flex items-top p-4">
          {`It looks like you aren't authorized to view this page (admin access only). If you think this is an error, please contact your system administrator.`}
        </div>
      }
      </main>
    </>
  );
}