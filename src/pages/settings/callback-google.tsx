import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import { authOptions } from "../api/auth/[...nextauth]";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useMutation } from "@apollo/client";
import { SAVE_GOOGLE_DRIVE_TOKEN } from "@/utils/mutations";

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

  return ({
    props: {
      session,
      code: context.query.code
    },
  });

}

export default function CallbackGoogle (props:any) {

  const router = useRouter();
  const { data: session, status } = useSession();
  const [ saveGoogleDriveToken, { data: tokenResponse } ] = useMutation(SAVE_GOOGLE_DRIVE_TOKEN);

  useEffect( () => {
    console.log(props.code);
    const saveToken = async () => {
      if (props.code) {
        try {
          await saveGoogleDriveToken({
            variables: {
              authCode: props.code
            }
          });
          router.push('/settings/authorize-google');
        } catch (err:any) {
          console.log(err.message);
        }
      }
    }

    saveToken();
    
  },[props.code, router, saveGoogleDriveToken]);

  if ( status !== 'authenticated' || !props.code ) {
    router.push('/');
    return;
  }

  return (
    <div className='p-4'>Authorizing...</div>
  );
}