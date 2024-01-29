'use client';

import { Client, ClientWithAllDetails, ProjectWithAllDetails } from '@/db/schema_clientModule';
import { ChangeEvent, useState } from 'react';
import { getProjectsForClient } from '../new/actions';
import Link from 'next/link';
import { FormWithAllLevels } from '@/db/schema_formsModule';
import { FaFilePowerpoint, FaFileWord, FaSpinner, FaTrashAlt } from 'react-icons/fa';
import { User } from '@/db/schema_usersModule';
import { NewSalesLead, SalesLeadWithAllDetails, salesleadStatusEnum } from '@/db/schema_salesleadsModule';
import { extname } from 'path';
import Image from 'next/image';
import { FaXmark } from 'react-icons/fa6';
import FormView from '@/app/forms/components/FormView';
import SubmitButton from '@/app/(global components)/SubmitButton';

type Props = {
  mode: 'new' | 'edit';
  users: User[];
  clients: Client[];
  studyPlans: FormWithAllLevels[];
  leadDetails: SalesLeadWithAllDetails;
  setLeadDetails: (leadDetails: SalesLeadWithAllDetails) => void;
};

export default function SalesLeadEditor({ mode, users, clients, leadDetails, setLeadDetails, studyPlans }: Props) {

  const [currentStudyPlanIndex, setCurrentStudyPlanIndex] = useState(0);

  return (
    <>
      <section className='flex flex-col gap-2 pb-4'>
        {(mode === 'edit' && leadDetails.revisions[0].studyplans.length > 0) && (
          <>
            <div className='flex items-center gap-2'>
              <div className='font-bold'>Viewing:</div>
              <select className='std-input flex-grow' value={currentStudyPlanIndex} onChange={(e) => setCurrentStudyPlanIndex(parseInt(e.target.value))}>
                {leadDetails.revisions[0].studyplans.map((plan) => (
                  <option key={plan.formrevision.form.id} value={leadDetails.revisions[0].studyplans.indexOf(plan)}>
                    {plan.formrevision.form.name}
                  </option>
                ))}
              </select>
            </div>
            <FormView mode='salesleadedit' leadDetails={leadDetails} setLeadDetails={setLeadDetails} currentStudyPlanIndex={currentStudyPlanIndex} formContents={leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision} users={users} />
          </>
        )}
        {(mode === 'new' && leadDetails.revisions[0].studyplans.length > 0) && (
          <>
            <div className='flex items-center gap-2'>
              <div className='font-bold'>Viewing:</div>
              <select className='std-input flex-grow' value={currentStudyPlanIndex} onChange={(e) => setCurrentStudyPlanIndex(parseInt(e.target.value))}>
                {leadDetails.revisions[0].studyplans.map((plan) => (
                  <option key={plan.formrevision.form.id} value={leadDetails.revisions[0].studyplans.indexOf(plan)}>
                    {plan.formrevision.form.name}
                  </option>
                ))}
              </select>
            </div>
            {/* <FormView formContents={leadDetails.revisions[0].studyplans[currentStudyPlanIndex]} /> */}
          </>
        )}
        {leadDetails.revisions[0].studyplans.length === 0 && <div className='italic'>No study plans added yet.</div>}
      </section>
    </>
  );
}
