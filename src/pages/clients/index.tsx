import { GET_CLIENTS, GET_NEW_CODE } from '@/utils/queries'
import { ADD_CLIENT } from '@/utils/mutations';
import { initializeApollo, addApolloState } from '../../../utils/apolloClient'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import Navbar from '@/components/Navbar';
import { useState, ChangeEvent, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { useRouter } from 'next/router';

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

const ClientManager = () => {

  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: clientData } = useQuery(GET_CLIENTS);
  const clients = clientData.getClients;
  const [clientList, setClientList] = useState(clients);
  const [getCode, { data: newCodeData }] = useLazyQuery(GET_NEW_CODE, {
    fetchPolicy: 'network-only'
  });
  const [addClient, { error, data : newClientData }] = useMutation(ADD_CLIENT, {
    refetchQueries: [{query: GET_CLIENTS}]
  });

  const [clientName, setClientName] = useState('');
  const [errStatus, setErrStatus] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    if (clientName.trim().length > 0) {
      const regex = new RegExp(`${clientName}`,'gi');
      const filteredList = clients.filter((e:Client) => (e.name.match(regex) || e.code.match(regex)));
      setClientList(filteredList);
    } else {
      setClientList(clients);
    }
  },[clients, clientName]);

  interface Client {
    _id: string,
    name: string,
    code: string
  }

  function handleNameChange (e:ChangeEvent<HTMLInputElement>) {
    setClientName(e.target.value)
  }

  async function handleGenerateNewCode () {
    try {
      const codeResponse = await getCode();
      setCode(codeResponse?.data.getNewCode);
    } catch (err:any) {
      setErrStatus(err.message);
    }
  }

  async function handleSubmitNewClient () {
    try {
      const newClient = await addClient({
        variables: {
          name: clientName,
          code: code
        }
      });
      setErrStatus('');
      setClientName('');
      setCode('');
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
      <Navbar/>
      { status === 'authenticated' ?
      <main className="grid grid-cols-12 items-top p-4 gap-2">
        <div id="client-table" className='flex flex-col col-span-8 bg-secondary/20 border border-secondary/80 p-4 rounded-xl flex-grow'>
          <h5>Client Table</h5>
          {clientList.length > 0  &&
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr>
                  <th className='w-[50%]'>Client</th>
                  <th className='w-[50%]'>Code</th>
                </tr>
              </thead>
              <tbody>
              {clientList.map((client:Client) => 
                <tr key={client._id}>
                  <td className='bg-white/50 border border-secondary/80 p-1'>{client.name}</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>{client.code}</td>
                </tr>
              )}
              </tbody>
            </table>
          }
          {clientList.length === 0 &&
            <>
            <div className='mb-2 font-bold'>No clients matched your search.</div>
            <div>To add this client to the database, provide a unique 3-letter code and click <b>Add Client</b>.</div>
            </>
          }
        </div>
        <div id="client-creator" className='flex flex-col col-span-4 gap-2 bg-secondary/20 border border-secondary/80 p-4 rounded-xl'>
          <h5>{(session.user.role === 'admin' || session.user.role === 'dev') ? (
              <>Search or Add Clients</>
            ):(
              <>Search Clients</>
            )}
          </h5>
          <div className='flex gap-2 items-center'>
            <div className='mr-2'>Client Name:</div>
            <input className='std-input flex-1' value={clientName} onChange={handleNameChange} />
          </div>
          {(session.user.role === 'admin' || session.user.role === 'dev') ? (
              <>
              <div className='flex gap-2 items-center'>
                <div className='mr-2'>Code:</div>
                <input className='std-input font-mono uppercase' size={3} maxLength={3} value={code} onChange={(e)=>setCode(e.target.value)} />
                <button className='std-button-lite flex-1' onClick={handleGenerateNewCode}>Generate</button>
              </div>
              <div className='flex gap-2 items-center'>
                <button className='std-button-lite flex-1' onClick={handleSubmitNewClient}>Add Client</button>
              </div>
              </>
            ):(
              <>
              </>
            )}
          
          <div className='my-2 text-[#800]'>{errStatus}</div>
        </div>
      </main>
      :
      <main className='p-4'>
        {`It looks like you aren't authorized to view this page (admin access only). If you think this is an error, please contact your system administrator.`}
      </main>
      }
    </>
  )
}

export default ClientManager;