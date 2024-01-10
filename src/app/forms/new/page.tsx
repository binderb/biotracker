import Nav from "@/app/(global components)/Nav";
import Link from "next/link";
import FormEditor from "../components/FormEditor";

export default async function Forms() {
  return (
    <>
      <Nav />
      <div className='mt-4 flex gap-4 items-center'>
        <Link className='std-link ml-4' href='/forms'>
          &larr; Back
        </Link>
        <h1 className='text-[20px] font-bold'>New Form</h1>
      </div>
      <main className='flex flex-col gap-4 p-4'>        
        <FormEditor mode='new' />
      </main>
    </>
  );
}