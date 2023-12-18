import Nav from "@/app/(global components)/Nav";
import Link from "next/link";
import FormEditor from "./components/FormEditor";

export default async function Forms() {
  return (
    <>
      <Nav />
      <div className='mt-4'>
        <Link className='std-link ml-4' href='/forms'>
          &larr; Back
        </Link>
      </div>
      <main className='flex flex-col gap-4 p-4'>        
        <FormEditor />
      </main>
    </>
  );
}