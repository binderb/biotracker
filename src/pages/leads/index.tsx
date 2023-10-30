import Navbar from "@/components/Navbar";
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { initializeApollo, addApolloState } from "../../../utils/apolloClient";
import { GET_CLIENTS, GET_LEADS } from "@/utils/queries";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBriefcase, faCheck, faCircle, faClockRotateLeft, faClone, faCodeCommit, faComment, faComments, faFile, faFileArchive, faFileClipboard, faFileLines, faFilter, faFolderOpen, faMagnifyingGlass, faMagnifyingGlassArrowRight, faPen, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import LeadBlock from "@/components/leads/LeadBlock";
import { ChangeEvent, useEffect, useState } from "react";
import Modal from "@/components/general/Modal";

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
  const leads = await apolloClient.query({
    query: GET_LEADS,
  });
  const clients = await apolloClient.query({
    query: GET_CLIENTS,
  });

  return addApolloState(apolloClient, {
    props: {
      session,
    },
  });

}


export default function LeadManager () {
  
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: leadData, error } = useQuery(GET_LEADS, {
    fetchPolicy:  'cache-only'
  });
  const leads = leadData.getLeads;
  const { data: clientData } = useQuery(GET_CLIENTS);
  const clients = clientData.getClients;
  const [filter, setFilter] = useState('active');
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [filteredLeads, setFilteredLeads] = useState(leads.filter((lead:any)=>lead.status === filter));
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    let newFilteredLeads = leads.filter((lead:any) => (lead.status === filter && lead.name.indexOf(search) > -1));
    console.log('lead clients: ', leads.map((lead:any)=>lead.client));
    newFilteredLeads = clientFilter !== '' ? newFilteredLeads.filter((lead:any)=>lead.client?._id === clientFilter) : newFilteredLeads;
    setFilteredLeads(newFilteredLeads);
  }, [search, filter, clientFilter, leads]);
  
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
          <Link className="std-button" href="/leads/clone"><FontAwesomeIcon icon={faClone} className="mr-2"></FontAwesomeIcon>New Lead from Clone</Link>
          <Link className="std-button" href="/leads/study-plans"><FontAwesomeIcon icon={faBriefcase} className="mr-2"></FontAwesomeIcon>Study Plan Forms</Link>
        </div>
        <div className='flex flex-col mt-4 bg-secondary/20 border border-secondary/80 rounded-lg p-4'>
          <h5>Sales Leads</h5>
          <div className='flex items-center gap-2 pb-4'>
            <div>Showing:</div>
            <select className='std-input' value={filter} onChange={(e)=>setFilter(e.target.value)}>
              <option value='active'>Active</option>
              <option value='inactive'>Inactive</option>
              <option value='completed'>Completed</option>
              <option value='cancelled'>Cancelled</option>
            </select>
            <div>Name Search:</div>
            <input type='text' className='std-input flex-grow' value={search} onChange={(e)=>setSearch(e.target.value)}  />
            <button className='std-button-lite flex gap-2 items-center' onClick={()=>setShowModal(true)}>
              <FontAwesomeIcon icon={faFilter} />
              More Filters...
            </button>
          </div>
          <h5>Results:</h5>
          <ul className='flex flex-col gap-2'>
            {filteredLeads && filteredLeads.length > 0 ? 
              filteredLeads.map((lead:any) => (
                <LeadBlock key={lead._id} lead={lead} />
              ))
              :
              <div>
                No leads match your criteria.
              </div>
            }
          </ul>
        </div>
      </main>
      <Modal showModal={showModal}>
        <div className='flex flex-col items-start gap-2'>
          <h5>More Filters</h5>
          <div className='flex items-center gap-2'>
            <div>Filter by Client:</div>
            <select className='std-input' value={clientFilter} onChange={(e)=>setClientFilter(e.target.value)}>
              <option value=''>-- Choose --</option>
              {clients.map((client:any,index:number)=>(
                <>
                <option value={client._id}>{client.name}</option>
                </>
              ))}
            </select>
          </div>
          <div className='flex w-full justify-end pt-4'>
            <button className='std-button-lite' onClick={()=>setShowModal(false)}>Close</button>
          </div>
          
        </div>
        
      </Modal>
    </>
  );
}