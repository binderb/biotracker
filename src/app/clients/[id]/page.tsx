import Nav from "@/app/(global components)/Nav";
import Link from "next/link";

export default async function ClientDetails () {
  return (
    <>
    <Nav />
    <div className='mt-4'>
      <Link className='std-link ml-4' href='/clients'>
        &larr; Back
      </Link>
    </div>
    <main className='flex flex-col gap-4 p-4'>
      
    </main>
    </>
  )
}