import { useState, ChangeEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import config from '../../config';
import logo from '../../public/logo.png';

// This gets handled by the [...nextauth] endpoint
export default function Login () {
  const [registered, setRegistered] = useState(false)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  function updateField(e:ChangeEvent<HTMLInputElement>) {
    switch (e.target.name) {
      case 'username':
        setUsername(e.target.value);
        break;
      case 'password':
        setPassword(e.target.value);
        break;
      default:
        break;
    }
  }

  async function submitHandler(e:ChangeEvent<HTMLFormElement>) {
    e.preventDefault();

    // optional: Add validation here
    const data = await signIn('credentials', {
      // callbackUrl: '/',
      redirect: false,
      username: username,
      password: password,
    });
    console.log(data);
    if (data?.ok) router.push('/');
  }

  return (
    <>
    {/* <Navbar /> */}
    <main className='flex flex-col items-center p-4'>
      <Image alt='logo' className="my-3 w-auto h-[100px]" src={logo} width='100' height='100' />
      <div className="font-light text-[32px] mb-6">
        Login | {config.webTitle}
      </div>
      <div id="client-creator" className='flex flex-col ml-1 bg-secondary/20 border border-secondary/80 p-4 rounded-xl min-w-[400px]'>
        <form onSubmit={submitHandler}>
          <div className='my-2'>
            <div className='font-bold pb-1'>Username:</div>
            <input type='text' id='username' name='username' className='mr-2 std-input w-full' required onChange={updateField}  />
          </div>
          <div className='my-2'>
            <div className='font-bold pb-1'>Password:</div>
            <input type='password' id='password' name='password' className='mr-2 std-input w-full' required onChange={updateField} />
          </div>
          <div className='mt-4'>
            <button className='std-button-lite'>Login</button>
          </div>
        </form>
        <div className='my-2 text-[#800]'>{}</div>
      </div>
    </main>
    </>
  );
}