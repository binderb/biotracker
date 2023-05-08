import { useState, ChangeEvent } from 'react';
import { GET_USERS } from '@/utils/queries';
import { ADD_USER } from '@/utils/mutations';
import { useQuery, useMutation } from '@apollo/client';
import Navbar from '@/components/Navbar';
import { initializeApollo, addApolloState } from '../../../utils/apolloClient';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';

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

  const apolloClient = initializeApollo();
  console.log('initializing apollo');
  const initialData = await apolloClient.query({
    query: GET_USERS,
  });

  return addApolloState(apolloClient, {
    props: {
      session,
    },
  });

}

// This gets handled by the [...nextauth] endpoint
export default function UserManager () {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [role, setRole] = useState('user');
  const [creatorStatus, setCreatorStatus] = useState('');
  const { data: userData } = useQuery(GET_USERS);
  const users = userData.getUsers;
  const [addUser, { error, data: newUserData }] = useMutation(ADD_USER, {
    refetchQueries: [{query: GET_USERS}]
  });
  const { data: session, status } = useSession();


  function updateField(e:ChangeEvent<HTMLInputElement>) {
    switch (e.target.name) {
      case 'username':
        setUsername(e.target.value);
        break;
      case 'password':
        setPassword(e.target.value);
        break;
      case 'first':
        setFirst(e.target.value);
        break;
      case 'last':
        setLast(e.target.value);
        break;
      default:
        break;
    }
  }

  function updateRole (e:ChangeEvent<HTMLSelectElement>) {
    setRole(e.target.value);
  }

  async function handleAddUser(e:ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await addUser({
        variables: {
          username: username,
          password: password,
          first: first,
          last: last,
          role: role
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
              <input className='std-input mb-2 w-full' type='text' id='username' name='username' required onChange={updateField}  />
            </div>
            <div >
              <div className='mr-2'>Password:</div>
              <input className='std-input mb-2 w-full' type='password' id='password' name='password' required onChange={updateField} />
            </div>
            <div >
              <div className='mr-2'>First Name:</div>
              <input className='std-input mb-2 w-full' type='text' id='first' name='first' required onChange={updateField}  />
            </div>
            <div >
              <div className='mr-2'>Last Name:</div>
              <input className='std-input mb-2 w-full' type='text' id='last' name='last' required onChange={updateField} />
            </div>
            <div >
              <div className='mr-2'>Role:</div>
              <select className='std-input' id='role' name='role' required onChange={updateRole}>
                <option value='user'>Regular User</option>
                <option value='admin'>Admin (elevated privileges)</option>
              </select>
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
        {`It looks like you aren't authorized to view this page (admin access only). If you think this is an error, please contact your system administrator.`}
      </main>
      }
    </>
  );
}