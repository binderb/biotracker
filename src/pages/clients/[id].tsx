import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { addApolloState, initializeApollo } from "../../../utils/apolloClient";
import { useRouter } from "next/router";
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
  // await apolloClient.query({
  //   query: GET_FORM_DETAILS_FROM_REVISION_ID,
  //   variables: {
  //     revisionId: leadContent[0].studyPlanFormRevisionId
  //   }
  // });
  
  return addApolloState(apolloClient, {
    props: {
      session,
      editId: context.params.id,
    },
  });

}

export default function ClientDetails () {
  const router = useRouter();
  const {data:session, status} = useSession();

  

}