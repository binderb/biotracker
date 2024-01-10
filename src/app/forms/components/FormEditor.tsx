'use client';

import { useState } from 'react';
import { Form, FormRevisionWithAllLevels, FormWithAllLevels, formDocTypeEnum, formFunctionalAreaEnum } from '@/db/schema';
import FormTextEditor from './FormTextEditor';
import FormView from '@/app/forms/components/FormView';
import SubmitButton from '@/app/(global components)/SubmitButton';
import { sleep } from '@/debug/Sleep';
import { addNewForm } from '../actions';
import { encodeText } from '../functions';
import { useRouter } from 'next/navigation';

type Props = {
  mode: 'new' | 'edit',
  form?: FormWithAllLevels,
}

export default function FormEditor({ mode, form }: Props) {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState('texteditor');
  const [formContents, setFormContents] = useState<FormRevisionWithAllLevels>((mode === 'edit' && form) ? form.revisions[0] : {
    id: -1,
    form: -1,
    created: new Date(),
    sections: [],
    note: 'Form created.'
  });
  const [textEditorText, setTextEditorText] = useState((mode === 'edit' && form) ? encodeText(form.revisions[0]) : '');
  const [status, setStatus] = useState('');

  const tabs = [
    {
      name: 'texteditor',
      displayName: 'Text Editor',
    },
    {
      name: 'formpreview',
      displayName: 'Preview',
    },
  ];

  async function handleCreateNewForm(formData: FormData) {
    try {
      if (!formData.get('name')) throw new Error('Form name is required');
      if (!formData.get('docType')) throw new Error('Document type is required');
      if (!formData.get('functionalArea')) throw new Error('Functional area is required');
      const newForm: FormWithAllLevels = {
        id: -1,
        index: -1,
        name: formData.get('name') as string,
        docType: formData.get('docType') as Form['docType'],
        functionalArea: formData.get('functionalArea') as Form['functionalArea'],
        revisions: [formContents],
      };
      const newFormResponse = await addNewForm(newForm);
      router.push('/forms');
    } catch (err: any) {
      setStatus(err.message);
    }
  }

  async function handleUpdateForm(formData: FormData) {
    try {
      await sleep(1000);
      throw new Error("Update functionality not yet implemented.");
    } catch (err:any) {
      setStatus(err.message);
    }
  }

  return (
    <>
      <form className='ui-box' action={mode === 'new' ? handleCreateNewForm : handleUpdateForm}>
        <section className='flex justify-between items-center'>
          <h5>Basic Details</h5>
          
          <div className='flex items-center gap-2'>
            <div className='text-[#800]'>{status}</div>
            {mode === 'new' && (
              <SubmitButton text='Create Form' pendingText='Creating...' />
            )}
            {mode === 'edit' && (
              <SubmitButton text='Update Form' pendingText='Updating...' />
            )}
          </div>
          
        </section>
        <section className='ui-subbox'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr>
                <th className='w-[20%]'></th>
                <th className='w-[80%]'></th>
              </tr>
            </thead>
            <tbody>
              {/* Name */}
              <tr>
                <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>
                  <div>Name</div>
                </td>
                <td className='bg-white/50 border border-secondary/80 p-1'>
                  <input className='std-input w-full' name='name' defaultValue={(mode === 'edit' && form) ? form.name : ''} />
                </td>
              </tr>
              {/* DocType */}
              <tr>
                <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Document Type</td>
                <td className='bg-white/50 border border-secondary/80 p-1'>
                  <select className='std-input w-full' name='docType' defaultValue={(mode === 'edit' && form) ? form.docType : ''}>
                    <option value=''>-- Select a Document Type --</option>
                    {formDocTypeEnum.enumValues.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              {/* Functional Area */}
              <tr>
                <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Functional Area</td>
                <td className='bg-white/50 border border-secondary/80 p-1'>
                  <select className='std-input w-full' name='functionalArea' defaultValue={(mode === 'edit' && form) ? form.functionalArea : ''}>
                    <option value=''>-- Select a Functional Area --</option>
                    {formFunctionalAreaEnum.enumValues.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        <h5>Form Contents</h5>
        <div className='tab-group'>
          {tabs.map((tab) => (
            <button key={tab.name} name={tab.name} className={tab.name === currentTab ? 'selected' : ''} onClick={(e) => {e.preventDefault();setCurrentTab(tab.name)}}>
              {tab.displayName}
            </button>
          ))}
        </div>
        {currentTab === 'texteditor' && <FormTextEditor formContents={formContents} setFormContents={setFormContents} text={textEditorText} setText={setTextEditorText} />}
        {currentTab === 'formpreview' && <FormView mode='view' formContents={formContents} />}
      </form>
    </>
  );
}
