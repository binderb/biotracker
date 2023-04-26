import { useState, ChangeEvent } from 'react';
import { GET_USERS } from '@/utils/queries';
import { ADD_USER } from '@/utils/mutations';
import { useQuery, useMutation } from '@apollo/client';
import Navbar from '@/components/Navbar';
import { initializeApollo, addApolloState } from '../../utils/apolloClient';
import { useSession } from 'next-auth/react';

export async function getServerSideProps () {
  const apolloClient = initializeApollo();
  await apolloClient.resetStore();
  
  const initialData = await apolloClient.query({
    query: GET_USERS,
  });

  return addApolloState(apolloClient, {
    props: {},
  });
}

// This gets handled by the [...nextauth] endpoint
export default function UserManager () {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [creatorStatus, setCreatorStatus] = useState('');
  const { data: userData } = useQuery(GET_USERS);
  const users = userData.getUsers;
  const [addUser, { error, data: newUserData }] = useMutation(ADD_USER);
  const { data: session, status } = useSession();


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

  async function handleAddUser(e:ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await addUser({
        variables: {
          username: username,
          password: password
        }
      });
    } catch (err:any) {
      setCreatorStatus(err.message)
    }
  }

  interface User {
    username: string
    role: string
  }

  return (
    <>
      <Navbar />
      { status === 'authenticated' && session.user.role === 'admin' ?
      <main className="flex items-top p-4">
        <div id="client-table" className='mr-1 bg-secondaryHighlight p-4 rounded-xl w-[50%]'>
          <h1>User Table</h1>
          <table className='w-full text-left border-separate'>
            <thead>
              <tr>
                <th className='w-[50%]'>User</th>
                <th className='w-[50%]'>Role</th>
              </tr>
            </thead>
            <tbody>
            {users.map((user:User) => 
              <tr key={user.username}>
                <td className='bg-[#FFFFFF88] p-1'>{user.username}</td>
                <td className='bg-[#FFFFFF88] p-1'>{user.role}</td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
        <div id="client-creator" className='ml-1 bg-secondaryHighlight p-4 rounded-xl w-[50%]'>
          <h1 className='mb-2'>Create a User</h1>
          <form onSubmit={handleAddUser}>
            <div >
              <div className='mr-2'>Username:</div>
              <input className='mr-2 p-2 bg-[#FFFFFF88]' type='text' id='username' name='username' required onChange={updateField}  />
            </div>
            <div >
              <div className='mr-2'>Password:</div>
              <input className='mr-2 p-2 bg-[#FFFFFF88]' type='password' id='password' name='password' required onChange={updateField} />
            </div>
            <div className='my-5'>
              <button className='std-button'>Create User</button>
            </div>
            <div className='my-2 text-[#800]'>{creatorStatus}</div>
          </form>
        </div>
      </main>
      :
      <main className='p-4'>
        Unauthorized.
      </main>
      }
    </>
  );
}