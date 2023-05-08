import { useState, ChangeEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';

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
      callbackUrl: '/',
      redirect: false,
      username: username,
      password: password,
    });
    if (data?.url) router.push(data.url);
  }

  return (
    <>
    <Navbar />
    <main className='flex justify-center p-4'>
      <div id="client-creator" className='flex flex-col ml-1 bg-secondaryHighlight p-4 rounded-xl min-w-[400px]'>
        <h1 className='mb-2'>Login</h1>
        <form onSubmit={submitHandler}>
          <div className='my-2'>
            <div>Username:</div>
            <input type='text' id='username' name='username' className='mr-2 std-input w-full' required onChange={updateField}  />
          </div>
          <div className='my-2'>
            <div>Password:</div>
            <input type='password' id='password' name='password' className='mr-2 std-input w-full' required onChange={updateField} />
          </div>
          <div className='my-5'>
            <button className='std-button'>Login</button>
          </div>
        </form>
        <div className='my-2 text-[#800]'>{}</div>
      </div>
    </main>
    </>
  );
}