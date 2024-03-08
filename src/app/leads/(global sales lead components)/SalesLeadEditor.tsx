'use client';

import { Client, ClientWithAllDetails, ProjectWithAllDetails } from '@/db/schema_clientModule';
import { ChangeEvent, useState } from 'react';
import { getProjectsForClient } from '../new/actions';
import Link from 'next/link';
import { FormWithAllLevels } from '@/db/schema_formsModule';
import { FaCheckCircle, FaExclamationCircle, FaFilePowerpoint, FaFileWord, FaSpinner, FaTrashAlt } from 'react-icons/fa';
import { User } from '@/db/schema_usersModule';
import { NewSalesLead, SalesLeadWithAllDetails, salesleadStatusEnum } from '@/db/schema_salesleadsModule';
import { extname } from 'path';
import Image from 'next/image';
import { FaXmark } from 'react-icons/fa6';
import FormView from '@/app/forms/components/FormView';
import SubmitButton from '@/app/(global components)/SubmitButton';
import { getFormID, getFormRevisionNumber } from '@/app/forms/functions';
import Modal from '@/app/(global components)/Modal';
import UpgradeFormModal from '@/app/(_modal panels)/UpgradeFormModal';

type Props = {
  mode: 'view' | 'edit';
  users: User[];
  clients: Client[];
  studyPlans: FormWithAllLevels[];
  leadDetails: SalesLeadWithAllDetails;
  setLeadDetails: (leadDetails: SalesLeadWithAllDetails) => void;
  currentUser: User;
};

export default function SalesLeadEditor({ mode, users, clients, leadDetails, setLeadDetails, studyPlans, currentUser }: Props) {
  const [currentStudyPlanIndex, setCurrentStudyPlanIndex] = useState(0);
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  const [upgradeLeadDetails, setUpgradeLeadDetails] = useState<SalesLeadWithAllDetails>(leadDetails);

  async function handleUpgradeForm() { }

  return (
    <>
      <section className='flex flex-col gap-2 pb-4'>
        {leadDetails.revisions[0].studyplans.length > 0 && (
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
            <section className='flex items-center gap-2 pb-4'>
              <div className='font-bold'>Form ID:</div>
              <div>{`${getFormID(studyPlans[currentStudyPlanIndex])} R${getFormRevisionNumber(studyPlans.filter((plan) => plan.id === leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.form.id)[0], leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision)}`}</div>
              {getFormRevisionNumber(studyPlans.filter((plan) => plan.id === leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.form.id)[0], leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision) === studyPlans.filter((plan) => plan.id === leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.form.id)[0].revisions.length ? (
                <div className='bg-[#DFD] px-2 pr-3 py-1 text-[#080] rounded-full border border-[#080] flex gap-2 items-center'>
                  <FaCheckCircle />
                  Latest Version
                </div>
              ) : (
                <div className='bg-[#ffeca5] px-2 pr-3 py-1 rounded-full border border-[#aa7d00] flex gap-2 items-center text-[#aa7d00]'>
                  <FaExclamationCircle />
                  Outdated Form
                  {mode === 'edit' && (
                    <UpgradeFormModal
                      buttonContents='Upgrade'
                      fallbackContents={
                        <div className='flex gap-2 items-center'>
                          Upgrade <FaSpinner className='animate-spin' />
                        </div>
                      }
                      users={users}
                      studyPlans={studyPlans}
                      leadDetails={leadDetails}
                      setLeadDetails={setLeadDetails}
                      currentStudyPlanIndex={currentStudyPlanIndex}
                      showModal={showUpgradeForm}
                      setShowModal={setShowUpgradeForm}
                      saveChangesFunction={handleUpgradeForm}
                      currentUser={currentUser}
                    />
                  )}

                </div>
              )}
            </section>
            {mode === 'view' && (
              <>
                <FormView mode='salesleadreadonly' leadDetails={leadDetails} setLeadDetails={setLeadDetails} currentStudyPlanIndex={currentStudyPlanIndex} formContents={leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision} users={users} />
              </>)}
            {mode === 'edit' && (
              <>
                <FormView mode='salesleadedit' leadDetails={leadDetails} setLeadDetails={setLeadDetails} currentStudyPlanIndex={currentStudyPlanIndex} formContents={leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision} users={users} />
              </>)}

          </>
        )}
      </section>
    </>
  );
}
