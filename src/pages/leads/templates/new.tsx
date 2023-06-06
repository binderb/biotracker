import Navbar from "@/components/Navbar";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { addApolloState, initializeApollo } from "../../../../utils/apolloClient";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faX } from "@fortawesome/free-solid-svg-icons";
import LeadTemplateSection from "@/components/LeadTemplateSection";
import { ADD_LEAD_TEMPLATE } from "@/utils/mutations";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";

interface TemplateField {
  name: string,
  index: number,
  type: string,
  data: string,
  extensible: boolean,
}

interface TemplateSection {
  name: string
  index: number,
  fields: Array<TemplateField>
  extensible: boolean
  extensibleGroupName: string
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
  // await apolloClient.query({
  //   query: GET_CLIENTS,
  // });

  return addApolloState(apolloClient, {
    props: {
      session,
    },
  });

}

export default function NewLeadTemplate () {

  const { data: session, status } = useSession();
  const [leadTemplateName, setLeadTemplateName] = useState('');
  const [sections, setSections] = useState<TemplateSection[]>([]);
  const [errStatus, setErrStatus] = useState('');
  const router = useRouter();

  const [addLeadTemplate, { error, data: addNewLeadData }] = useMutation(ADD_LEAD_TEMPLATE);

  function handleAddSection () {
    setSections([
      ...sections,
      {
        name: '',
        index: sections.length,
        fields: new Array<TemplateField>,
        extensible: false,
        extensibleGroupName: ''
      }
    ])
  }

  function handleDeleteSection (index:number) {
    setSections(sections.filter( (_, i) => i !== index));
  }

  async function handleCreateLeadTemplate() {
    try {
      const returnVal = await addLeadTemplate({
        variables: {
          name: leadTemplateName,
          sections: JSON.stringify(sections)
        }
      });
      router.push('/leads/templates');
    } catch (err:any) {
      setErrStatus(err.message);
    }
  }

  return (
    <>
      <Navbar />
      <div className='mt-4'>
        <Link className='std-link ml-4' href='/leads/templates'>&larr; Back</Link>
      </div>
      { status === 'authenticated' && session.user.role === 'admin' ?
        <main className="flex flex-col items-top p-4 gap-2">
          <div className='flex justify-between items-center bg-secondaryHighlight rounded-xl p-2 flex-grow gap-2'>
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
              
              <button className='std-button-lite flex items-center gap-2' onClick={handleCreateLeadTemplate}>
                Create
              </button>
            </div>
          </div>
          <div className='flex items-top gap-2'>
          {/* Template Editor */}
            <div id="create-study" className='bg-secondaryHighlight p-4 rounded-xl flex-grow'>
              <h1 className='mb-2'>New Lead Template</h1>
              <div className='flex items-center mb-4 gap-2 justify-between'>
                <div className='flex items-center gap-2'>
                <div className='font-bold'>Template Name:</div>
                <input type='text' className='std-input' name='leadName' value={leadTemplateName} onChange={(e)=>setLeadTemplateName(e.target.value)} />
                </div>
                <button className='std-button-lite flex items-center gap-2' onClick={handleAddSection}><FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>Add Section</button>
              </div>
              <section className='flex flex-col gap-2'>
                <div className='font-bold'>Template Layout:</div>
                  <div className='flex flex-col border border-black rounded-md p-4 my-2 gap-2'>
                    { sections.length > 0 ? 
                      <>
                      {sections.map((section:TemplateSection, index:number) => 
                        <>
                          <LeadTemplateSection key={index} index={index} sections={sections} setSections={setSections} handleDeleteSection={handleDeleteSection} />
                        </>
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
            <div id="create-study" className='bg-secondaryHighlight p-4 rounded-xl flex-grow'>
              <h1 className='mb-2'>Template Preview</h1>
              
            </div>
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