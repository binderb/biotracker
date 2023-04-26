import { useState, ChangeEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

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
    <section className='max-w-xl mx-auto my-7'>
      <h1>Login</h1>
      <form onSubmit={submitHandler}>
        <div >
          <label htmlFor='username'>Username:</label>
          <input type='text' id='username' name='username' required onChange={updateField}  />
        </div>
        <div >
          <label htmlFor='password'>Password:</label>
          <input type='password' id='password' name='password' required onChange={updateField} />
        </div>
        <div className='my-5'>
          <button className='button button-color mr-4'>Login</button>
        </div>
      </form>
    </section>
  );
}