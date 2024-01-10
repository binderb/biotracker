'use client';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import SubmitButton from '@/app/(global components)/SubmitButton';

export default function LoginBox() {
  const [loginStatus, setLoginStatus] = useState('');
  const formStatus = useFormStatus();
  const router = useRouter();
  const params = useSearchParams();

  async function handleLogin(formData: FormData) {
    setLoginStatus('');
    try {
      const response = await signIn('credentials', {
        redirect: false,
        username: formData.get('username'),
        password: formData.get('password'),
      });
      if (response) {
        if (response.ok && response.url) {
          router.push(params.get('callbackUrl') || '/');
        } else {
          if (response.error) setLoginStatus(response.error || 'An unknown error occurred.');
        }
      }
    } catch (err: any) {
      setLoginStatus(err.message);
    }
  }

  return (
    <>
      <form action={handleLogin} className='flex flex-col gap-2 bg-secondary/20 border border-secondary/80 p-4 rounded-xl min-w-[400px]'>
        <div className='flex flex-col gap-1'>
          <div className='font-bold pb-1'>Username:</div>
          <input type='text' id='username' name='username' className='std-input w-full' />
        </div>
        <div className='flex flex-col gap-1'>
          <div className='font-bold pb-1'>Password:</div>
          <input type='password' id='password' name='password' className='std-input w-full' />
        </div>
        <div className='pt-4 flex items-center gap-2'>
          <SubmitButton text='Login' pendingText='Logging in...' />
          <div className='my-2 text-[#800]'>{loginStatus}</div>
        </div>
      </form>
    </>
  );
}
