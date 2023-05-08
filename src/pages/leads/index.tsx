import Navbar from "@/components/Navbar";
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { initializeApollo, addApolloState } from "../../../utils/apolloClient";
// import { GET_LEADS } from "@/utils/queries";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
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
  console.log('initializing apollo');
  // const initialData = await apolloClient.query({
  //   // query: GET_LEADS,
  // });

  return addApolloState(apolloClient, {
    props: {
      session,
    },
  });

}


export default function LeadManager () {

  const { data: session, status } = useSession();

  return (
    <>
      <Navbar/>
      { status === 'authenticated' ?
        <main className="flex flex-col p-4">
          <div className='mt-2 mb-4'>
            <Link className="std-button mr-2" href="/leads/new"><FontAwesomeIcon icon={faPlus} className="mr-2"></FontAwesomeIcon> New Lead</Link>
          </div>
          <div className='flex flex-col mt-4'>
            <div className='font-bold'>Current Leads:</div>
            <div>...</div>
            <div>...</div>
            <div>...</div>
          </div>
        </main>
        :
        <main className="flex items-top p-4">
          Please login to view this content.
        </main>
      }
    </>
  );
}