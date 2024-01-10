'use client';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { saveGoogleDriveToken } from "./actions";

export default function CallbackGoogle ({ searchParams }: { searchParams: { code: string } }) {

  const router = useRouter();

  useEffect( () => {
    console.log(searchParams.code);
    const saveToken = async () => {
      if (searchParams.code) {
        try {
          await saveGoogleDriveToken(searchParams.code);
          router.push('/settings/shared-drive');
        } catch (err:any) {
          console.log(err.message);
        }
      }
    }

    saveToken();
    
  },[searchParams.code, router]);

  return (
    <>
      <div className='p-4 font-source'>Authorizing...</div>
    </>
    
  );
}