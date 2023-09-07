import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { addApolloState, initializeApollo } from "../../../utils/apolloClient";
import { GET_LEADS } from "@/utils/queries";
import { useRouter } from "next/router";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBomb, faCheck, faCircle, faCircleRadiation, faCodeCommit, faComment, faMagnifyingGlass, faRadiation, faRadiationAlt, faSkullCrossbones, faTrashCan, faX } from "@fortawesome/free-solid-svg-icons";
import { getFormattedDate } from "@/utils/helpers";
import { useState } from "react";
import { ADMIN_DELETE_LEAD } from "@/utils/mutations";

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

export default function LeadMasterList () {

  const router = useRouter();
  const { data: leadData } = useQuery(GET_LEADS);
  const leads = leadData.getLeads;
  const { data: session, status } = useSession();

  const [showDelete, setShowDelete] = useState(false);
  const [leadIdToDelete, setLeadIdToDelete] = useState('');
  const [deleteErrStatus, setDeleteErrStatus] = useState('');
  const [adminDeleteLead] = useMutation(ADMIN_DELETE_LEAD, {refetchQueries:[GET_LEADS]});

  if (status !== 'authenticated') {
    router.push('/login');
    return;
  } else if (session.user.role !== 'dev') {
    return (
      <>
        <Navbar />
        <main className='p-4'>
          {`It looks like you aren't authorized to view this page (dev access only). If you think this is an error, please contact your system administrator.`}
        </main>
      </>
    );
  }

  async function handleDelete () {
    try {
      await adminDeleteLead({
        variables: {
          leadId: leadIdToDelete
        }
      });
      setShowDelete(false);

    } catch (err:any) {
      setDeleteErrStatus(JSON.stringify(err));
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex flex-col p-4">
        {/* <div className='flex mt-2 mb-2 gap-2'>
          <Link className="std-button" href="/leads/new"><FontAwesomeIcon icon={faPlus} className="mr-2"></FontAwesomeIcon>New Lead</Link>
          <Link className="std-button" href="/leads/clone"><FontAwesomeIcon icon={faClone} className="mr-2"></FontAwesomeIcon>New Lead from Clone</Link>
          <Link className="std-button" href="/leads/study-plans"><FontAwesomeIcon icon={faBriefcase} className="mr-2"></FontAwesomeIcon>Study Plan Forms</Link>
        </div> */}
        <div className='flex flex-col mt-4 bg-secondary/20 border border-secondary/80 rounded-lg p-4'>
          <h5>Lead Master List:</h5>
          <ul className='flex flex-col gap-2'>
            {leads && 
              leads.map((lead:any) => ( 
                <li key={lead._id} className='std-input rounded-lg flex justify-between items-top'>
                  <div className='flex flex-col gap-1'>
                    <div className='flex flex-col'>
                    <div className='font-bold'>{lead.name}</div>
                      <div className='text-[12px]'>{`Created: ${getFormattedDate(lead.revisions[0].createdAt)}`}</div>
                      <div className='text-[12px]'>{`Latest Revision: ${getFormattedDate(lead.revisions[lead.revisions.length-1].createdAt)}`}</div>
                      <div className='text-[12px]'>{`Author: ${lead.author.username}`}</div>
                      <div className='text-[12px]'>{`Drafters: ${
                    lead.drafters.map((drafter:any) => `${drafter.username}`).join(', ')
                  }`}</div>
                      <div className='text-[12px]'>{`Published: ${lead.published}`}</div>
                      <div className='text-[12px]'>{`Studies: ${lead.studies.length > 0 ?
                    lead.studies.map((study:any) => `${lead.client.code}${study.index.toString().padStart(4,'0')}-${study.type}`).join(', ')
                    :
                    `N/A`
                  }`}</div>
                    </div>
                    
                    
                  </div>
                  <div>
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
                      { lead.status === 'completed' &&
                        <div className='flex items-center bg-secondary/80 rounded-md text-white px-2 gap-2'>
                          <FontAwesomeIcon className='text-gray-300' icon={faCheck} />
                          Completed
                        </div>
                      }
                      { lead.status === 'cancelled' &&
                        <div className='flex items-center bg-secondary/80 rounded-md text-white px-2 gap-2'>
                          <FontAwesomeIcon className='text-gray-300' icon={faX} size='xs' />
                          Cancelled
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
                      <button className='danger-button-lite' onClick={()=>{setLeadIdToDelete(lead._id);setShowDelete(true);}}><FontAwesomeIcon icon={faBomb}/></button>
                    </div>
                  </div>
                </li>
              ))
            }
            {!leads &&
              <div>
                No leads yet.
              </div>
            }
          </ul>
        </div>
        <section className={`fixed ${showDelete ? `grid` : `hidden`} grid-cols-12 items-start pt-[5vh] bg-black/50 w-screen h-screen top-0 left-0`}>
          <section className='flex bg-white rounded-lg p-0 col-start-2 col-span-10 md:col-start-3 md:col-span-8 lg:col-start-4 lg:col-span-6'>
            <section className='flex flex-col p-4 bg-secondary/20 rounded-lg w-full gap-2'>
              <h5>Are You Sure?</h5>
              <section className='flex flex-col justify-center mb-4'>
                <div>
                  Confirming this option will permanently delete all the following records from the database, effectively purging the selected lead and its associated from the system:
                  <ul className='pl-8 mr-4 py-2 list-disc'>
                    <li>The top-level <b>Lead</b> document.</li>
                    <li>All associated <b>Lead Revision</b> documents.</li>
                    <li>All associated <b>Lead Note</b> documents.</li>
                    <li>All associated <b>Study</b> documents. This necessarily allows newly-created studies in a subsequent lead to use the deleted studies&apos; ID index numbers again, but this will only occur if the deleted studies have the highest index numbers for a given client. Files created by the system are not deleted by choosing this option and should be removed manually as soon as possible.</li>
                  </ul>
                  <b>THIS OPTION SHOULD NOT BE USED unless a lead was created by mistake.</b> Better methods for archiving leads exist, such as setting the lead status to <b>inactive</b>.
                </div>
              </section>
              <div className='flex gap-2'>
                <button className='secondary-button-lite flex-grow' onClick={() => {setDeleteErrStatus(''); setShowDelete(false); setLeadIdToDelete(''); }}>
                  Cancel
                </button>
                <button className='danger-button-lite flex-grow' onClick={handleDelete}>
                  Permanently Delete Lead
                </button>
              </div>
              <div className='text-[#800]'>{deleteErrStatus}</div>
            </section>
          </section>
        </section>
      </main>
      
    </>
  );

}