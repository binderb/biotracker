import Modal from '@/app/(global components)/Modal';
import { Contact } from '@/db/schema_clientModule';
import { FaPlus, FaSearch, FaSpinner } from 'react-icons/fa';
// import { addClient, generateClientCode } from '../actions';
import SubmitButton from '@/app/(global components)/SubmitButton';
import ModalButton from '@/app/(global components)/ModalButton';
import { db } from '@/db';
import { useState, useEffect } from 'react';
import { addAddress, addContact, getAddresses, getContacts, updateAddress, updateContact } from './actions';
import { sleep } from '@/debug/Sleep';
import { getFormID, getFormRevisionNumber } from '../forms/functions';
import { Form, FormRevisionWithAllLevels, FormWithAllLevels, SalesFormRevisionWithAllLevelsAndData } from '@/db/schema_formsModule';
import { SalesLeadWithAllDetails, SalesLeadRevisionWithAllDetails, SalesLeadFormData } from '@/db/schema_salesleadsModule';
import FormView from '../forms/components/FormView';
import { User } from '@/db/schema_usersModule';
import { cloneDeep } from 'lodash';
import { addSalesLeadRevision } from '../leads/[id]/actions';

type Props = {
  fallbackContents: React.ReactNode;
  buttonContents: React.ReactNode;
  showModal: boolean;
  setShowModal: Function;
  saveChangesFunction: (lead: SalesLeadWithAllDetails) => void;
  users: User[];
  studyPlans: FormWithAllLevels[];
  leadDetails: SalesLeadWithAllDetails;
  setLeadDetails: (leadDetails: SalesLeadWithAllDetails) => void;
  currentStudyPlanIndex: number;
  currentUser: User;
};

// The reason this is a separate modal with its own data loading
// is that each time the upgrade button is clicked, a new sales lead object needs
// to be created that has the specific shape of the most up-to-date form revision.
// This object will receive the user's manual placement of old data into the new
// format, and when the user commits the upgrade, the new object will be saved
// to the database as a new revision of the sales lead.

export default function UpgradeFormModal({ fallbackContents, buttonContents, showModal, setShowModal, saveChangesFunction, leadDetails, setLeadDetails, users, studyPlans, currentStudyPlanIndex, currentUser }: Props) {
  const [upgradedLeadDetails, setUpgradedLeadDetails] = useState<SalesLeadWithAllDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  async function handleShowModal() {
    setLoading(true);
    // get the latest form revision object, which will be inside the studyPlans object and can be found by matching the form ID of the current study plan and then extracting the latest revision object from that form's revisions array
    const latestRevisionOfCurrentForm = studyPlans.filter((plan) => plan.id === leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.form.id)[0].revisions[studyPlans.filter((plan) => plan.id === leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.form.id)[0].revisions.length - 1];
    // need to recast this FormRevisionWithAllLevels object as a SalesFormRevisionWithAllLevelsAndData object, which is the type of object that the FormView component expects
    const latestRevisionOfCurrentFormWithAllLevelsAndData: SalesFormRevisionWithAllLevelsAndData = {
      ...latestRevisionOfCurrentForm,
      form: leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.form,
      sections: latestRevisionOfCurrentForm.sections.map((section, sectionIndex) => {
        return {
          ...section,
          rows: section.rows.map((row, rowIndex) => {
            return {
              ...row,
              fields: row.fields.map((field) => {
                return {
                  ...field,
                  salesleadformdata: [
                    {
                      id: field.id,
                      salesleadrevision: -1,
                      formfield: field.id,
                      sectionShapeIndex: 0,
                      value: Array<string>() as unknown,
                    } as SalesLeadFormData,
                  ],
                };
              }),
            };
          }),
        };
      }),
    };

    // now, create a new sales lead object that is identical to the leadDetails object, except that the formrevision object is replaced with the latest revision of the current form. This will be the object that the user edits and then saves as a new revision of the sales lead.
    const newUpgradedLeadDetails = cloneDeep(leadDetails);
    newUpgradedLeadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision = latestRevisionOfCurrentFormWithAllLevelsAndData;
    // also need to create a new salesformshape object for the new revision, which will be a simple list of section indices since no extensible sections will have been added initially
    newUpgradedLeadDetails.revisions[0].studyplanshapes[currentStudyPlanIndex].formshape = latestRevisionOfCurrentForm.sections.map((_, sectionIndex) => sectionIndex);
    setUpgradedLeadDetails(newUpgradedLeadDetails);

    setLoading(false);
    setShowModal(true);
  }

  async function handleUpgrade() {
    setSubmitting(true);
    try {
      if (!upgradedLeadDetails) {
        throw new Error('Something went wrong. Please try again.');
      }
      const note = `Upgraded form revision from ${getFormID(studyPlans[currentStudyPlanIndex])} R${getFormRevisionNumber(studyPlans.filter((plan) => plan.id === leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.form.id)[0], leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision)} to ${getFormID(studyPlans[currentStudyPlanIndex])} R${studyPlans.filter((plan) => plan.id === leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.form.id)[0].revisions.length}.`;
      await addSalesLeadRevision(upgradedLeadDetails,note,currentUser.id);
      // setNote('');
      // notify('success', 'Changes committed successfully.');
    } catch (err: any) {
      // notify('error', err.message);
    }
    setSubmitting(false);
  }

  return (
    <>
      <button
        className='underline font-bold hover:text-[#d1a93a]'
        onClick={(e) => {
          e.preventDefault();
          handleShowModal();
        }}>
        {loading ? fallbackContents : buttonContents}
      </button>
      <Modal showModal={showModal} className='w-[90vw] text-black'>
        <h5>Upgrade Form Version</h5>
        <section className='flex flex-col justify-center'>
          <div>
            <span>{`You are currently using Study Plan Form `}</span>
            <span className='font-bold'>{`${getFormID(studyPlans[currentStudyPlanIndex])} R${getFormRevisionNumber(studyPlans.filter((plan) => plan.id === leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.form.id)[0], leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision)} `}</span>
            <span>{`in this lead, but the current version is `}</span>
            <span className='font-bold'>{`${getFormID(studyPlans[currentStudyPlanIndex])} R${studyPlans.filter((plan) => plan.id === leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.form.id)[0].revisions.length}`}</span>
            <span>{`. You will not be able to publish the lead until all associated forms are upgraded to their current versions. Use the panel below to transfer your saved information into the new version of the form. Clicking "Commit Upgrade" will save your changes and generate an automated comment to your group summarizing the action.`}</span>
          </div>
          <section className='flex flex-col border border-secondary rounded-md justify-center p-4 mt-2 mb-4'>
            <div className='md:overflow-y-hidden overflow-x-visible h-[calc(90vh-300px)]'>
              <div className='md:overflow-y-auto overflow-x-visible h-full pr-4'>
                <section className='grid grid-cols-12 gap-2'>
                  <div className='col-span-6'>
                    <h5>{`${getFormID(studyPlans[currentStudyPlanIndex])} R${getFormRevisionNumber(studyPlans.filter((plan) => plan.id === leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.form.id)[0], leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision)}`}</h5>
                    <section className='flex flex-col border border-secondary rounded-md justify-center p-4 mt-2 mb-4'>
                      <FormView mode='salesleadedit' leadDetails={leadDetails} setLeadDetails={setLeadDetails} currentStudyPlanIndex={currentStudyPlanIndex} formContents={leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision} users={users} />
                    </section>
                  </div>
                  <div className='col-span-6'>
                    <h5>{`${getFormID(studyPlans[currentStudyPlanIndex])} R${studyPlans.filter((plan) => plan.id === leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.form.id)[0].revisions.length}`}</h5>
                    <section className='flex flex-col border border-secondary rounded-md justify-center p-4 mt-2 mb-4'>
                      {upgradedLeadDetails && (
                        <>
                          <FormView mode='salesleadedit' leadDetails={upgradedLeadDetails} setLeadDetails={setUpgradedLeadDetails} currentStudyPlanIndex={currentStudyPlanIndex} formContents={upgradedLeadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision} users={users} />
                        </>
                      )}
                    </section>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </section>
        <div className='flex justify-end gap-2'>
          <button
            className='secondary-button-lite'
            onClick={() => {
              setShowModal(false);
            }}>
            Cancel
          </button>
          <form action={handleUpgrade}>
            <SubmitButton text='Commit Upgrade' pendingText='Committing Upgrade...' className='flex-grow' />
          </form>
        </div>
      </Modal>
    </>
  );
}
