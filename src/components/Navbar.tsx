import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import config from "../../config";

export default function Navbar () {

  const { data: session, status } = useSession();

  return (
    <>
      <nav className='flex bg-secondary/10 justify-between items-center py-2 border-b-[1px] border-secondary/80'>
        
        <div className='flex items-center gap-2'>
          <a className='flex items-center gap-2'>
            <Image 
              src={`${config.imageBasePath}/logo.png`}
              alt='logo'
              width='24'
              height='24'
              className='pl-3 pr-1 w-auto h-[24px]'
            />
            <div className='font-extrabold text-[20px] text-primary'>
              {config.webTitle}
            </div>
          </a>
          <div className='text-secondary'>|</div>
          <div className='flex items-center gap-4'>
            <Link className='nav-link' href='/'>Home</Link>
            <Link className='nav-link' href='/inventory'>Inventory</Link>
          </div>
        </div>
        <div>
          { status === 'authenticated' ?
            <>
              <span className='text-primary mr-1'>Logged in as <span className='font-bold text-primary'>{session.user.username}</span></span>
              <button className='nav-link px-4' onClick={() => signOut()}>Logout</button>
            </>
            
            :
            <button className='nav-link px-4' onClick={() => signIn()}>Login</button>
          }
          
          
        </div>
      </nav>
    </>
  );
}