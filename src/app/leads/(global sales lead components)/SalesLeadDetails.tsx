'use client';

import { Client, ProjectWithAllDetails } from '@/db/schema_clientModule';
import { ChangeEvent, useEffect, useState } from 'react';
import { getProjectsForClient } from '../new/actions';
import Link from 'next/link';
import { Form, FormRevisionWithAllLevels, FormWithAllLevels } from '@/db/schema_formsModule';
import { FaCoins, FaFileSignature, FaFlagCheckered, FaMoneyBill, FaMoneyBillWave, FaSignature, FaTrashAlt } from 'react-icons/fa';
import { User } from '@/db/schema_usersModule';
import { NewSalesLead, SalesLeadWithAllDetails, salesleadStatusEnum } from '@/db/schema_salesleadsModule';
import Modal from '@/app/(global components)/Modal';
import QuoteModal from './QuoteModal';
import { LuExternalLink } from 'react-icons/lu';
// import { extname } from 'path';
// import Image from 'next/image';
// import { FaXmark } from 'react-icons/fa6';
// import FormView from '@/app/forms/components/FormView';
// import SubmitButton from '@/app/(global components)/SubmitButton';

type Props = {
  mode: 'new' | 'view' | 'edit';
  users: User[];
  clients: Client[];
  studyPlans: FormWithAllLevels[];
  leadDetails: SalesLeadWithAllDetails;
  setLeadDetails: (leadDetails: SalesLeadWithAllDetails) => void;
  handlePublish?: Function;
};

export default function SalesLeadDetails({ mode, users, clients, leadDetails, setLeadDetails, studyPlans, handlePublish }: Props) {
  const [clientProjects, setClientProjects] = useState<ProjectWithAllDetails[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [planToAdd, setPlanToAdd] = useState('');
  const [contributorToAdd, setContributorToAdd] = useState('');

  // populate list of client projects, if client is already set.
  useEffect(() => {
    if (leadDetails.client) {
      getProjectsForClient(leadDetails.client.id).then((projects) => {
        setClientProjects(projects);
      });
    }
  }, [leadDetails.client]);

  async function handleClientChange(e: ChangeEvent<HTMLSelectElement>) {
    console.log(e.target.value);
    setLeadDetails({ ...leadDetails, client: clients.filter((client: Client) => client.id === parseInt(e.target.value))[0] });
    setLoadingProjects(true);
    if (e.target.value === '') {
      setClientProjects([]);
    } else {
      const newProjects = await getProjectsForClient(parseInt(e.target.value));
      setClientProjects(newProjects);
    }
    setLoadingProjects(false);
  }

  function handleProjectChange(e: ChangeEvent<HTMLSelectElement>) {
    setLeadDetails({ ...leadDetails, project: clientProjects.filter((project: ProjectWithAllDetails) => project.id === parseInt(e.target.value))[0] });
  }

  function handleAddPlan() {
    if (planToAdd === '') return;
    const studyPlanForm = studyPlans.filter((plan) => plan.id === parseInt(planToAdd))[0];
    const { revisions, ...simpleForm } = studyPlanForm;
    const latestrevision = studyPlanForm.revisions[studyPlanForm.revisions.length - 1];
    // for each field in latestrevision, add a salesleadformdata property with a blank value and a salesleadrevision value of leadDetails.id or 0 if that is undefined or null
    const newSections = latestrevision.sections.map((section) => {
      const newRows = section.rows.map((row) => {
        const newFields = row.fields.map((field) => {
          return {
            ...field,
            salesleadformdata: [
              {
                value: [],
                salesleadrevision: leadDetails.id ?? 0,
                sectionShapeIndex: 0,
              },
            ],
          };
        });
        return { ...row, fields: newFields };
      });
      return { ...section, rows: newRows };
    });

    const latestrevisionWithData = { ...latestrevision, sections: newSections };
    const studyPlanToAdd = { formrevision: { ...latestrevisionWithData, form: simpleForm } };
    const newStudyPlans = [...leadDetails.revisions[0].studyplans, studyPlanToAdd];
    const newStudyPlanShapes = [
      ...leadDetails.revisions[0].studyplanshapes,
      {
        salesleadrevision: leadDetails.revisions[0].id,
        studyplanrevision: latestrevision.id,
        formshape: latestrevision.sections.map((_, sectionIndex) => sectionIndex),
      },
    ];
    const newLeadDetails = { ...leadDetails, revisions: [{ ...leadDetails.revisions[0], studyplans: newStudyPlans, studyplanshapes: newStudyPlanShapes }] } as SalesLeadWithAllDetails;
    setLeadDetails(newLeadDetails);
    setPlanToAdd('');
  }

  function handleRemovePlan(id: number) {
    const newStudyPlans = leadDetails.revisions[0].studyplans.filter((plan) => plan.formrevision.form.id !== id);
    const newStudyPlanShapes = leadDetails.revisions[0].studyplanshapes.filter((shape) => shape.studyplanrevision !== id);
    setLeadDetails({ ...leadDetails, revisions: [{ ...leadDetails.revisions[0], studyplans: newStudyPlans, studyplanshapes: newStudyPlanShapes }] });
  }

  function handleAddContributor() {
    if (contributorToAdd === '') return;
    const userToAdd = users.filter((user) => user.id === parseInt(contributorToAdd))[0];
    setLeadDetails({ ...leadDetails, contributors: [...leadDetails.contributors, { contributor: userToAdd }] });
    setContributorToAdd('');
  }

  function handleRemoveContributor(id: number) {
    setLeadDetails({ ...leadDetails, contributors: [...leadDetails.contributors.filter((contributor) => contributor.contributor.id !== id)] });
  }

  function handleStatusChange(status: string) {
    const statusAsEnum = salesleadStatusEnum.enumValues.filter((enumValue) => enumValue === status)[0] ?? null;
    setLeadDetails({ ...leadDetails, status: statusAsEnum });
  }

  return (
    <>
      {/* -------------------------- READ-ONLY MODE -------------------------- */}
      {mode === 'view' && (
        <>
          <section className='ui-subbox'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr>
                  <th className='w-[20%]'></th>
                  <th className='w-[80%]'></th>
                </tr>
              </thead>
              <tbody>
                {/* Client */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold align-top py-2'>
                    <div>Client:</div>
                  </td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <div className='flex flex-col gap-2'>{`${leadDetails.client.name} - ${leadDetails.client.code}`}</div>
                  </td>
                </tr>
                {/* Project */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold align-top py-2'>
                    <div>Project:</div>
                  </td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <div className='flex flex-col gap-2'>{leadDetails.project.name ?? 'N/A'}</div>
                  </td>
                </tr>
                {/* Sales Lead Name */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold align-top py-2'>Sales Lead Name:</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <div className='flex flex-col gap-2'>{leadDetails.name}</div>
                  </td>
                </tr>
                {/* Status */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold align-top py-2'>Status:</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <div className='flex flex-col gap-2'>{leadDetails.status}</div>
                  </td>
                </tr>
                {/* Study Plans */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold align-top py-2'>Study Plans:</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <div className='flex flex-col gap-2 py-2'>
                      <section className='flex flex-col gap-2'>
                        <ul className='flex flex-col gap-1'>
                          {leadDetails.revisions[0].studyplans.length > 0 ? (
                            leadDetails.revisions[0].studyplans.map((plan) => (
                              <li key={plan.formrevision.form.id} className='flex justify-between items-center std-input rounded-md'>
                                {plan.formrevision.form.name}
                              </li>
                            ))
                          ) : (
                            <div className='italic'>Please add at least one study plan.</div>
                          )}
                        </ul>
                      </section>
                    </div>
                  </td>
                </tr>
                {/* Contributors */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold align-top py-2'>Contributors:</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <div className='flex flex-col gap-2 py-2'>
                      <section className='flex flex-col gap-2'>
                        <ul className='flex flex-col gap-1'>
                          {leadDetails.contributors
                            .map((joinTableEntry) => joinTableEntry.contributor)
                            .map((contributor) => (
                              <li key={contributor.id} className='flex justify-between items-center std-input rounded-md'>
                                <div>{contributor.id === leadDetails.author.id ? `${contributor.first} ${contributor.last} (author)` : `${contributor.first} ${contributor.last}`}</div>
                              </li>
                            ))}
                        </ul>
                      </section>
                    </div>
                  </td>
                </tr>
                {/* Quote */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-2 font-bold align-top py-2'>Quote:</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    {leadDetails.quote && leadDetails.quote.link && (
                      <div className='flex gap-2 items-center'>
                        <a className='std-button-lite' target='_blank' href={leadDetails.quote.link}>
                          <LuExternalLink />
                          View Quote
                        </a>
                      </div>
                    )}
                    {!leadDetails.quote && <div className='italic'>{`(No quote link provided)`}</div>}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </>
      )}
      {/* -------------------------- EDIT MODE -------------------------- */}
      {(mode === 'edit' || mode === 'new') && (
        <>
          <section className='ui-subbox'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr>
                  <th className='w-[20%]'></th>
                  <th className='w-[80%]'></th>
                </tr>
              </thead>
              <tbody>
                {/* Client */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold align-top py-2'>
                    <div>Client:</div>
                  </td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <div className='flex flex-col gap-2'>
                      {mode === 'new' && (<>
                      <select className='std-input w-full' onChange={handleClientChange} value={leadDetails.client?.id ?? ''}>
                        <option value=''>-- Choose --</option>
                        {clients.map((client) => (
                          <option value={client.id} key={client.id}>{`${client.name} - ${client.code}`}</option>
                        ))}
                      </select>
                      <div className='text-[12px]'>
                        {`Don't have a client code? `}
                        <Link className='std-link' href='/clients'>
                          Create one
                        </Link>{' '}
                        {`before starting this process!`}
                      </div>
                      </>)}
                      {mode === 'edit' && (<>
                      {`${leadDetails.client.name} - ${leadDetails.client.code}`}
                      
                      </>)}
                    </div>
                  </td>
                </tr>
                {/* Project */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold align-top py-2'>
                    <div>Project:</div>
                  </td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <div className='flex flex-col gap-2'>
                      {mode === 'new' && (
                      <>
                      <select className='std-input mr-2' onChange={handleProjectChange} value={leadDetails.project?.id ?? ''} disabled={!leadDetails.client}>
                        <option value=''>N/A</option>
                        {clientProjects.length > 0 && (
                          <>
                            {clientProjects.map((project) => (
                              <option value={project.id} key={project.id}>{`${project.name}`}</option>
                            ))}
                          </>
                        )}
                      </select>
                      {leadDetails.client && (
                        <>
                          {clientProjects?.length > 0 ? (
                            <div className='text-[12px]'>
                              <Link className='std-link' href={`/clients/${leadDetails.client.id}`}>
                                Create a new project
                              </Link>{' '}
                              for this client if necessary.
                            </div>
                          ) : (
                            <div className='text-[12px]'>
                              {`Haven't defined any projects for this lead yet? `}
                              <Link className='std-link' href={`/clients/${leadDetails.client.id}`}>
                                Create one here
                              </Link>
                              {`.`}
                            </div>
                          )}
                        </>
                      )}
                      
                      </>
                      )}
                      {mode === 'edit' && (<> {leadDetails.project.name} </>)}
                    </div>
                  </td>
                </tr>
                {/* Sales Lead Name */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold align-top py-2'>Sales Lead Name:</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <div className='flex flex-col gap-2'>
                      <div className='flex items-center gap-2'>
                        {leadDetails.client?.name.split(' ')[0] === '' ? '(select client)' : leadDetails.client?.name.split(' ')[0]} -{' '}
                        <input className='std-input flex-grow' name='name' value={leadDetails.name.split(/- (.*) -/s)[1]} onChange={(e) => setLeadDetails({ ...leadDetails, name: `${leadDetails.client?.name.split(' ')[0] ?? ''} - ${e.target.value} - ${leadDetails.created.getFullYear()}${(leadDetails.created.getMonth() + 1).toString().padStart(2, '0')}${leadDetails.created.getDate().toString().padStart(2, '0')}` })} />
                        {' - '}
                        {leadDetails.created.getFullYear()}
                        {(leadDetails.created.getMonth() + 1).toString().padStart(2, '0')}
                        {leadDetails.created.getDate().toString().padStart(2, '0')}
                      </div>

                      <div className='text-[12px]'>Add a brief, 1-2 word description to help you identify this lead on the dashboard.</div>
                    </div>
                  </td>
                </tr>
                {/* Status */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold align-top py-2'>Status:</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <select className='std-input w-full' name='status' value={leadDetails.status ?? ''} onChange={(e) => handleStatusChange(e.target.value)}>
                      <option value=''>-- Choose --</option>
                      {salesleadStatusEnum.enumValues.map((key) => (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
                {/* Study Plans */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold align-top py-2'>Study Plans:</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <div className='flex flex-col gap-2 py-2'>
                      <section className='flex flex-col gap-2'>
                        <section className='flex items-center'>
                          <button className='std-button-lite mr-2' disabled={planToAdd === ''} onClick={handleAddPlan}>
                            Add
                          </button>
                          <select className='std-input flex-grow' onChange={(e) => setPlanToAdd(e.target.value)} value={planToAdd}>
                            <option value=''>-- Choose --</option>
                            {studyPlans.map((plan) => (
                              <option key={plan.id} value={plan.id} disabled={leadDetails.revisions[0].studyplans.filter((listPlan) => plan.id === listPlan.formrevision.form.id).length > 0}>
                                {plan.name}
                              </option>
                            ))}
                          </select>
                        </section>
                        <ul className='flex flex-col gap-1'>
                          {leadDetails.revisions[0].studyplans.length > 0 ? (
                            leadDetails.revisions[0].studyplans.map((plan) => (
                              <li key={plan.formrevision.form.id} className='flex justify-between items-center std-input rounded-md'>
                                {plan.formrevision.form.name}
                                <button className='secondary-button-lite' onClick={() => handleRemovePlan(plan.formrevision.form.id)}>
                                  <FaTrashAlt />
                                </button>
                              </li>
                            ))
                          ) : (
                            <div className='italic'>Please add at least one study plan.</div>
                          )}
                        </ul>
                      </section>
                    </div>
                  </td>
                </tr>
                {/* Contributors */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold align-top py-2'>Contributors:</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>
                    <div className='flex flex-col gap-2 py-2'>
                      <section className='flex flex-col gap-2'>
                        <section className='flex items-center'>
                          <button className='std-button-lite mr-2' disabled={contributorToAdd === ''} onClick={handleAddContributor}>
                            Add
                          </button>
                          <select className='std-input flex-grow' onChange={(e) => setContributorToAdd(e.target.value)} value={contributorToAdd}>
                            <option value=''>-- Choose --</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id} disabled={leadDetails.contributors.map((joinTableEntry) => joinTableEntry.contributor).filter((usersList) => usersList.id === user.id).length > 0}>
                                {`${user.first} ${user.last}`}
                              </option>
                            ))}
                          </select>
                        </section>
                        <ul className='flex flex-col gap-1'>
                          {leadDetails.contributors
                            .map((joinTableEntry) => joinTableEntry.contributor)
                            .map((contributor) => (
                              <li key={contributor.id} className='flex justify-between items-center std-input rounded-md'>
                                <div>{contributor.id === leadDetails.author.id ? `${contributor.first} ${contributor.last} (author)` : `${contributor.first} ${contributor.last}`}</div>
                                <button className='secondary-button-lite' onClick={() => handleRemoveContributor(contributor.id)} disabled={contributor.id === leadDetails.author.id}>
                                  <FaTrashAlt />
                                </button>
                              </li>
                            ))}
                        </ul>
                      </section>
                    </div>
                  </td>
                </tr>
                {/* Quote */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold align-top py-2'>Quote:</td>
                  <td className='bg-white/50 border border-secondary/80 p-2'>
                    {leadDetails.quote && leadDetails.quote.link && (
                      <div className='flex gap-2 items-center'>
                        <a className='std-button-lite' target='_blank' href={leadDetails.quote.link}>
                          <LuExternalLink />
                          View Quote
                        </a>
                        <QuoteModal mode='edit' leadDetails={leadDetails} setLeadDetails={setLeadDetails} salesleadId={leadDetails.id} clientId={leadDetails.client.id} projectId={leadDetails.project.id} quoteId={leadDetails.quote.id} quoteIndex={leadDetails.quote.index} quoteLink={leadDetails.quote.link} />
                      </div>
                    )}
                    {!leadDetails.quote && (
                      <>
                        <QuoteModal mode='new' leadDetails={leadDetails} setLeadDetails={setLeadDetails} salesleadId={leadDetails.id} clientId={leadDetails.client.id} projectId={leadDetails.project.id} />
                      </>
                    )}
                  </td>
                </tr>
                {/* Publish */}
                <tr>
                  <td className='bg-white/50 border border-secondary/80 p-1 font-bold align-top py-2'>Publish:</td>
                  <td className='bg-white/50 border border-secondary/80 p-2'>
                    <div className='flex flex-col gap-2 justify-start items-start'>
                      {handlePublish && (
                        <button className='std-button-lite' onClick={() => handlePublish()}>
                          <FaFlagCheckered />
                          Publish
                        </button>
                      )}

                      {/* <div>
                        {`Status: ${leadDetails.status}`}
                      </div> */}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </>
      )}
    </>
  );
}
