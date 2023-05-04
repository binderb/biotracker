import { GET_CLIENTS } from '@/utils/queries'
import { ADD_CLIENT } from '@/utils/mutations';
import { initializeApollo, addApolloState } from '../../utils/apolloClient'
import { useQuery, useMutation } from '@apollo/client'
import Navbar from '@/components/Navbar';
import { useState, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';

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
  console.log('initializing apollo');
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

  const { data: session, status } = useSession();
  const { data: clientData } = useQuery(GET_CLIENTS);
  const [addClient, { error, data : newClientData }] = useMutation(ADD_CLIENT, {
    refetchQueries: [{query: GET_CLIENTS}]
  });
  const clients = clientData.getClients;

  const [clientName, setClientName] = useState('');
  const [creatorStatus, setCreatorStatus] = useState('');

  interface Client {
    _id: string,
    name: string,
    code: string
  }

  function handleNameChange (e:ChangeEvent<HTMLInputElement>) {
    setClientName(e.target.value)
  }

  async function handleSubmitNewClient () {
    try {
      const newClient = await addClient({
        variables: {
          name: clientName
        }
      });
      setCreatorStatus('');
    } catch (err:any) {
      setCreatorStatus(err.message);
    }
  }

  return (
    <>
      <Navbar/>
      { status === 'authenticated' && session.user.role === 'admin' ?
      <main className="flex items-top p-4">
        <div id="client-table" className='mr-1 bg-secondaryHighlight p-4 rounded-xl flex-grow'>
          <h1>Client Table</h1>
          <table className='w-full text-left border-separate'>
            <thead>
              <tr>
                <th className='w-[50%]'>Client</th>
                <th className='w-[50%]'>Code</th>
              </tr>
            </thead>
            <tbody>
            {clients.map((client:Client) => 
              <tr key={client._id}>
                <td className='bg-[#FFFFFF88] p-1'>{client.name}</td>
                <td className='bg-[#FFFFFF88] p-1'>{client.code}</td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
        <div id="client-creator" className='ml-1 bg-secondaryHighlight p-4 rounded-xl'>
          <h1 className='mb-2'>Client Creator</h1>
          <div className='flex items-center'>
            <div className='mr-2'>Client Name:</div>
            <input className='mr-2 p-2 bg-[#FFFFFF88]' value={clientName} onChange={handleNameChange} />
            <button className='std-button' onClick={handleSubmitNewClient}>Add Client</button>
          </div>
          <div className='my-2 text-[#800]'>{creatorStatus}</div>
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