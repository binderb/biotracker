'use client';

import SubmitButton from '@/app/(global components)/SubmitButton';
import { Config } from '@/db/schema_configModule';
import { sleep } from '@/debug/Sleep';
import { FaCircle } from 'react-icons/fa';
import { FaShieldHalved } from 'react-icons/fa6';
import { Flip, Slide, ToastContainer, toast } from 'react-toastify';
import { authorizeGoogleDrive, clearGoogleDriveConfig, saveGoogleDriveConfig, testGoogleDriveConnection } from '../actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
  config: Config | null;
};

export default function SharedControl({ config }: Props) {
  const router = useRouter();
  const [localConfig, setLocalConfig] = useState(config ?? {
    id: 0,
    type: '',
    accountEmail: '',
    token: '',
    studiesDriveName: '',
    studiesDriveId: '',
    studiesPath: '',
    salesleadDriveName: '',
    salesleadDriveId: '',
    salesleadPath: '',
  });


  function notify(type: string, message: string) {
    if (type === 'error') {
      toast.error(message, {
        transition: Flip,
        theme: 'colored',
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 4000,
        hideProgressBar: true,
      });
    }
    if (type === 'success') {
      toast.success(message, {
        transition: Flip,
        position: toast.POSITION.TOP_RIGHT,
        theme: 'colored',
        autoClose: 0,
        hideProgressBar: true,
      });
    }
    if (type === 'info') {
      toast.info(message, {
        transition: Slide,
        position: toast.POSITION.TOP_RIGHT,
        theme: 'light',
        autoClose: 0,
        hideProgressBar: true,
      });
    }
  }

  async function handleAuthClick(formData:FormData) {
    try {
      if (!formData.get('type')) {
        throw new Error('Please select a drive type.');
      }
      if (formData.get('type') === 'google') {
        const authUrl = await authorizeGoogleDrive();
        router.push(authUrl);
      }
      if (formData.get('type') === 'onedrive') {
        throw new Error('OneDrive is not currently supported.');
      }
    } catch (err: any) {
      notify('error', err.message);
    }
  }

  async function handleDisconnectClick() {
    try {
      await clearGoogleDriveConfig();
    } catch (err: any) {
      notify('error', err.message);
    }
  }

  async function handleStudiesTestClick() {
    try {
      if (!localConfig.studiesDriveName) {
        throw new Error('Please enter a drive name.');
      }
      if (!localConfig.studiesPath) {
        throw new Error('Please enter a file path.');
      }
      const testResponse = await testGoogleDriveConnection(localConfig.studiesDriveName, localConfig.studiesPath);
      notify('info', `Files:\n${JSON.parse(testResponse).join('\n')}`);
    } catch (err: any) {
      notify('error', err.message);
    }
  }

  async function handleLeadsTestClick() {
    try {
      if (!localConfig.salesleadDriveName) {
        throw new Error('Please enter a drive name.');
      }
      if (!localConfig.salesleadPath) {
        throw new Error('Please enter a file path.');
      }
      const testResponse = await testGoogleDriveConnection(localConfig.salesleadDriveName, localConfig.salesleadPath);
      notify('info', `Files:\n${JSON.parse(testResponse).join('\n')}`);
    } catch (err: any) {
      notify('error', err.message);
    }
  }

  async function handleSave() {
    try {
      if (!localConfig.studiesDriveName) {
        throw new Error('Please enter a drive name.');
      }
      if (!localConfig.studiesPath) {
        throw new Error('Please enter a file path.');
      }
      if (!localConfig.salesleadDriveName) {
        throw new Error('Please enter a drive name.');
      }
      if (!localConfig.salesleadPath) {
        throw new Error('Please enter a file path.');
      }
      await saveGoogleDriveConfig(localConfig);
      notify('success', 'Config saved.');
    } catch (err: any) {
      notify('error', err.message);
    }
  }

  return (
    <>
      <section className='ui-box'>
        <h5>Shared Drive Connection Status</h5>
        <div>Connecting a OneDrive or Google Drive account to this app enables the automatic generation and organization of folder repositories for Sales Leads and Studies. It is required to use these modules.</div>
        <div className='flex gap-2 pt-2 items-center'>
          {config ? (
            <>
              <div className='flex items-center bg-secondary/80 rounded-md text-white px-3 py-2 gap-2'>
                <FaCircle className='text-green-400' size={9} />
                <div className='font-bold'>Connected:</div>
                {config.accountEmail}
              </div>
              <form action={handleDisconnectClick}>
              <SubmitButton text='Disconnect' pendingText='Disconnecting...' />
              </form>
            </>
          ) : (
            <form action={handleAuthClick}>
              <section className='flex flex-col gap-2 pb-4'>
                <div className='font-bold'>Drive Type:</div>
                <div className='flex gap-2'>
                  <input type='radio' id='google' name='type' value='google' />
                  <label htmlFor='google'>Google Drive</label>
                </div>
                <div className='flex gap-2'>
                  <input type='radio' id='onedrive' name='type' value='onedrive' />
                  <label htmlFor='onedrive'>OneDrive</label>
                </div>
                
              </section>
              <SubmitButton icon={<FaShieldHalved />} text='Connect Shared Drive' pendingText='Connecting...' />
            </form>
            
          )}
          
        </div>
      </section>
      <section className='bg-secondary/20 border border-secondary/80 rounded-lg p-4 gap-2 flex flex-col'>
            <h5>Repository Configuration</h5>
            <div>
              Identify the drives and file paths in your connected account that will serve as repositories managed by this app. Folder trees and associated documents will be generated at these locations when relevant actions are taken. 
            </div>
            <div className='flex flex-col gap-2'>
              <div>Studies Drive Name: </div>
              <input className='std-input' value={localConfig.studiesDriveName ?? ''} onChange={(e) => setLocalConfig({...localConfig, studiesDriveName: e.target.value})} />
              <div>Studies File Path: </div>
              <input className='std-input' value={localConfig.studiesPath ?? ''} placeholder='/...' onChange={(e) => setLocalConfig({...localConfig, studiesPath: e.target.value})} />
              <div>Sales Leads Drive Name: </div>
              <input className='std-input' value={localConfig.salesleadDriveName ?? ''} onChange={(e) => setLocalConfig({...localConfig, salesleadDriveName: e.target.value})} />
              <div>Sales Leads File Path: </div>
              <input className='std-input' value={localConfig.salesleadPath ?? ''} placeholder='/...' onChange={(e) => setLocalConfig({...localConfig, salesleadPath: e.target.value})} />
              <div className='flex items-center gap-2 pt-4'>
                <form action={handleStudiesTestClick}>
                  <SubmitButton text='Test Studies File Path' pendingText='Testing...' />
                </form>
                <form action={handleLeadsTestClick}>
                  <SubmitButton text='Test Sales Leads File Path' pendingText='Testing...' />
                </form>
                <form action={handleSave}>
                  <SubmitButton text='Save Target Directory Config' pendingText='Saving...' />
                </form>
              </div>
            </div>

       </section>
      <ToastContainer className='font-source whitespace-pre-line' />
    </>
  );
}
