import Navbar from '@/components/Navbar';
import { AUTHORIZE_GOOGLE_DRIVE, DELETE_GOOGLE_DRIVE_CONFIG, SAVE_GOOGLE_DRIVE_CONFIG, TEST_GOOGLE_DRIVE } from '@/utils/mutations';
import { useMutation, useQuery } from '@apollo/client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { GET_GOOGLE_DRIVE_CONFIG } from '@/utils/queries';
import { addApolloState, initializeApollo } from '../../../utils/apolloClient';

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
    query: GET_GOOGLE_DRIVE_CONFIG,
  });

  return addApolloState(apolloClient, {
    props: {
      session,
    },
  });

}

// This gets handled by the [...nextauth] endpoint
export default function UserManager () {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appStatus, setAppStatus] = useState('');
  const [authorizeGoogleDrive, {data: authorizeResponse }] = useMutation(AUTHORIZE_GOOGLE_DRIVE);
  const [testGoogleDrive, {data: testResponse}] = useMutation(TEST_GOOGLE_DRIVE);
  const [saveGoogleDriveConfig, {data: saveResponse}] = useMutation(SAVE_GOOGLE_DRIVE_CONFIG, {
    refetchQueries: [{query: GET_GOOGLE_DRIVE_CONFIG}]
  })
  const [deleteGoogleDriveConfig, {data: deleteResponse}] = useMutation(DELETE_GOOGLE_DRIVE_CONFIG, {
    refetchQueries: [{query: GET_GOOGLE_DRIVE_CONFIG}]
  });
  const {data: configData} = useQuery(GET_GOOGLE_DRIVE_CONFIG);
  const config = configData.getGoogleDriveConfig;
  const [path, setPath] = useState(config?.studiesPath || '');
  const [drive, setDrive] = useState(config?.studiesDriveName || '');
  
  if (status !== 'authenticated') {
    router.push('/login');
    return;
  }

  async function handleAuthClick () {
    try {
      const authUrlResponse = await authorizeGoogleDrive();
      const authUrl:string = authUrlResponse.data.authorizeGoogleDrive;
      if (authUrl === 'already_authorized') {
        throw new Error('App is already authorized.');
      }
      window.location.replace(authUrl);
    } catch (err:any) {
      setAppStatus(err.message);
    }
  }

  async function handleTestClick () {
    try {
      const response = await testGoogleDrive({
        variables: {
          drive: drive,
          path: path
        }
      });
      const files = JSON.parse(response.data.testGoogleDrive);
      console.log(files);
      setAppStatus(`Directory contents:\n${files.join('\n')}`)
    } catch (err:any) {
      setAppStatus(`Error: ${err.message}`);
    }
  }

  async function handleSave () {
    try {
      await saveGoogleDriveConfig({
        variables: {
          studiesDriveName: drive,
          studiesPath: path
        }
      });
      setAppStatus('');
    } catch (err:any) {
      setAppStatus(`Error: ${err.message}`)
    }
  }

  async function handleDisconnectClick () {
    try {
      const response = await deleteGoogleDriveConfig();
      setAppStatus('');
    } catch (err:any) {
      setAppStatus(`Error: ${err.message}`);
    }
  }

  return (
    <>
      <Navbar />
      <div className='mt-4'>
        <Link className='std-link ml-4' href='/settings'>&larr; Back</Link>
      </div>
      { status === 'authenticated' && (session.user.role === 'dev' || session.user.role === 'admin') ?
        <main className="flex flex-col p-4 gap-2">
          <section className='bg-secondary/20 border border-secondary/80 rounded-lg p-4 gap-2 flex flex-col'>
            <h5>Google Drive Connection Status</h5>
            <div>
              Connecting a Google Drive account to this app enables the automatic generation and organization of Studies.
            </div>
            <div className="flex gap-2 pt-2 items-center">
              { config ? (
                <>
                <div className='flex items-center bg-secondary/80 rounded-md text-white px-2 py-1 gap-2'>
                <FontAwesomeIcon className='text-green-400' icon={faCircle} size='2xs' />
                <div className='font-bold'>Connected:</div>
                {config.accountEmail}
                </div>
                </>
              ) : (
                <button className='std-button-lite flex items-center gap-2' onClick={handleAuthClick}>
                  <FontAwesomeIcon icon={faShieldHalved} />
                  Connect Google Drive Account
                </button>
              )} 
              <button className='std-button-lite flex items-center gap-2' disabled={!config} onClick={handleDisconnectClick}>
                Disconnect
              </button>
            </div>
          </section>
          <section className='bg-secondary/20 border border-secondary/80 rounded-lg p-4 gap-2 flex flex-col'>
            <h5>Studies Repository Configuration</h5>
            <div>
              Identify the drive and file path in your connected account that will serve as a repository for Studies managed by this app. Folder trees and associated documents will be generated at this location when Studies are published. 
            </div>
            <div className='flex flex-col gap-2'>
              <div>Drive Name: </div>
              <input className='std-input' value={drive} onChange={(e) => setDrive(e.target.value)} />
              <div>File path: </div>
              <input className='std-input' value={path} placeholder='/...' onChange={(e) => setPath(e.target.value)} />
              <div className='flex items-center gap-2 pt-4'>
                <button className='std-button-lite' onClick={handleTestClick}>Test File Path</button>
                <button className='std-button-lite' onClick={handleSave}>Save Target Directory</button>
              </div>
            </div>
          <div className='flex my-2 text-[#800] whitespace-pre'>{appStatus}</div>
       </section>
     </main>
      :
      <main className='p-4'>
        {`It looks like you aren't authorized to view this page (admin access only). If you think this is an error, please contact your system administrator.`}
      </main>
      }
    </>
  );
}