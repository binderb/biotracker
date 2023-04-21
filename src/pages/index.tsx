import { NextPage } from 'next'
import Image from 'next/image'
import { GET_CLIENTS, HELLO } from '@/utils/queries'
import { initializeApollo, addApolloState } from '../../utils/apolloClient'
import { useQuery } from '@apollo/client'

export async function getServerSideProps () {
  console.log("initializing the index page");
  const apolloClient = initializeApollo();
  
  const initialData = await apolloClient.query({
    query: GET_CLIENTS,
  });

  return addApolloState(apolloClient, {
    props: {},
  });
}

const Home = () => {

  const { data } = useQuery(GET_CLIENTS);
  console.log('data: ', data)

  return (
    <main className="flex flex-col p-4">
      <div>Check the console!</div>
      <div></div>
    </main>
  )
}

export default Home;
