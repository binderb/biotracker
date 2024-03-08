'use client';
import { ClientWithAllDetails } from '@/db/schema_clientModule';
import { FormRevisionWithAllLevels, SalesFormRevisionWithAllLevelsAndData } from '@/db/schema_formsModule';
import { SalesLeadWithAllDetails } from '@/db/schema_salesleadsModule';
import { User } from '@/db/schema_usersModule';
import { cloneDeep } from 'lodash';
import { Fragment, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import { FaX } from 'react-icons/fa6';

type Props = {
  mode: 'view' | 'salesleadreadonly' | 'salesleadedit';
  formContents: FormRevisionWithAllLevels;
  leadDetails?: SalesLeadWithAllDetails;
  setLeadDetails?: (leadDetails: SalesLeadWithAllDetails) => void;
  currentStudyPlanIndex?: number;
  users?: User[];
  client?: ClientWithAllDetails[];
};

export default function FormView({ formContents, mode, leadDetails, setLeadDetails, currentStudyPlanIndex, users, client }: Props) {
  const [formRenderArray, setFormRenderArray] = useState<SalesFormRevisionWithAllLevelsAndData>(
    (mode === 'salesleadedit' || mode === 'salesleadreadonly') && leadDetails && currentStudyPlanIndex
      ? {
        ...leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision,
        sections: (leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[]).map((sectionIndex) => {
          return {
            ...leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.sections[sectionIndex],
          };
        }),
      }
      : formContents as SalesFormRevisionWithAllLevelsAndData
  );

  // need useEffect to update formRenderArray when leadDetails or currentStudyPlanIndex changes.
  useEffect(() => {
    if ((mode === 'salesleadedit' || mode === 'salesleadreadonly') && leadDetails && currentStudyPlanIndex !== undefined) {
      const newFormRenderArray = {
        ...leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision,
        sections: (leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[]).map((sectionIndex, formShapeIndex) => {
          return {
            ...leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.sections[sectionIndex],
            rows: leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.sections[sectionIndex].rows.map((row) => {
              return {
                ...row,
                fields: row.fields.map((field) => {
                  return {
                    ...field,
                    // want to filter for only the salesleadformdata that match the instance of this section that's currently being mapped over. So... we have to find the first occurrence of sectionIndex in the formshape array, and subtract its index from the current index to get the instance number.  
                    salesleadformdata: field.salesleadformdata.filter((salesleadformdata) => salesleadformdata.sectionShapeIndex === formShapeIndex - (leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[]).indexOf(sectionIndex)),

                  };
                }),
              };
            }),
          };
        }),
      };
      setFormRenderArray(newFormRenderArray);
    } else {
      setFormRenderArray(formContents as SalesFormRevisionWithAllLevelsAndData);
    }
  }, [leadDetails, currentStudyPlanIndex, formContents, mode]);

  function handleTextChange(currentStudyPlanIndex: number, templateSectionIndex: number, rowIndex: number, fieldIndex: number, salesleadformdataIndex: number, sectionShapeIndex: number, value: string) {
    if (leadDetails && setLeadDetails) {
      const newLeadDetails = { ...leadDetails };
      (newLeadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.sections[templateSectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata.filter((formData) => formData.sectionShapeIndex === sectionShapeIndex)[salesleadformdataIndex].value as string[])[0] = value;
      setLeadDetails(newLeadDetails);
    }
  }

  function handleCheckboxChange(currentStudyPlanIndex: number, sectionIndex: number, rowIndex: number, fieldIndex: number, paramIndex: number, value: boolean) {
    if (leadDetails && setLeadDetails) {
      const newLeadDetails = { ...leadDetails };
      (newLeadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string[])[paramIndex] = value ? 'true' : 'false';
      setLeadDetails(newLeadDetails);
    }
  }

  function handleDateChange(currentStudyPlanIndex: number, sectionIndex: number, rowIndex: number, fieldIndex: number, date: Date | null) {
    if (leadDetails && setLeadDetails) {
      const newLeadDetails = { ...leadDetails };
      (newLeadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string[])[0] = date ? date.toISOString() : '';
      setLeadDetails(newLeadDetails);
    }
  }

  function handleAddExtensibleSection(currentStudyPlanIndex: number, sectionIndex: number, templateSectionIndex: number) {
    if (!leadDetails || !setLeadDetails) return;
    const newLeadDetails = cloneDeep(leadDetails);
    // Modify the section shape array, splicing in a new number that matches the sectionShapeIndex after the current sectionIndex.
    (newLeadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[]).splice(sectionIndex + 1, 0, templateSectionIndex);
    // for every field in every row of the section, add a new salesleadformdata object and increment its sectionShapeIndex.
    for (const row of newLeadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.sections[templateSectionIndex].rows) {
      for (const field of row.fields) {
        // shift the sectionShapeIndex of every downstream salesleadformdata object up by one.
        for (const salesleadformdata of field.salesleadformdata) {
          if (salesleadformdata.sectionShapeIndex >= (sectionIndex + 1) - (newLeadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[]).indexOf(templateSectionIndex)) {
            salesleadformdata.sectionShapeIndex++;
          }
        }
        field.salesleadformdata.push({
          id: -1,
          salesleadrevision: newLeadDetails.revisions[0].id,
          formfield: field.id,
          // This should be the index of the new section in the formshape array, minus the index of the first occurrence of the section in the formshape array.
          sectionShapeIndex: (sectionIndex + 1) - (newLeadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[]).indexOf(templateSectionIndex),
          value: [''],
        });

      }
    }
    setLeadDetails(newLeadDetails);
  }

  function handleRemoveExtensibleSection(currentStudyPlanIndex: number, sectionIndex: number, templateSectionIndex: number) {
    if (!leadDetails || !setLeadDetails) return;
    const newLeadDetails = cloneDeep(leadDetails);
    // Modify the section shape array, splicing out the number that matches the sectionShapeIndex at the current sectionIndex.
    (newLeadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[]).splice(sectionIndex, 1);
    // for every field in every row of the section, remove the salesleadformdata object with the corresponding sectionShapeIndex and decrement the sectionShapeIndex property on all other salesleadformdata objects that had a sectionShapeIndex greater than the one that was removed.
    for (const row of newLeadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.sections[templateSectionIndex].rows) {
      for (const field of row.fields) {
        // remove the salesleadformdata objects with the corresponding sectionShapeIndex.
        field.salesleadformdata = field.salesleadformdata.filter((salesleadformdata) => salesleadformdata.sectionShapeIndex !== sectionIndex - (newLeadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[]).indexOf(templateSectionIndex));
        // shift the sectionShapeIndex of every downstream salesleadformdata object down by one.
        for (const salesleadformdata of field.salesleadformdata) {
          if (salesleadformdata.sectionShapeIndex > sectionIndex - (newLeadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[]).indexOf(templateSectionIndex)) {
            salesleadformdata.sectionShapeIndex--;
          }
        }
      }
    }

    setLeadDetails(newLeadDetails);

  }

  function handleAddExtensibleRow(currentStudyPlanIndex: number, templateSectionIndex: number, rowIndex: number, salesleadformdataIndex: number, sectionShapeIndex: number) {
    if (!leadDetails || !setLeadDetails) return;
    const newLeadDetails = cloneDeep(leadDetails);
    for (const field of newLeadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.sections[templateSectionIndex].rows[rowIndex].fields) {
      field.salesleadformdata.splice(field.salesleadformdata.indexOf(field.salesleadformdata.filter((e) => e.sectionShapeIndex === sectionShapeIndex)[salesleadformdataIndex]) + 1, 0, {
        id: -1,
        salesleadrevision: newLeadDetails.revisions[0].id,
        formfield: field.id,
        sectionShapeIndex: sectionShapeIndex,
        value: [''],
      });
    }
    setLeadDetails(newLeadDetails);
  }

  function handleRemoveExtensibleRow(currentStudyPlanIndex: number, templateSectionIndex: number, rowIndex: number, salesleadformdataIndex: number, sectionShapeIndex: number) {
    if (!leadDetails || !setLeadDetails) return;
    const newLeadDetails = cloneDeep(leadDetails);
    for (const field of newLeadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.sections[templateSectionIndex].rows[rowIndex].fields) {
      field.salesleadformdata.splice(field.salesleadformdata.indexOf(field.salesleadformdata.filter((e) => e.sectionShapeIndex === sectionShapeIndex)[salesleadformdataIndex]), 1);
    }
    setLeadDetails(newLeadDetails);
  }

  return (
    <>
      <section className='ui-subbox'>
        {formRenderArray.sections.map((section, sectionIndex) => (
          <Fragment key={sectionIndex}>
            <section>
              {/* ----------------- FORM MODULE VIEW MODE ----------------- */}
              {mode === 'view' && (
                <section className='flex items-center justify-between py-2'>

                  {section.extensible && (
                    <>
                      <h6 className='font-bold'>{section.name} 1:</h6>
                      <button className='std-button-lite' onClick={(e) => e.preventDefault()}>
                        <FaPlus />
                      </button>
                    </>
                  )}
                  {!section.extensible && (
                    <>
                      <h6 className='font-bold'>{section.name}:</h6>
                    </>
                  )}
                </section>
              )}
              {/* ----------------- SALES LEAD READ-ONLY MODE ----------------- */}
              {mode === 'salesleadreadonly' && (
                <section className='flex items-center justify-between py-2'>

                  {section.extensible &&
                    leadDetails &&
                    currentStudyPlanIndex !== undefined && (
                      <>
                        <h6 className='font-bold whitespace-pre'>{section.name} {sectionIndex - (leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[])[sectionIndex] + 1}:</h6>
                        <div className='flex gap-1'></div>
                      </>
                    )}
                  {!section.extensible && (
                    <>
                      <h6 className='font-bold'>{section.name}:</h6>
                    </>
                  )}
                </section>
              )}
              {/* ----------------- SALES LEAD EDIT MODE ----------------- */}
              {mode === 'salesleadedit' && (
                <section className='flex items-center justify-between py-2'>

                  {section.extensible &&
                    leadDetails &&
                    currentStudyPlanIndex !== undefined && (
                      <>
                        <h6 className='font-bold whitespace-pre'>{section.name} {sectionIndex - (leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[])[sectionIndex] + 1}:</h6>
                        <div className='flex gap-1'>
                          {(formRenderArray.sections[sectionIndex].rows[0].fields[0].salesleadformdata[0].sectionShapeIndex !== 0 || formRenderArray.sections.filter((section) => section.rows[0].fields[0].salesleadformdata[0].sectionShapeIndex > 0).length > 0) && (
                            <button
                              className='secondary-button-lite'
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveExtensibleSection(currentStudyPlanIndex, sectionIndex, (leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[])[sectionIndex]);
                              }}>
                              <FaTrashAlt />
                            </button>
                          )}
                          <button className='std-button-lite' onClick={(e) => { e.preventDefault(); handleAddExtensibleSection(currentStudyPlanIndex, sectionIndex, (leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[])[sectionIndex]) }}>
                            <FaPlus />
                          </button>

                        </div>

                      </>
                    )}
                  {!section.extensible && (
                    <>
                      <h6 className='font-bold'>{section.name}:</h6>
                    </>
                  )}
                </section>
              )}
              <table className='w-full text-left border-collapse'>
                <thead>
                  <tr>
                    {Math.max(...section.rows.map((row) => row.fields.length)) === 1 && <th className='w-[100%]'></th>}
                    {Math.max(...section.rows.map((row) => row.fields.length)) === 2 && (
                      <>
                        <th className='w-[20%]'></th>
                        <th className='w-[80%]'></th>
                      </>
                    )}
                    {Math.max(...section.rows.map((row) => row.fields.length)) >= 3 && (
                      <>
                        {new Array(Math.max(...section.rows.map((row) => row.fields.length))).fill(0).map((_, index) => (
                          <th key={index}></th>
                        ))}
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, rowIndex) => (
                    <Fragment key={rowIndex}>
                      {/* ----------------- FORM MODULE VIEW MODE ----------------- */}
                      {mode === 'view' && (
                        <>
                          <tr>
                            {row.fields.map((field, fieldIndex) => (
                              <td key={fieldIndex} className='bg-white/50 border border-secondary/80 p-1 align-top'>
                                {field.type === 'label' && (
                                  <>
                                    {row.extensible && (
                                      <div className='font-bold'>
                                        {Array.isArray(field.params) && field.params.length > 0 && field.params[0]}
                                        {` 1`}:
                                      </div>
                                    )}
                                    {!row.extensible && <div className='font-bold'>{Array.isArray(field.params) && field.params.length > 0 && field.params[0]}:</div>}
                                  </>
                                )}
                                {field.type === 'input' && (
                                  <>
                                    {row.extensible && (
                                      <div className='flex gap-2 items-center'>
                                        <input className='std-input w-full' />
                                        <button className='std-button-lite' onClick={(e) => e.preventDefault()}>
                                          <FaPlus />
                                        </button>
                                      </div>
                                    )}
                                    {!row.extensible && <input className='std-input w-full' />}
                                  </>
                                )}
                                {field.type === 'textarea' && <textarea className='std-input w-full h-[100px] resize-none align-top' />}
                                {field.type === 'checkbox' && (
                                  <label className='form-control'>
                                    <input type='checkbox' />
                                    {Array.isArray(field.params) && field.params.length > 0 && field.params[0]}
                                  </label>
                                )}
                                {field.type === 'multicheckbox' && (
                                  <>
                                    {Array.isArray(field.params) && field.params.length > 0 && (
                                      <>
                                        {field.params.map((param, index) => (
                                          <label key={index} className='form-control'>
                                            <input type='checkbox' />
                                            {param}
                                          </label>
                                        ))}
                                      </>
                                    )}
                                  </>
                                )}
                                {field.type === 'date' && <DatePicker className='std-input w-full' dateFormat='MM/dd/yyyy' selected={null} onChange={() => { }} />}
                                {field.type === 'database' && (
                                  <>
                                    {Array.isArray(field.params) && field.params.length > 0 && (
                                      <>
                                        {field.params[0] === 'users' && (
                                          <select className='std-input italic w-full'>
                                            <option>(List of users)</option>
                                          </select>
                                        )}
                                        {field.params[0] === 'contacts' && (
                                          <select className='std-input italic w-full'>
                                            <option>(List of project contacts)</option>
                                          </select>
                                        )}
                                      </>
                                    )}
                                  </>
                                )}
                                {field.type === 'generated' && (
                                  <>
                                    {Array.isArray(field.params) && field.params.length > 0 && (
                                      <>
                                        {field.params[0] === 'studyId' && <div className='italic'>(Study ID)</div>}
                                        {field.params[0] === 'clientName' && <div className='italic'>(Client Name)</div>}
                                        {field.params[0] === 'projectName' && <div className='italic'>(Project Name)</div>}
                                        {field.params[0] === 'projectNDA' && <div className='italic'>(Project NDA status)</div>}
                                      </>
                                    )}
                                  </>
                                )}
                              </td>
                            ))}
                          </tr>
                        </>
                      )}
                      {/* ----------------- SALES LEAD READ-ONLY MODE ----------------- */}
                      {mode === 'salesleadreadonly' &&
                        leadDetails &&
                        currentStudyPlanIndex !== undefined &&
                        formRenderArray.sections[sectionIndex].rows[rowIndex].fields[0].salesleadformdata.map((_, salesleadformdataIndex) => (

                          <tr key={`${rowIndex}_${salesleadformdataIndex}`}>
                            {/* {JSON.stringify((leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[])[sectionIndex])} */}
                            {row.fields.map((field, fieldIndex) => (
                              <td key={fieldIndex} className='bg-white/50 border border-secondary/80 p-1 align-top'>
                                {field.type === 'label' && (
                                  <>
                                    {row.extensible && (
                                      <div className='font-bold'>
                                        {Array.isArray(field.params) && field.params.length > 0 && field.params[0]}
                                        {` ${salesleadformdataIndex + 1}`}:
                                      </div>
                                    )}
                                    {!row.extensible && <div className='font-bold'>{Array.isArray(field.params) && field.params.length > 0 && field.params[0]}:</div>}
                                  </>
                                )}
                                {field.type === 'input' && (
                                  <>
                                    <div className='flex gap-1 items-center'>
                                      <div>
                                        {(formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[salesleadformdataIndex].value as string[])[0] ?? '(no entry)'}
                                      </div>
                                    </div>
                                  </>
                                )}
                                {field.type === 'textarea' && (
                                  <>
                                    <div className='flex gap-1 items-center'>
                                      <div>
                                        {(formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[salesleadformdataIndex].value as string[])[0] ?? '(no entry)'}
                                      </div>
                                    </div>
                                  </>
                                )}
                                {field.type === 'checkbox' && (
                                  <label className='form-control'>
                                    <input type='checkbox' disabled={true} checked={formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value === 'true' ? true : false} onChange={(e) => { }} />
                                    {Array.isArray(field.params) && field.params.length > 0 && field.params[0]}
                                  </label>
                                )}
                                {field.type === 'multicheckbox' && (
                                  <>
                                    {Array.isArray(field.params) && field.params.length > 0 && (
                                      <>
                                        {field.params.map((param, paramIndex) => (
                                          <label key={paramIndex} className='form-control'>
                                            <input type='checkbox' disabled={true} checked={(formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string[])[paramIndex] === 'true' ? true : false} onChange={(e) => { }} />
                                            {param}
                                          </label>
                                        ))}
                                      </>
                                    )}
                                  </>
                                )}
                                {field.type === 'date' && (
                                  <div className='flex gap-1 items-center'>
                                    <div>
                                      {(formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[salesleadformdataIndex].value as string[])[0] ?? '(no entry)'}
                                    </div>
                                  </div>
                                )}
                                {field.type === 'database' && (
                                  <>
                                    {Array.isArray(field.params) && field.params.length > 0 && (
                                      <>
                                        {field.params[0] === 'users' && users && (
                                          <div className='flex gap-1 items-center'>
                                            <div>
                                              {(formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string[])[0] !== '' && (
                                                <>
                                                  {`${(users.filter((user) => user.id.toString() === (formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string[])[0]))[0].first} ${(users.filter((user) => user.id.toString() === (formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string[])[0]))[0].last}`}
                                                </>
                                              )}
                                              {(formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string[])[0] === '' && (
                                                <>
                                                  {`(no entry)`}
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                        {field.params[0] === 'contacts' && leadDetails.project.contacts && (
                                          <>
                                            <div className='flex gap-1 items-center'>
                                              <div>
                                                {(formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string[])[0] !== '' && (
                                                  <>
                                                    {leadDetails.project.contacts.filter((joinTableEntry) => joinTableEntry.contact.id.toString() === (formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string[])[0])[0].contact.first} {leadDetails.project.contacts.filter((joinTableEntry) => joinTableEntry.contact.id.toString() === (formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string[])[0])[0].contact.last}
                                                  </>
                                                )}
                                                {(formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string[])[0] === '' && (
                                                  <>
                                                    {`(no entry)`}
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                            <div className='italic'>
                                              <select className='std-input w-full' value={(formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string[])[0]} onChange={(e) => handleTextChange(currentStudyPlanIndex, (leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[])[sectionIndex], rowIndex, fieldIndex, salesleadformdataIndex, formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[salesleadformdataIndex].sectionShapeIndex, e.target.value)}>
                                                <option value=''>-- Choose --</option>
                                                {leadDetails.project.contacts
                                                  .map((joinTableEntry) => joinTableEntry.contact)
                                                  .map((contact) => (
                                                    <option key={contact.id} value={contact.id}>
                                                      {`${contact.first} ${contact.last}`}
                                                    </option>
                                                  ))}
                                              </select>
                                            </div>
                                          </>
                                        )}
                                      </>
                                    )}
                                  </>
                                )}
                                {field.type === 'generated' && (
                                  <>
                                    {Array.isArray(field.params) && field.params.length > 0 && (
                                      <>
                                        {field.params[0] === 'studyId' && <div className='italic'>(Study ID will be generated when lead is published)</div>}
                                        {field.params[0] === 'clientName' && <div>{leadDetails.client.name}</div>}
                                        {field.params[0] === 'projectName' && <div>{leadDetails.project.name}</div>}
                                        {field.params[0] === 'projectNDA' && <div>{leadDetails.project.nda ? 'Yes' : 'No'}</div>}
                                      </>
                                    )}
                                  </>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      {/* ----------------- SALES LEAD EDIT MODE ----------------- */}
                      {mode === 'salesleadedit' &&
                        leadDetails &&
                        currentStudyPlanIndex !== undefined &&
                        formRenderArray.sections[sectionIndex].rows[rowIndex].fields[0].salesleadformdata.map((_, salesleadformdataIndex) => (

                          <tr key={`${rowIndex}_${salesleadformdataIndex}`}>
                            {/* {JSON.stringify((leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[])[sectionIndex])} */}
                            {row.fields.map((field, fieldIndex) => (
                              <td key={fieldIndex} className='bg-white/50 border border-secondary/80 p-1 align-top'>
                                {field.type === 'label' && (
                                  <>
                                    {row.extensible && (
                                      <div className='font-bold'>
                                        {Array.isArray(field.params) && field.params.length > 0 && field.params[0]}
                                        {` ${salesleadformdataIndex + 1}`}:
                                      </div>
                                    )}
                                    {!row.extensible && <div className='font-bold'>{Array.isArray(field.params) && field.params.length > 0 && field.params[0]}:</div>}
                                  </>
                                )}
                                {field.type === 'input' && (
                                  <>
                                    {row.extensible && (
                                      <div className='flex gap-1 items-center'>
                                        <input className='std-input w-full' value={formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[salesleadformdataIndex].value as string} onChange={(e) => handleTextChange(currentStudyPlanIndex, (leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[])[sectionIndex], rowIndex, fieldIndex, salesleadformdataIndex, formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[salesleadformdataIndex].sectionShapeIndex, e.target.value)} />
                                        {(salesleadformdataIndex !== 0 || formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata.length > 1) && (
                                          <button
                                            className='secondary-button-lite'
                                            onClick={(e) => {
                                              e.preventDefault();
                                              handleRemoveExtensibleRow(currentStudyPlanIndex, (leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[])[sectionIndex], rowIndex, salesleadformdataIndex, sectionIndex - (leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[]).indexOf((leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[])[sectionIndex]));
                                            }}>
                                            <FaTrashAlt />
                                          </button>
                                        )}
                                        <button
                                          className='std-button-lite'
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleAddExtensibleRow(currentStudyPlanIndex, (leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[])[sectionIndex], rowIndex, salesleadformdataIndex, sectionIndex - (leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[]).indexOf((leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[])[sectionIndex]));
                                          }}>
                                          <FaPlus />
                                        </button>
                                      </div>
                                    )}
                                    {!row.extensible && <input className='std-input w-full' value={formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string} onChange={(e) => handleTextChange(currentStudyPlanIndex, (leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[])[sectionIndex], rowIndex, fieldIndex, salesleadformdataIndex, formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[salesleadformdataIndex].sectionShapeIndex, e.target.value)} />}
                                  </>
                                )}
                                {field.type === 'textarea' && (
                                  <>
                                    <textarea className='std-input w-full h-[100px] resize-none align-top' value={formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string} onChange={(e) => handleTextChange(currentStudyPlanIndex, (leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[])[sectionIndex], rowIndex, fieldIndex, salesleadformdataIndex, formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[salesleadformdataIndex].sectionShapeIndex, e.target.value)} />
                                  </>
                                )}
                                {field.type === 'checkbox' && (
                                  <label className='form-control'>
                                    <input type='checkbox' checked={formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value === 'true' ? true : false} onChange={(e) => handleCheckboxChange(currentStudyPlanIndex, sectionIndex, rowIndex, fieldIndex, 0, e.target.checked)} />
                                    {Array.isArray(field.params) && field.params.length > 0 && field.params[0]}
                                  </label>
                                )}
                                {field.type === 'multicheckbox' && (
                                  <>
                                    {Array.isArray(field.params) && field.params.length > 0 && (
                                      <>
                                        {field.params.map((param, paramIndex) => (
                                          <label key={paramIndex} className='form-control'>
                                            <input type='checkbox' checked={(formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string[])[paramIndex] === 'true' ? true : false} onChange={(e) => handleCheckboxChange(currentStudyPlanIndex, sectionIndex, rowIndex, fieldIndex, paramIndex, e.target.checked)} />
                                            {param}
                                          </label>
                                        ))}
                                      </>
                                    )}
                                  </>
                                )}
                                {field.type === 'date' && (
                                  <DatePicker
                                    className='std-input w-full'
                                    dateFormat='MM/dd/yyyy'
                                    selected={(formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string[])[0] ? new Date((formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string[])[0]) : null}
                                    onChange={(date) => handleDateChange(currentStudyPlanIndex, sectionIndex, rowIndex, fieldIndex, date)}
                                  />
                                )}
                                {field.type === 'database' && (
                                  <>
                                    {Array.isArray(field.params) && field.params.length > 0 && (
                                      <>
                                        {field.params[0] === 'users' && users && (
                                          <select className='std-input w-full' value={(formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string[])[0]} onChange={(e) => handleTextChange(currentStudyPlanIndex, (leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[])[sectionIndex], rowIndex, fieldIndex, salesleadformdataIndex, formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[salesleadformdataIndex].sectionShapeIndex, e.target.value)}>
                                            <option value=''>-- Choose --</option>
                                            {users.map((user) => (
                                              <option key={user.id} value={user.id}>{`${user.first} ${user.last}`}</option>
                                            ))}
                                          </select>
                                        )}
                                        {field.params[0] === 'contacts' && leadDetails.project.contacts && (
                                          <div className='italic'>
                                            <select className='std-input w-full' value={(formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string[])[0]} onChange={(e) => handleTextChange(currentStudyPlanIndex, (leadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape as number[])[sectionIndex], rowIndex, fieldIndex, salesleadformdataIndex, formRenderArray.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[salesleadformdataIndex].sectionShapeIndex, e.target.value)}>
                                              <option value=''>-- Choose --</option>
                                              {leadDetails.project.contacts
                                                .map((joinTableEntry) => joinTableEntry.contact)
                                                .map((contact) => (
                                                  <option key={contact.id} value={contact.id}>
                                                    {`${contact.first} ${contact.last}`}
                                                  </option>
                                                ))}
                                            </select>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </>
                                )}
                                {field.type === 'generated' && (
                                  <>
                                    {Array.isArray(field.params) && field.params.length > 0 && (
                                      <>
                                        {field.params[0] === 'studyId' && <div className='italic'>(Study ID will be generated when lead is published)</div>}
                                        {field.params[0] === 'clientName' && <div>{leadDetails.client.name}</div>}
                                        {field.params[0] === 'projectName' && <div>{leadDetails.project.name}</div>}
                                        {field.params[0] === 'projectNDA' && <div>{leadDetails.project.nda ? 'Yes' : 'No'}</div>}
                                      </>
                                    )}
                                  </>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </section>
          </Fragment>
        ))}
      </section>
    </>
  );
}
