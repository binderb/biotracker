import { GET_FORM_DETAILS_FROM_REVISION_ID, GET_STUDY_PLAN_FORM_LATEST } from "@/utils/queries";
import { useApolloClient, useLazyQuery, useQuery } from "@apollo/client";
import { faCheckCircle, faExclamationCircle, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useEffect, useState, Fragment } from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import FormContentEditor from "./FormContentEditor";
import _, { initial } from 'lodash';

interface Props {
  client: any
  leadData: any
  content: any
  studyPlanNames: [string]
  upgradeFormContent: any
  users: any
  setContent: Function
  setUpgradeFormContent: Function
  handleUpgradeForm: Function
  upgradable: boolean
}

export default function LeadEditor ({client, content, studyPlanNames, upgradeFormContent, leadData, users, setContent, setUpgradeFormContent, handleUpgradeForm, upgradable}:Props) {

  const [currentStudyPlanIndex, setCurrentStudyPlanIndex] = useState(0);
  const apolloClient = useApolloClient();
  const { data: formDetailsResponse } = useQuery(GET_FORM_DETAILS_FROM_REVISION_ID, {
    variables: {
      revisionId: content[currentStudyPlanIndex]?.studyPlanFormRevisionId
    }
  });
  let formDetails = formDetailsResponse?.getFormDetailsFromRevisionId;
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  const [getStudyPlanFormLatest] = useLazyQuery(GET_STUDY_PLAN_FORM_LATEST, {
    fetchPolicy: 'network-only'
  });
  console.log(content)

  useEffect( () => {
    if (currentStudyPlanIndex >= content.length-1) {
      setCurrentStudyPlanIndex(content.length-1);
    }
  },[currentStudyPlanIndex, setCurrentStudyPlanIndex, content]);

  useEffect( () => {
    
    async function setupUpgradeFormObject () {
      if (!formDetails) return;
      const {data: studyPlanResponse} = await getStudyPlanFormLatest({
        variables: {
          getStudyPlanFormLatestRevisionId: formDetails._id
        }
        
      });
      const latestStudyPlan = studyPlanResponse?.getStudyPlanFormLatestRevision;
      let newFormContentObject = _.cloneDeep(content);
      newFormContentObject.splice(currentStudyPlanIndex,1,{
        associatedStudyId: null,
        studyPlanFormId: latestStudyPlan._id,
        studyPlanFormRevisionId: latestStudyPlan.revisions[0]._id,
        sections: latestStudyPlan.revisions[0].sections.map( (section:any) => {
          return { 
            "name": section.name,
            "index": section.index,
            "extensible": section.extensible,
            "rows": section.rows.map( (row:any) => {
              return {
                "index": row.index,
                "extensible": row.extensible,
                "fields" : row.fields.map( (field:any) => {
                  return {
                    "type" : field.type,
                    "extensible" : field.extensible,
                    "params" : field.params,
                    "data" : field.data
                  }
                })
              }
            })
          };
        })
      });
      setUpgradeFormContent(newFormContentObject);
    }
    
    setupUpgradeFormObject();

  },[formDetails, getStudyPlanFormLatest, currentStudyPlanIndex, content, setShowUpgradeForm, setUpgradeFormContent]);

  async function startHandleUpgradeForm () {
    const note = `Upgraded form F-SP-${formDetails?.formIndex.toString().padStart(4,'0')} R${formDetails?.revisions.length === 1 ? '1' : formDetails?.revisions.map((revision:any) => revision._id).indexOf(content[currentStudyPlanIndex].studyPlanFormRevisionId)+1} \u2192 R${formDetails?.revisions.length}.`;
    setShowUpgradeForm(false);
    await handleUpgradeForm(note);
  }

  return (
    <>
      <section>
        
        <form>
          <div className='mr-2 font-bold'>Sponsor Information:</div>
          <div className='flex border border-secondary rounded-md items-center p-4 mt-2 mb-4'>
            <div className='mr-2'>Client:</div>
            <div>{client}</div>
          </div>
          <section className='flex items-center gap-2 pb-4'>
            <div className="font-bold">Study Plan:</div>
            <select className="std-input flex-grow" value={currentStudyPlanIndex} onChange={(e) => setCurrentStudyPlanIndex(parseInt(e.target.value))}>
              { studyPlanNames.map((plan:any, index:number) => (
                <option key={`study-plan-${index}`} value={index}>
                  {plan}
                </option>
              ))}
            </select>
          </section>
          {
            formDetails && (
              <section className='flex items-center gap-2 pb-4'>
                <div className="font-bold">Form ID:</div>
                <div>
                  {`F-SP-${formDetails?.formIndex.toString().padStart(4,'0')} R${formDetails?.revisions.length === 1 ? '1' : formDetails?.revisions.map((revision:any) => revision._id).indexOf(content[currentStudyPlanIndex].studyPlanFormRevisionId)+1}`}
                </div>
                {
                  formDetails?.revisions.map((revision:any) => revision._id).indexOf(content[currentStudyPlanIndex].studyPlanFormRevisionId) === formDetails?.revisions.length-1 ?
                  (
                    <div className='bg-[#DFD] px-2 pr-3 py-1 text-[#080] rounded-full border border-[#080] flex gap-2 items-center'>
                      <FontAwesomeIcon icon={faCheckCircle} />
                      Latest Version
                    </div>
                  ) : (
                    <div className='bg-[#ffeca5] px-2 pr-3 py-1 text-[#aa7d00] rounded-full border border-[#aa7d00] flex gap-2 items-center'>
                      <FontAwesomeIcon icon={faExclamationCircle} />
                      Outdated Form
                      {
                        upgradable ? (
                          <button className='underline font-bold hover:text-[#d1a93a]' onClick={(e)=>{e.preventDefault();setShowUpgradeForm(true);}}>Upgrade</button>
                        ) : (
                          <div>(you will need to upgrade before publishing the lead)</div>
                        )
                      }
                      
                    </div>
                  )
                }
              </section>
            )
          }
          <FormContentEditor 
            users={users}
            client={client}
            leadData={leadData}
            content={content}
            setContent={setContent}
            currentStudyPlanIndex={currentStudyPlanIndex}
          />
        </form>
      </section>
      <section className={`absolute ${showUpgradeForm ? `block` : `hidden`} items-start pt-[5vh] bg-black/50 w-screen h-screen top-0 left-0`}>
        <section className='flex bg-white mx-4 rounded-lg p-0 col-start-2 col-span-10 md:col-start-3 md:col-span-8 lg:col-start-4 lg:col-span-6'>
          <section className='flex flex-col p-4 bg-secondary/20 rounded-lg w-full gap-2'>
            <h5>Upgrade Form Version</h5>
            <section className='flex flex-col justify-center'>
              <div>
                <span>
                  {`You are currently using Study Plan Form `}
                </span>
                <span className='font-bold'>
                  {`F-SP-${formDetails?.formIndex.toString().padStart(4,'0')} R${formDetails?.revisions.length === 1 ? '1' : formDetails?.revisions.map((revision:any) => revision._id).indexOf(content[currentStudyPlanIndex].studyPlanFormRevisionId)+1} `}
                </span>
                <span>
                  {`in this lead, but the current version is `}
                </span>
                <span className='font-bold'>
                  {`F-SP-${formDetails?.formIndex.toString().padStart(4,'0')} R${formDetails?.revisions.length} `}
                </span>
                <span>
                  {`. You will not be able to publish the lead until all associated forms are upgraded to their current versions. Use the panel below to transfer your saved information into the new version of the form. Clicking "Commit Upgrade" will save your changes and generate an automated comment to your group summarizing the action.`}
                </span>
              </div>
              
              <section className='flex flex-col border border-secondary rounded-md justify-center p-4 mt-2 mb-4'>
                <div className='md:overflow-y-hidden overflow-x-visible h-[calc(90vh-300px)]'>
                  <div className='md:overflow-y-auto overflow-x-visible h-full pr-4'>
                    <section className='grid grid-cols-12 gap-2'>
                      <div className='col-span-6'>
                        <h5>
                          {`F-SP-${formDetails?.formIndex.toString().padStart(4,'0')} R${formDetails?.revisions.length === 1 ? '1' : formDetails?.revisions.map((revision:any) => revision._id).indexOf(content[currentStudyPlanIndex].studyPlanFormRevisionId)+1}`}
                        </h5>
                        <section className='flex flex-col border border-secondary rounded-md justify-center p-4 mt-2 mb-4'>
                          <FormContentEditor 
                            users={users}
                            client={client}
                            leadData={leadData}
                            content={content}
                            setContent={setContent}
                            currentStudyPlanIndex={currentStudyPlanIndex}
                          />
                        </section>
                      </div>
                      <div className='col-span-6'>
                        <h5>
                          {`F-SP-${formDetails?.formIndex.toString().padStart(4,'0')} R${formDetails?.revisions.length}`}
                        </h5>
                        <section className='flex flex-col border border-secondary rounded-md justify-center p-4 mt-2 mb-4'>
                          <FormContentEditor 
                            users={users}
                            client={client}
                            leadData={leadData}
                            content={upgradeFormContent}
                            setContent={setUpgradeFormContent}
                            currentStudyPlanIndex={currentStudyPlanIndex}
                          />
                        </section>
                      </div>
                    </section>
                  </div>
                </div>
              </section>
            </section>
            <div className='flex gap-2'>
              <button className='secondary-button-lite flex-grow' onClick={() => {setShowUpgradeForm(false);}}>
                Cancel
              </button>
              <button className='std-button-lite flex-grow' onClick={startHandleUpgradeForm}>
                Commit Upgrade
              </button>
            </div>
          </section>
        </section>
      </section>
    </>
  );
}