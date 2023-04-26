import { useState, ChangeEvent } from 'react';

// This gets handled by the [...nextauth] endpoint
export default function Login () {
  const [registered, setRegistered] = useState(false)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
    try {
      const data = {
        username: username,
        password: password
      }
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Something went wrong!');
      }
      setRegistered(true);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <section className='max-w-xl mx-auto my-7'>
      {!registered ? (
        <>
          <h1>Create User</h1>
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
              <button className='button button-color mr-4'>Create User</button>
            </div>
          </form>
        </>
      ) : (
        <div className=''>
          <p>You have successfully registered a new user!</p>
          
          {/* <button onClick={() => router.reload()} className='button button-color'>Login Now</button> */}
          
        </div>
      )}
      
    </section>
  );
}