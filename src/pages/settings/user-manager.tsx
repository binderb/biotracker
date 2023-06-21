import { useState, ChangeEvent } from 'react';
import { GET_USERS } from '@/utils/queries';
import { ADD_USER, REMOVE_USER, UPDATE_USER } from '@/utils/mutations';
import { useQuery, useMutation } from '@apollo/client';
import Navbar from '@/components/Navbar';
import { initializeApollo, addApolloState } from '../../../utils/apolloClient';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenNib, faPenToSquare, faSkullCrossbones, faTrashCan, faX } from '@fortawesome/free-solid-svg-icons';
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
  const [errStatus, setErrStatus] = useState('');
  const { data: userData } = useQuery(GET_USERS);
  const users = userData.getUsers;
  const [addUser, { data: newUserData }] = useMutation(ADD_USER, {
    refetchQueries: [{query: GET_USERS}]
  });
  const [updateUser, { data: updatedUserData }] = useMutation(UPDATE_USER, {
    refetchQueries: [{query: GET_USERS}]
  });
  const [removeUser, { data: removeUserData }] = useMutation(REMOVE_USER, {
    refetchQueries: [{query: GET_USERS}]
  });
  const { data: session, status } = useSession();

  const [editorVisible, setEditorVisible] = useState(false);
  const [editId, setEditId] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editorErrStatus, setEditorErrStatus] = useState('');


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
      setErrStatus(err.message)
    }
  }

  function showEditor (id:string) {
    const editUser = users.filter((e:any) => e._id === id)[0]
    setEditId(editUser._id);
    setEditUsername(editUser.username);
    setEditFirst(editUser.first);
    setEditLast(editUser.last);
    setEditRole(editUser.role);
    setEditorVisible(true);
  }

  async function handleUpdateUser (e:ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await updateUser({
        variables: {
          updateUserId: editId,
          username: editUsername.trim(),
          password: editPassword,
          first: editFirst.trim(),
          last: editLast.trim(),
          role: editRole
        }
      });
      setEditorErrStatus('');
      setEditId('');
      setEditUsername('');
      setEditPassword('');
      setEditFirst('');
      setEditLast('');
      setEditRole('');
      setEditorVisible(false);
    } catch (err:any) {
      setEditorErrStatus(err.message)
    }
  }

  async function handleRemoveUser () {
    if (confirm('Are you sure? This action cannot be undone.')) {
      try {
        await removeUser({
          variables: {
            removeUserId: editId,
          }
        });
        setEditorErrStatus('');
        setEditId('');
        setEditUsername('');
        setEditPassword('');
        setEditFirst('');
        setEditLast('');
        setEditRole('');
        setEditorVisible(false);
      } catch (err:any) {
        if (err.message.includes('REFERENCED')) {
          alert("This user cannot be removed because they are an author and/or contributor on one or more documents in the database. To maintain an accurate record, users should not be fully removed except in cases where they were added to the system by mistake. To revoke all access to a user, change their role to \"inactive\".");
        } else {
          setEditorErrStatus(err.message)
        }
      }
    }
  }



  interface User {
    _id: string
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
      <>
      <main className="flex items-top p-4 gap-2">
        <div id="client-table" className='bg-secondary/20 border border-secondary/80 p-4 rounded-xl w-[50%]'>
          <h5>User Table</h5>
          <table className='w-full text-left'>
            <thead>
              <tr>
                <th className='w-[40%]'>User</th>
                <th className='w-[40%]'>Role</th>
                <th className='w-[20%]'>Edit</th>
              </tr>
            </thead>
            <tbody>
            {users.map((user:User) => 
              <tr key={user.username}>
                <td className='bg-white/50 p-1 border border-secondary/80 py-2'>{user.username}</td>
                <td className='bg-white/50 p-1 border border-secondary/80 py-2'>{user.role}</td>
                <td className='bg-white/50 p-1 border border-secondary/80 py-2'>
                  <div className='w-full h-full flex justify-center'>
                    <button aria-label='edit' className='mr-1 py-1 px-3 rounded-md bg-primary hover:bg-primaryHover text-white text-[12px]' onClick={() => showEditor(user._id)}><FontAwesomeIcon icon={faPenToSquare}/></button>
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
                <option value='inactive'>Inactive (no access)</option>
              </select>
            </div>
            <div className='my-5'>
              <button className='std-button-lite'>Create User</button>
            </div>
            <div className='my-2 text-[#800]'>{errStatus}</div>
          </form>
        </div>
      </main>
      <section className={`absolute ${editorVisible ? `grid` : `hidden`} grid-cols-12 items-start pt-[5vh] bg-black/50 w-screen h-screen top-0 left-0`}>
        <section className='flex bg-white rounded-lg p-0 col-start-5 col-span-4'>
        <section className='flex flex-col p-4 bg-secondary/20 rounded-lg w-full'>
          <h5>Edit User</h5>
          <form onSubmit={handleUpdateUser}>
            <div >
              <div className='mb-1 font-bold'>Username:</div>
              <input className='std-input mb-2 w-full' type='text' required value={editUsername} onChange={(e) => setEditUsername(e.target.value)}  />
            </div>
            <div >
              <div className='mb-1 font-bold'>New Password:</div>
              <input className='std-input mb-2 w-full' type='password' value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
            </div>
            <div >
              <div className='mb-1 font-bold'>First Name:</div>
              <input className='std-input mb-2 w-full' type='text' required value={editFirst} onChange={(e) => setEditFirst(e.target.value)}  />
            </div>
            <div >
              <div className='mb-1 font-bold'>Last Name:</div>
              <input className='std-input mb-2 w-full' type='text' value={editLast} onChange={(e) => setEditLast(e.target.value)} />
            </div>
            <div >
              <div className='mb-1 font-bold'>Role:</div>
              <select className='std-input mb-2' value={editRole} required onChange={(e) => setEditRole(e.target.value)}>
                <option value='user'>Regular User</option>
                <option value='admin'>Admin (elevated privileges)</option>
                <option value='dev'>Dev (see things that are not ready yet)</option>
                <option value='inactive'>Inactive (no access)</option>
              </select>
            </div>
            <div className='flex items-center gap-2'>
              <button type='button' className='danger-button-lite w-full mt-2 flex items-center justify-center gap-2' onClick={handleRemoveUser}><FontAwesomeIcon icon={faTrashCan} />Remove User</button>
            </div>
            <div className='flex my-5 gap-2'>
              <button className='secondary-button-lite flex-grow' onClick={() => {setEditorErrStatus(''); setEditorVisible(false);}}>Cancel</button>
              <button className='std-button-lite flex-grow'>Save Changes</button>
            </div>
            <div className='my-2 text-[#800]'>{editorErrStatus}</div>
          </form>
        </section>
        </section>
      </section>
      </>
      :
      <main className='p-4'>
        {`It looks like you aren't authorized to view this page (admin access only). If you think this is an error, please contact your system administrator.`}
      </main>
      }
    </>
  );
}