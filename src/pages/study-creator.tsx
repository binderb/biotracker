import { GET_CLIENT_CODES, GET_NEXT_STUDY } from '@/utils/queries'
import { ADD_STUDY, CREATE_DRIVE_STUDY_TREE } from '@/utils/mutations';
import { initializeApollo, addApolloState } from '../../utils/apolloClient'
import { useQuery, useMutation } from '@apollo/client'
import Navbar from '@/components/Navbar';
import { useState, ChangeEvent, useEffect } from 'react';
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
    query: GET_CLIENT_CODES,
  });

  return addApolloState(apolloClient, {
    props: {
      session,
    },
  });

}

const StudyCreator = () => {

  const { data: session, status } = useSession();
  const { data: clientData } = useQuery(GET_CLIENT_CODES);
  
  const [addStudy, { error, data : newStudyData }] = useMutation(ADD_STUDY, {
    refetchQueries: [{query: GET_NEXT_STUDY}, 'GetNextStudy']
  });
  const [createDriveStudyTree, { data : driveTreeResponse }] = useMutation(CREATE_DRIVE_STUDY_TREE);
  const clientCodes = clientData.getClientCodes;
  const [clientCode, setClientCode] = useState('');
  const [studyType, setStudyType] = useState('');
  const [nextStudy, setNextStudy] = useState(1);
  const [creatorStatus, setCreatorStatus] = useState('');
  const [creatorStep, setCreatorStep] = useState(1);
  const { data: nextStudyData } = useQuery(GET_NEXT_STUDY, {
    variables: {
      clientCode: clientCode
    }
  });
  // console.log(nextStudyData);

  useEffect (() => {
    console.log('updating nextStudy!');
    setNextStudy(nextStudyData?.getNextStudy);
  },[nextStudyData]);

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
    // let folderTree = "Folder structure to be generated: \n";
    // folderTree += 'Studies/\n';
    // folderTree += ' |—'+clientCode + '/\n';
    // folderTree += '    |—'+clientCode + '00' + nextStudy + '-' + studyType + "/\n";
    // folderTree += '      |—Data/\n';
    // folderTree += '      |—Forms/\n';
    // folderTree += '         |—Specimen and Accessory Product Usage Form\n';
    // folderTree += '         |—Chain of Custody Form\n';
    // folderTree += '      |—Protocol/\n';
    // folderTree += '      |—Quote/\n';
    setCreatorStatus('Creating file tree in Google Drive...');
    const studyFullName = `${clientCode}${nextStudy.toString().padStart(3,'0')}-${studyType}`;
    try {
      const treeResult = await createDriveStudyTree({
        variables: {
          clientCode: clientCode,
          studyName: studyFullName
        }
      });    
    } catch (err:any) {
      setCreatorStatus(err.message);
      return;
    }
    setCreatorStatus('Updating database...');
    try {
      const newStudy = await addStudy({
        variables: {
          clientCode: clientCode,
          studyIndex: nextStudy,
          studyType: studyType
        }
      });
      setCreatorStatus(`Completed adding new study: ${studyFullName}`);
      setCreatorStep(3);      
    } catch (err:any) {
      setCreatorStatus(err.message);
    }
  }

  function handleChangeStep (delta:number) {
    const newCreatorStep = creatorStep + delta;
    if (newCreatorStep === 1 || newCreatorStep === 2) setCreatorStatus('');
    if (newCreatorStep === 2 && (!clientCode || !nextStudy || !studyType)) {
      setCreatorStatus('Please select a value for all fields before proceeding!');
      return;
    }
    setCreatorStep(newCreatorStep);
  }

  return (
    <>
      <Navbar/>
      { status === 'authenticated' ?
      <main className="flex items-top p-4">
        <div id="create-study" className='bg-secondaryHighlight p-4 rounded-xl flex-grow'>
          <h1 className='mb-2'>Create New Study</h1>
          { (creatorStep === 1) &&
            <section id='step-1'>
            <h2 className='mb-2'>Basic Setup (Step 1 of 2)</h2>
            <div className='flex items-center mb-2'>
              <div className='mr-2'>Client Code:</div>
              <select className='bg-[#ffffff88] p-2' onChange={handleClientChange} value={clientCode}>
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
              <select className='bg-[#ffffff88] p-2' onChange={handleStudyTypeChange} value={studyType}>
                <option value=''>-- Choose --</option>
                <option value='HU'>HU - Human Cadaver</option>
                <option value='IVT'>IVT - In Vitro</option>
                <option value='INT'>INT - Animal Interventional</option>
                <option value='SUR'>SUR - Animal Surgical</option>
              </select>
            </div>
            <button className='std-button' onClick={() => handleChangeStep(1)}>Next</button>
            <div className='my-2 text-[#800] whitespace-pre font-mono'>{creatorStatus}</div>          
            </section>
          }
          { (creatorStep === 2) && 
            <section id='step-2'>
              <h2 className='mb-2'>Add Documents (Step 2 of 2)</h2>
              <div className='flex items-center mb-2'>
                <div className='mr-2'>Study Designation:</div>
                <div className='font-mono'>{ ( clientCode && nextStudy && studyType ) ? `${clientCode}${nextStudy.toString().padStart(3,'0')}-${studyType}` : 'Missing Information!'}</div>
              </div>
              <div className='flex flex-col mb-2'>
                <div className='mb-2'>Prepopulate Study Description:</div>
                <textarea className='resize-none h-[100px] bg-[#FFFFFF88] p-2' placeholder='Add study description...'></textarea>
              </div>
              <div className='flex items-center mb-4'>
                <div className='mr-2'>Add Forms:</div>
                <select className='bg-[#ffffff88] p-2' onChange={handleStudyTypeChange}>
                  <option value=''>{`Standard forms for ${studyType} study`}</option>
                </select>
              </div>
              <button className='std-button mr-1' onClick={() => handleChangeStep(-1)}>Back</button>
              {/* <button className='std-button' onClick={() => handleChangeStep(1)}>Next</button> */}
              <button className='std-button' onClick={handleSubmitNewStudy}>Submit</button>
              <div className='my-2 text-[#800] whitespace-pre font-mono'>{creatorStatus}</div>          
            </section>
          }
          { (creatorStep === 3) && 
            <section id='step-3'>
              <div className='mb-4'>{creatorStatus}</div>
              <button className='std-button mr-1' onClick={() => handleChangeStep(-2)}>Start Over</button>
            </section>
          }
        </div>
      </main>
      :
      <main className='p-4'>
        Please login to view this content.
      </main>
      }
    </>
  )
}

export default StudyCreator;