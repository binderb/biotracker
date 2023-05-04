import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useSession, signOut, signIn } from "next-auth/react";

const Home = () => {

  const {data : session, status} = useSession();

  return (
    <>
    <Navbar />
    <main className="flex flex-col p-4">
      <div>This is a demo home page. Click the links below to access different prototypes.</div>
      <div className="flex py-2">
        <Link className='std-button mr-1' href='./settings'>App Settings (admin only)</Link>
        <Link className='std-button mr-1' href='./client-manager'>Client Manager (admin only)</Link>
        <Link className='std-button mr-1' href='./study-creator'>Study Creator</Link>
        <Link className='std-button mr-1' href='./lead-manager'>Leads</Link>
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
