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
import { useRouter } from "next/router";

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
  const router = useRouter();

  if (status !== 'authenticated') {
    router.push('/login');
    return;
  }

  return (
    <>
      <Navbar />
      <div className='mt-4'>
        <Link className='std-link ml-4' href='/leads'>&larr; Back</Link>
      </div>
      <main className='px-4'>
        <div className='flex mt-4 mb-2 gap-2'>
          <Link className="std-button" href="/leads/templates/new"><FontAwesomeIcon icon={faPlus} className="mr-2"></FontAwesomeIcon>New Lead Template</Link>
        </div>
      <div className='flex flex-col mt-4 bg-secondary/20 border border-secondary/80 rounded-lg p-4'>
          <h5>Current Lead Templates:</h5>
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
  );
}