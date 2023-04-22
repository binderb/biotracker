import { GET_CLIENT_CODES, GET_NEXT_STUDY } from '@/utils/queries'
import { ADD_STUDY } from '@/utils/mutations';
import { initializeApollo, addApolloState } from '../../utils/apolloClient'
import { useQuery, useMutation } from '@apollo/client'
import Navbar from '@/components/Navbar';
import { useState, ChangeEvent, useEffect } from 'react';

export async function getServerSideProps () {
  const apolloClient = initializeApollo();
  await apolloClient.resetStore();
  
  const initialData = await apolloClient.query({
    query: GET_CLIENT_CODES,
  });

  return addApolloState(apolloClient, {
    props: {},
  });
}

const StudyCreator = () => {

  const { data: clientData } = useQuery(GET_CLIENT_CODES);
  
  const [addStudy, { error, data : newStudyData }] = useMutation(ADD_STUDY, {
    refetchQueries: [{query: GET_NEXT_STUDY}]
  });
  const clientCodes = clientData.getClientCodes;
  const [clientCode, setClientCode] = useState('');
  const [studyType, setStudyType] = useState('');
  const [nextStudy, setNextStudy] = useState(1);
  const [creatorStatus, setCreatorStatus] = useState('');
  const { data: nextStudyData } = useQuery(GET_NEXT_STUDY, {
    variables: {
      clientCode: clientCode
    }
  });
  // console.log(nextStudyData);

  useEffect (() => {
    console.log('updating nextStudy!');
    setNextStudy(nextStudyData?.getNextStudy);
  });

  interface Client {
    code: string
  }

  function handleClientChange (e:ChangeEvent<HTMLSelectElement>) {
    setClientCode(e.target.value);
  }
  function handleStudyTypeChange (e:ChangeEvent<HTMLSelectElement>) {
    setStudyType(e.target.value);
  }

  async function handleSubmitNewStudy () {
    let folderTree = "Folder structure to be generated: \n";
    folderTree += 'Studies/\n';
    folderTree += ' |—'+clientCode + '/\n';
    folderTree += '    |—'+clientCode + '00' + nextStudy + '-' + studyType + "/\n";
    folderTree += '      |—Data/\n';
    folderTree += '      |—Forms/\n';
    folderTree += '         |—Specimen and Accessory Product Usage Form\n';
    folderTree += '         |—Chain of Custody Form\n';
    folderTree += '      |—Protocol/\n';
    folderTree += '      |—Quote/\n';
    setCreatorStatus(folderTree);
    try {
      const newStudy = await addStudy({
        variables: {
          clientCode: clientCode,
          studyIndex: nextStudy,
          studyType: studyType
        }
      });
      // setCreatorStatus('')      
    } catch (err:any) {
      setCreatorStatus(err.message);
    }
  }

  return (
    <>
      <Navbar/>
      <main className="flex items-top p-4">
        <div id="client-table" className='bg-secondaryHighlight p-4 rounded-xl flex-grow'>
          <h1 className='mb-2'>Create New Project</h1>
          <div className='flex items-center mb-2'>
            <div className='mr-2'>Client Code:</div>
            <select className='bg-[#ffffff88] p-2' onChange={handleClientChange}>
              <option value=''>-- Choose --</option> 
              {clientCodes.map( (client:Client) => 
                <option value={client.code} key={client.code}>{client.code}</option>  
              )}
            </select>
          </div>
          <div className='flex items-center mb-2'>
            <div className='mr-2'>Study Index (automatically generated):</div>
            <div className='font-mono'>{nextStudy ? '00'+nextStudy : '(Choose a client)'}</div>
          </div>
          <div className='flex items-center mb-2'>
            <div className='mr-2'>Study Type Code:</div>
            <select className='bg-[#ffffff88] p-2' onChange={handleStudyTypeChange}>
              <option value=''>-- Choose --</option>
              <option value='HU'>HU - Human Cadaver</option>
              <option value='IVT'>IVT - In Vitro</option>
              <option value='INT'>INT - Animal Interventional</option>
              <option value='SUR'>SUR - Animal Surgical</option>
            </select>
          </div>
          <button className='std-button' onClick={handleSubmitNewStudy}>Submit</button>
          <div className='my-2 text-[#800] whitespace-pre font-mono'>{creatorStatus}</div>
        </div>
      </main>
    </>
  )
}

export default StudyCreator;