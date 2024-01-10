import Nav from '../../(global components)/Nav';
import Link from 'next/link';
export default async function Settings () {

  return (
    <>
      <Nav />
      <div className='mt-4'>
        <Link className='std-link ml-4' href='/'>
          &larr; Back
        </Link>
      </div>
      <main className='flex flex-col gap-2 p-4'>
       <div>Here are the current options for app customization.</div>
       <div className="flex py-2">
         <Link className='std-button mr-1' href='./settings/users'>Manage Team Members</Link>
         <Link className='std-button mr-1' href='./settings/shared-drive'>Shared Drive Settings</Link>
       </div>
     </main>
    </>
  );
}
