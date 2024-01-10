'use client';

import Modal from '@/app/(global components)/Modal';
import { User } from '@/db/schema_usersModule';
import { useState } from 'react';
import { FaPenToSquare } from 'react-icons/fa6';
import { Flip, ToastContainer, toast } from 'react-toastify';
import { addUser, updateUser } from '../actions';
import SubmitButton from '@/app/(global components)/SubmitButton';

type Props = {
  users: User[];
};

export default function UserManager({ users }: Props) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  function notify(type:string,message: string) {
    if (type === 'error') {
      toast.error(message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        theme: 'colored',
        transition: Flip,
      });
    }
    if (type === 'success') {
      toast.success(message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        theme: 'dark',
        transition: Flip,
      });
    }
  }

  async function handleUpdateUser(formData: FormData) {
    try {
      await updateUser(formData,currentUser!.id);
      notify('success', 'User updated successfully.');
      setShowEditor(false);
      setCurrentUser(null);
    } catch (err: any) {
      notify('error', err.message);
    }
  }

  async function handleAddUser(formData: FormData) {
    try {
      await addUser(formData);
      notify('success', 'User created successfully.');
    } catch (err: any) {
      notify('error', err.message);
    }
  }

  return (
    <>
      <div id='client-table' className='bg-secondary/20 border border-secondary/80 p-4 rounded-xl'>
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
            {users.map((user) => (
              <tr key={user.username}>
                <td className='bg-white/50 p-1 border border-secondary/80 py-2'>{user.username}</td>
                <td className='bg-white/50 p-1 border border-secondary/80 py-2'>{user.role}</td>
                <td className='bg-white/50 p-1 border border-secondary/80 py-2'>
                  <div className='w-full h-full flex justify-center'>
                    <button
                      aria-label='edit'
                      className='std-button-lite'
                      onClick={() => {
                        setCurrentUser(user);
                        setShowEditor(true);
                      }}>
                      <FaPenToSquare />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div id="client-creator" className='bg-secondary/20 border border-secondary/80 p-4 rounded-xl'>
          <h5>Create a User</h5>
          <form action={handleAddUser}>
            <div >
              <div className='mb-1 font-bold'>Username:</div>
              <input className='std-input mb-2 w-full' type='text' name='username' />
            </div>
            <div >
              <div className='mb-1 font-bold'>Password:</div>
              <input className='std-input mb-2 w-full' type='password' name='password' />
            </div>
            <div >
              <div className='mb-1 font-bold'>First Name:</div>
              <input className='std-input mb-2 w-full' type='text' name='first'  />
            </div>
            <div >
              <div className='mb-1 font-bold'>Last Name:</div>
              <input className='std-input mb-2 w-full' type='text' name='last' />
            </div>
            <div >
              <div className='mb-1 font-bold'>Role:</div>
              <select className='std-input' name='role'>
                <option value='user'>Regular User</option>
                <option value='admin'>Admin (elevated privileges)</option>
                <option value='dev'>Dev (see things that are not ready yet)</option>
                <option value='inactive'>Inactive (no access)</option>
              </select>
            </div>
            <div className='my-5 flex justify-start'>
              <SubmitButton text='Create User' pendingText='Creating...' />
            </div>
          </form>
        </div>
      <Modal showModal={showEditor}>
        <h5>Edit User</h5>
        <form action={handleUpdateUser} className='flex flex-col gap-2'>
          <div>
            <div className='font-bold'>Username:</div>
            <input className='std-input w-full' type='text' name='username' defaultValue={currentUser?.username ?? ''} />
          </div>
          <div>
            <div className='font-bold'>New Password:</div>
            <input className='std-input w-full' name='password' type='password' />
          </div>
          <div>
            <div className='font-bold'>First Name:</div>
            <input className='std-input w-full' type='text' name='first' defaultValue={currentUser?.first ?? ''} />
          </div>
          <div>
            <div className='font-bold'>Last Name:</div>
            <input className='std-input w-full' type='text' name='last' defaultValue={currentUser?.last ?? ''} />
          </div>
          <div>
            <div className='font-bold'>Role:</div>
            <select className='std-input' name='role' defaultValue={currentUser?.role ?? ''}>
              <option value=''>-- Choose --</option>
              <option value='user'>Regular User</option>
              <option value='admin'>Admin (elevated privileges)</option>
              <option value='dev'>Dev (see things that are not ready yet)</option>
              <option value='inactive'>Inactive (no access)</option>
            </select>
          </div>
          {/* <div className='flex items-center gap-2'>
              <button type='button' className='danger-button-lite w-full mt-2 flex items-center justify-center gap-2' onClick={handleRemoveUser}><FontAwesomeIcon icon={faTrashCan} />Remove User</button>
            </div> */}
          <div className='flex my-5 gap-2'>
            <button
              className='secondary-button-lite flex-grow'
              onClick={(e) => {
                e.preventDefault();
                setShowEditor(false);
              }}>
              Cancel
            </button>
            <button className='std-button-lite flex-grow'>Save Changes</button>
          </div>
        </form>
      </Modal>
      <ToastContainer />
    </>
  );
}
