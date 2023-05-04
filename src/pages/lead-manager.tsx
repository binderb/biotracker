import Navbar from "@/components/Navbar";
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { initializeApollo, addApolloState } from "../../utils/apolloClient";
import { GET_CLIENT_CODES } from "@/utils/queries";
import { useSession } from "next-auth/react";

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


export default function LeadManager () {

  const { data: session, status } = useSession();

  return (
    <>
      <Navbar/>
      { status === 'authenticated' ?
        <main className="flex items-top p-4">

        </main>
        :
        <main className="flex items-top p-4">
          Please login to view this content.
        </main>
      }
    </>
  );
}