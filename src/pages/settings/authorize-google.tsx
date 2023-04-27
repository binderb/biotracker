import Navbar from '@/components/Navbar';
import { AUTHORIZE_GOOGLE_DRIVE, TEST_GOOGLE_DRIVE } from '@/utils/mutations';
import { useMutation } from '@apollo/client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

// This gets handled by the [...nextauth] endpoint
export default function UserManager () {
  const { data: session, status } = useSession();
  const [appStatus, setAppStatus] = useState('');
  const [authorizeGoogleDrive, {data: authorizeResponse }] = useMutation(AUTHORIZE_GOOGLE_DRIVE);
  const [testGoogleDrive, {data: testResponse}] = useMutation(TEST_GOOGLE_DRIVE);

  async function handleAuthClick () {
    try {
      await authorizeGoogleDrive();
    } catch (err:any) {
      setAppStatus(err.message);
    }
  }

  async function handleTestClick () {
    try {
      const response:any = await testGoogleDrive();
      setAppStatus(response.data.testGoogleDrive)
    } catch (err:any) {
      setAppStatus(`Error: ${err.message}`);
    }
  }

  return (
    <>
      <Navbar />
      { status === 'authenticated' && session.user.role === 'admin' ?
       <main className="flex flex-col p-4">
       <div>You can use the options below to manage Google Drive access.</div>
       <div className="flex py-2">
         <button className='std-button mr-1' onClick={handleAuthClick}>Authorize Google Drive</button>
         <button className='std-button mr-1' onClick={handleTestClick}>Test Drive Connection</button>
       </div>
       <div className='my-2 text-[#800] whitespace-pre'>{appStatus}</div>
     </main>
      :
      <main className='p-4'>
        Unauthorized.
      </main>
      }
    </>
  );
}