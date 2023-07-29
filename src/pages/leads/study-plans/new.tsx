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

  function handleAddSection () {
    const newSection : TemplateSection = {
      name: '',
      index: sections.length,
      rows: [] as TemplateRow[],
      extensible: false,
    }
    const newSections = [...sections, newSection];
    setSections(newSections);
  }

  function handleDeleteSection (index:number) {
    setSections(sections.filter( (_, i) => i !== index));
  }

  async function handleCreateStudyPlanForm() {
    try {
      console.log(studyType);
      const metadata = JSON.stringify({
        studyTypeCode: studyType
      });
      console.log(metadata)
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
      //router.push('/leads/templates');
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
      <Navbar />
      <div className='mt-4'>
        <Link className='std-link ml-4' href='/leads/study-plans'>&larr; Back</Link>
      </div>
      { status === 'authenticated' && (session.user.role === 'dev' || session.user.role === 'admin') ?
        <main className="flex flex-col items-top p-4 gap-2">
          <div className='flex justify-between items-center bg-secondary/20 border border-secondary/80 rounded-lg p-2 flex-grow gap-2'>
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
          <div className='flex items-top gap-2'>
          {/* Template Editor */}
            <div id="create-study" className='bg-secondary/20 border border-secondary/80 p-4 rounded-xl flex-grow'>
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
                <button className='std-button-lite flex items-center gap-2' onClick={handleAddSection}><FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>Add Section</button>
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
                        <StudyPlanTemplateSection key={index} index={index} sections={sections} setSections={setSections} handleDeleteSection={handleDeleteSection} />
                      )}
                      </>
                      :
                      <>
                      No sections yet.
                      </>
                    }
                  </div>
              </section>
            </div>
            {/* Template Preview */}
            {/* <div id="create-study" className='bg-secondary/20 border border-secondary/80 p-4 rounded-xl flex-grow'>
              <h5>Template Preview</h5>
              
            </div> */}
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