import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar () {

  const { data: session, status } = useSession();

  return (
    <>
      <nav className='flex bg-primary justify-between items-center'>
        <div>
        <Link className='nav-link' href='/'>Home</Link>
        </div>
        <div>
          { status === 'authenticated' ?
            <>
              <span className='text-white mr-1'>Logged in as {session.user.username}</span>
              <button className='nav-link' onClick={() => signOut()}>Logout</button>
            </>
            
            :
            <button className='nav-link' onClick={() => signIn()}>Login</button>
          }
          
          
        </div>
      </nav>
    </>
  );
}