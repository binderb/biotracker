import Navbar from "@/components/Navbar";
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { initializeApollo, addApolloState } from "../../../utils/apolloClient";
import { GET_LEADS } from "@/utils/queries";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBriefcase, faCircle, faClockRotateLeft, faCodeCommit, faComment, faComments, faFile, faFileArchive, faFileClipboard, faFileLines, faFolderOpen, faMagnifyingGlass, faMagnifyingGlassArrowRight, faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import Link from "next/link";
import { useQuery } from "@apollo/client";
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
    query: GET_LEADS,
  });

  return addApolloState(apolloClient, {
    props: {
      session,
    },
  });

}


export default function LeadManager () {

  const { data: session, status } = useSession();
  const { data: leadData, error } = useQuery(GET_LEADS, {
    fetchPolicy:  'cache-only'
  });
  const router = useRouter();
  const leads = leadData.getLeads;
  console.log(session?.user.id)
  console.log(leads.map((lead:any) => lead.drafters.map((drafter:any) => drafter._id).indexOf(session?.user.id)));

  if (status !== 'authenticated') {
    router.push('/login');
    return;
  }

  return (
    <>
      <Navbar/>
      <main className="flex flex-col p-4">
        <div className='flex mt-2 mb-2 gap-2'>
          <Link className="std-button" href="/leads/new"><FontAwesomeIcon icon={faPlus} className="mr-2"></FontAwesomeIcon>New Lead</Link>
          <Link className="std-button" href="/leads/study-plans"><FontAwesomeIcon icon={faBriefcase} className="mr-2"></FontAwesomeIcon>Study Plan Forms</Link>
        </div>
        <div className='flex flex-col mt-4 bg-secondary/20 border border-secondary/80 rounded-lg p-4'>
          <h5>Current Leads:</h5>
          <ul className='flex flex-col gap-2'>
            {leads && leads.filter((lead:any) => lead.drafters.map((drafter:any) => drafter._id).indexOf(session.user.id) > -1).length > 0 ? 
              leads.map((lead:any) => (
                  lead.drafters.map((drafter:any)=>drafter._id).indexOf(session.user.id) > -1 ? 
                  <li key={lead._id} className='std-input rounded-lg flex justify-between items-center'>
                    {lead.name}
                    <div className='flex gap-2'>
                      { lead.status === 'active' &&
                        <div className='flex items-center bg-secondary/80 rounded-md text-white px-2 gap-2'>
                          <FontAwesomeIcon className='text-green-400' icon={faCircle} size='2xs' />
                          Active
                        </div>
                      }
                      { lead.status === 'inactive' &&
                        <div className='flex items-center bg-secondary/80 rounded-md text-white px-2 gap-2'>
                          <FontAwesomeIcon className='text-gray-300' icon={faCircle} size='2xs' />
                          Inactive
                        </div>
                      }
                      <div className='flex items-center bg-secondary/80 rounded-md text-white px-2 gap-2'>
                        <FontAwesomeIcon icon={faComment} />
                        {lead.notes.length}
                      </div>
                      <div className='flex items-center bg-secondary/80 rounded-md text-white px-2 gap-2'>
                        <FontAwesomeIcon icon={faCodeCommit} />
                        {lead.revisions.length}
                      </div>
                      <Link href={{pathname: '/leads/edit/[id]', query: { id: lead._id }}} as={`/leads/edit/${lead._id}`} className='std-button-lite' ><FontAwesomeIcon icon={faMagnifyingGlass}/></Link>
                    </div>
                  </li>
                  :
                  null
                
              ))
              :
              <div>
                No leads yet.
              </div>
            }
          </ul>
        </div>
      </main>
    </>
  );
}