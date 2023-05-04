import Navbar from "@/components/Navbar";
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { initializeApollo, addApolloState } from "../../../utils/apolloClient";
import { GET_CLIENTS } from "@/utils/queries";
import { useSession } from "next-auth/react";
import { ChangeEvent, useState } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";

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
    query: GET_CLIENTS,
  });

  return addApolloState(apolloClient, {
    props: {
      session,
    },
  });

}


export default function LeadManager () {

  const { data: session, status } = useSession();
  const { data: clientData } = useQuery(GET_CLIENTS);
  const clients = clientData.getClients;
  const [creatorStep, setCreatorStep] = useState(1);
  const [errStatus, setErrStatus] = useState('');
  const [client, setClient] = useState('');
  const [leadName, setLeadName] = useState('');

  function handleUpdateLeadName (e:ChangeEvent<HTMLInputElement>) {
    setLeadName(e.target.value);
  }

  function handleClientChange (e:ChangeEvent<HTMLSelectElement>) {
    setClient(e.target.value);
  }

  function handleChangeStep (delta:number) {
    const newCreatorStep = creatorStep + delta;
    if (newCreatorStep === 1 || newCreatorStep === 2) setErrStatus('');
    // if (newCreatorStep === 2 && (!clientCode || !nextStudy || !studyType)) {
    //   setErrStatus('Please select a value for all fields before proceeding!');
    //   return;
    // }
    setCreatorStep(newCreatorStep);
  }

  function handleSubmitNewLead () {

  }

  interface Client {
    _id: string,
    name: string,
    code: string
  }

  return (
    <>
      <Navbar/>
      { status === 'authenticated' && session.user.role === 'admin' ?
        <main className="flex items-top p-4">
          <div id="create-study" className='bg-secondaryHighlight p-4 rounded-xl flex-grow'>
          <h1 className='mb-2'>Create New Lead</h1>
          { (creatorStep === 1) &&
            <section id='step-1'>
            <h2 className='mb-2'>Basic Setup (Step 1 of 3)</h2>
            <div className='flex items-center mb-4'>
              Choose a name for your draft lead and specify the client. The name is only used for identification on the draft dashboard, and the lead will be given a permanent ID when it is finalized and converted into a study. The client ID will be permanently associated with this draft and cannot be changed.
            </div>
            <div className='flex items-center mb-2'>
              <div className='mr-2'>Draft Name:</div>
              <input type='text' className='std-input' name='leadName' value={leadName} onChange={handleUpdateLeadName} />
            </div>
            <div className='flex items-center mb-2'>
              <div className='mr-2'>Client:</div>
              <select className='bg-[#ffffff88] p-2 mr-2' onChange={handleClientChange} value={client}>
                <option value=''>-- Choose --</option> 
                {clients.map( (client:Client) => 
                  <option value={client.code} key={client.code}>{`${client.name} - ${client.code}`}</option>  
                )}
              </select>
              <div>Don&apos;t have a client code? <Link className='std-link' href='/client-manager'>Create one</Link> before starting this process!</div>
            </div>
            <div className='flex items-center mb-2'>
              <div className='mr-2'>Who should be included in the drafting process?</div>
            </div>
            <button className='std-button' onClick={() => handleChangeStep(1)}>Next</button>
            <div className='my-2 text-[#800] whitespace-pre font-mono'>{errStatus}</div>          
            </section>
          }
          { (creatorStep === 2) &&
            <section id='step-2'>
              <h2 className='mb-2'>Add Details (Step 2 of 3)</h2>
              <div className='flex items-center mb-4'>
                Use the form below to add whatever details are known about the lead. These fields can be edited later by you and your drafting team, so just include the information you currently have. 
              </div>
              <form>
                <section>
                  <div className='mr-2 font-bold'>Sponsor Information:</div>
                  <div className='flex border border-black rounded-md items-center p-4 mt-2 mb-4'></div>
                </section>
                <section>
                  <div className='mr-2 font-bold'>Purpose of Study:</div>
                  <div className='flex border border-black rounded-md items-center p-4 mt-2 mb-4'></div>
                </section>
                <section>
                  <div className='mr-2 font-bold'>Test Article Information:</div>
                  <div className='flex border border-black rounded-md items-center p-4 mt-2 mb-4'></div>
                </section>
                <section>
                  <div className='mr-2 font-bold'>Control Article Information:</div>
                  <div className='flex border border-black rounded-md items-center p-4 mt-2 mb-4'></div>
                </section>
                <section>
                  <div className='mr-2 font-bold'>Ancillary Product(s) Information:</div>
                  <div className='flex border border-black rounded-md items-center p-4 mt-2 mb-4'></div>
                </section>
                <section>
                  <div className='mr-2 font-bold'>Test System Information:</div>
                  <div className='flex border border-black rounded-md items-center p-4 mt-2 mb-4'></div>
                </section>
                <section>
                  <div className='mr-2 font-bold'>Methods:</div>
                  <div className='flex border border-black rounded-md items-center p-4 mt-2 mb-4'></div>
                </section>
                <section>
                  <div className='mr-2 font-bold'>Special Instructions:</div>
                  <div className='flex border border-black rounded-md items-center p-4 mt-2 mb-4'></div>
                </section>

              </form>
              <button className='std-button mr-1' onClick={() => handleChangeStep(-1)}>Back</button>
              <button className='std-button' onClick={() => handleChangeStep(1)}>Next</button>
              {/* <button className='std-button' onClick={handleSubmitNewStudy}>Submit</button> */}
              <div className='my-2 text-[#800] whitespace-pre font-mono'>{errStatus}</div>          
            </section>
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
              
              <button className='std-button mr-1' onClick={() => handleChangeStep(-1)}>Back</button>
              {/* <button className='std-button' onClick={() => handleChangeStep(1)}>Next</button> */}
              <button className='std-button' onClick={handleSubmitNewLead}>Submit</button>
              <div className='my-2 text-[#800] whitespace-pre font-mono'>{errStatus}</div>          
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