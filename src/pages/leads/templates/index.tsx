import Navbar from "@/components/Navbar";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { addApolloState, initializeApollo } from "../../../../utils/apolloClient";
import { GET_LEAD_TEMPLATES } from "@/utils/queries";
import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faMagnifyingGlass, faPlus } from "@fortawesome/free-solid-svg-icons";

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
  const initialData = await apolloClient.query({
    query: GET_LEAD_TEMPLATES,
  });

  return addApolloState(apolloClient, {
    props: {
      session,
    },
  });

}

export default function LeadTemplateManager () {

  const { data: session, status } = useSession();
  const { data: leadTemplateData, loading } = useQuery(GET_LEAD_TEMPLATES);
  const leadTemplates = leadTemplateData.getLeadTemplates;

  return (
    <>
      <Navbar />
      <div className='mt-4'>
        <Link className='std-link ml-4' href='/leads'>&larr; Back</Link>
      </div>
      { status === 'authenticated' ? 
      <>
        <main className='px-4'>
          <div className='flex mt-4 mb-2 gap-2'>
            <Link className="std-button" href="/leads/templates/new"><FontAwesomeIcon icon={faPlus} className="mr-2"></FontAwesomeIcon>New Lead Template</Link>
          </div>
        <div className='flex flex-col mt-4 bg-secondaryHighlight rounded-md p-4'>
            <div className='font-bold mb-4'>Current Lead Templates:</div>
            <ul className='flex flex-col gap-2'>
              {leadTemplates.length > 0 ? 
                leadTemplates.map((template:any) => (
                  <li key={template._id} className='std-input rounded-md flex justify-between items-center'>
                    {template.name}
                    <div className='flex gap-2'>
                      <Link href={{pathname: '/leads/edit/[id]', query: { id: template._id }}} as={`/leads/edit/${template._id}`} className='std-button-lite' ><FontAwesomeIcon icon={faMagnifyingGlass}/></Link>
                    </div>
                  </li>
                ))
                :
                <div>
                  No templates yet.
                </div>
              }
            </ul>
          </div>
        </main>
      </>
      :
      <>
        <main className="flex items-top p-4">
          Please login to view this content.
        </main>
      </>
      }
    </>
  );
}