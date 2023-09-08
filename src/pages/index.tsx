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
      <div className='pb-4'>This is a demo home page. Click the links below to access different prototypes.</div>
      <section className='pb-4'>
        <div className='font-bold'>Regular User Functions:</div>
        <div className="flex py-2 gap-1">
          <Link className='std-button' href='./clients'>Client Manager</Link>
          <Link className='std-button' href='./leads'>Leads</Link>
        </div>
      </section>
      { status === 'authenticated' && (session.user.role === 'dev' || session.user.role === 'admin')  && (
        <section className='pb-4'>
          <div className='font-bold'>Admin Functions:</div>
          <div className="flex py-2 gap-1">
            <Link className='std-button' href='./settings'>App Settings</Link>
          </div>
        </section>
      )}
      { status === 'authenticated' && session.user.role === 'dev' && (
        <section className='pb-4'>
          <div className='font-bold'>Dev Functions:</div>
          <div className="flex py-2 gap-1">
            <Link className='std-button' href='./admin/lead-master-list'>Lead Master List</Link>
            <Link className='std-button' href='./inventory'>Inventory</Link>
            <Link className='std-button' href='./study-creator'>Study Creator</Link>
          </div>
        </section>
      )}

    </main>
    </>
  )
}

export default Home;
