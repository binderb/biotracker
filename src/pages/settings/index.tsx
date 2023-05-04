import Navbar from '@/components/Navbar';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';

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

  return {
    props: {
      session,
    },
  };

}

// This gets handled by the [...nextauth] endpoint
export default function UserManager () {
  const { data: session, status } = useSession();


  return (
    <>
      <Navbar />
      { status === 'authenticated' && session.user.role === 'admin' ?
       <main className="flex flex-col p-4">
       <div>Here are the current options for app customization.</div>
       <div className="flex py-2">
         <Link className='std-button mr-1' href='./settings/user-manager'>Manage Team Members</Link>
         <Link className='std-button mr-1' href='./settings/authorize-google'>Authorize Google Drive</Link>
       </div>
     </main>
      :
      <main className='p-4'>
        {`It looks like you aren't authorized to view this page (admin access only). If you think this is an error, please contact your system administrator.`}
      </main>
      }
    </>
  );
}