import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";

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

const Home = () => {

  const router = useRouter();
  const {data : session, status} = useSession();

  useEffect( () => {
    if (status !== 'authenticated') {
      router.push('/login');
      return;
    }
  },[status, router]);
  

  return (
    <>
    <Navbar />
    <main className="flex flex-col p-4">
      <div>This is a demo home page. Click the links below to access different prototypes.</div>
      <div className="flex py-2 gap-1">
        <Link className='std-button' href='./settings'>App Settings (admin only)</Link>
        <Link className='std-button' href='./client-manager'>Client Manager (admin only)</Link>
        <Link className='std-button' href='./inventory'>Inventory</Link>
        <Link className='std-button' href='./study-creator'>Study Creator</Link>
        <Link className='std-button' href='./leads'>Leads</Link>
      </div>
      {/* { session ?
        <div>{`${JSON.stringify(session)}`}</div>
        :
        null
      } */}

    </main>
    </>
  )
}

export default Home;
