import Nav from "@/app/(global components)/Nav";
import { db } from "@/db";
import Link from "next/link";
import UserManager from "./components/UserManager";

export default async function UserSettings () {

  const users = await db.query.users.findMany();

  return (
    <>
      <Nav />
      <div className='mt-4'>
        <Link className='std-link ml-4' href='/settings'>
          &larr; Back
        </Link>
      </div>
      <main className='grid grid-cols-2 gap-2 p-4'>
        <UserManager users={users} />
      </main>
    </>
  );
}