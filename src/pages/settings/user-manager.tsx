import { useState, ChangeEvent } from 'react';
import { GET_USERS } from '@/utils/queries';
import { ADD_USER } from '@/utils/mutations';
import { useQuery, useMutation } from '@apollo/client';
import Navbar from '@/components/Navbar';
import { initializeApollo, addApolloState } from '../../../utils/apolloClient';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenNib, faPenToSquare, faX } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';

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
  const router = useRouter();
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

  if (status !== 'authenticated') {
    router.push('/login');
    return;
  }

  return (
    <>
      <Navbar />
      { status === 'authenticated' && session.user.role === 'admin' ?
      <main className="flex items-top p-4 gap-2">
        <div id="client-table" className='bg-secondary/20 border border-secondary/80 p-4 rounded-xl w-[50%]'>
          <h5>User Table</h5>
          <table className='w-full text-left'>
            <thead>
              <tr>
                <th className='w-[40%]'>User</th>
                <th className='w-[40%]'>Role</th>
                <th className='w-[20%]'>Actions</th>
              </tr>
            </thead>
            <tbody>
            {users.map((user:User) => 
              <tr key={user.username}>
                <td className='bg-white/50 p-1 border border-secondary/80 py-2'>{user.username}</td>
                <td className='bg-white/50 p-1 border border-secondary/80 py-2'>{user.role}</td>
                <td className='bg-white/50 p-1 border border-secondary/80 py-2'>
                  <div className='w-full h-full flex justify-center'>
                    <button aria-label='delete' className='mr-1 py-1 px-3 rounded-md bg-primary hover:bg-primaryHover text-white text-[12px]'><FontAwesomeIcon icon={faPenToSquare}/></button>
                    <button aria-label='delete' className='py-1 px-3 rounded-md bg-primary hover:bg-primaryHover text-white text-[12px]'><FontAwesomeIcon icon={faX}/></button>
                  </div>
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
        <div id="client-creator" className='bg-secondary/20 border border-secondary/80 p-4 rounded-xl w-[50%]'>
          <h5>Create a User</h5>
          <form onSubmit={handleAddUser}>
            <div >
              <div className='mb-1 font-bold'>Username:</div>
              <input className='std-input mb-2 w-full' type='text' id='username' name='username' required onChange={updateField}  />
            </div>
            <div >
              <div className='mb-1 font-bold'>Password:</div>
              <input className='std-input mb-2 w-full' type='password' id='password' name='password' required onChange={updateField} />
            </div>
            <div >
              <div className='mb-1 font-bold'>First Name:</div>
              <input className='std-input mb-2 w-full' type='text' id='first' name='first' required onChange={updateField}  />
            </div>
            <div >
              <div className='mb-1 font-bold'>Last Name:</div>
              <input className='std-input mb-2 w-full' type='text' id='last' name='last' required onChange={updateField} />
            </div>
            <div >
              <div className='mb-1 font-bold'>Role:</div>
              <select className='std-input' id='role' name='role' required onChange={updateRole}>
                <option value='user'>Regular User</option>
                <option value='admin'>Admin (elevated privileges)</option>
                <option value='dev'>Dev (see things that are not ready yet)</option>
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