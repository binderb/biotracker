import { GET_CLIENT_CODES } from '@/utils/queries'
import { ADD_CLIENT } from '@/utils/mutations';
import { initializeApollo, addApolloState } from '../../utils/apolloClient'
import { useQuery, useMutation } from '@apollo/client'
import Navbar from '@/components/Navbar';
import { useState, ChangeEvent } from 'react';

export async function getServerSideProps () {
  const apolloClient = initializeApollo();
  
  const initialData = await apolloClient.query({
    query: GET_CLIENT_CODES,
  });

  return addApolloState(apolloClient, {
    props: {},
  });
}

const ProjectCreator = () => {

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
      setCreatorStatus('')      
    } catch (err:any) {
      setCreatorStatus(err.message);
    }
  }

  return (
    <>
      <Navbar/>
      <main className="flex items-top p-4">
        <div id="client-table" className='bg-secondaryHighlight p-4 rounded-xl flex-grow'>
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
    </>
  )
}

export default ProjectCreator;