import { GET_FORM_DETAILS_FROM_REVISION_ID, GET_LEAD_LATEST } from "@/utils/queries"
import { useLazyQuery } from "@apollo/client"
import { faX } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { ChangeEvent, useEffect, useState } from "react"

interface Client {
  _id: string,
  name: string,
  code: string
}

interface Props {
  session: any
  leadName: any
  client: string
  users: any
  clients: Client[]
  leads: any
  studyPlanForms: any
  templateList: any
  drafterList: any
  setLeadName: Function
  setClient: Function
  setTemplateList: Function
  setContent: Function
  setDrafterList: Function
  sourceLead: any
  setSourceLead: Function
}

export default function CloneSetup ({session, leadName, client, users, clients, leads, studyPlanForms, templateList, drafterList, setLeadName, setClient, setTemplateList, setContent, setDrafterList, sourceLead, setSourceLead}:Props) {

  const [drafterToAdd, setDrafterToAdd] = useState('');
  const [templateToAdd, setTemplateToAdd] = useState('');
  const [showPickSource, setShowPickSource] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [loadLeadLatest] = useLazyQuery(GET_LEAD_LATEST);
  const [loadFormDetailsFromRevisionId] = useLazyQuery(GET_FORM_DETAILS_FROM_REVISION_ID, {
    fetchPolicy: 'network-only'
  });

  function handleUpdateLeadName (e:ChangeEvent<HTMLInputElement>) {
    setLeadName(e.target.value);
  }

  function handleClientChange (e:ChangeEvent<HTMLSelectElement>) {
    setClient(e.target.value);
  }

  function handleAddDrafter (e:ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    const drafterObject = users.filter((user:any) => user.username === drafterToAdd)[0];
    setDrafterList([...drafterList, drafterObject]);
    setDrafterToAdd('');
  }

  function handleRemoveDrafter (username:string) {
    const newDrafterList = drafterList.filter((drafter:any) => drafter.username !== username);
    setDrafterList(newDrafterList);
  }

  useEffect( () => {
    
    async function populateStudyPlans () {
      if (sourceLead) {
        const leadLatestResponse = await loadLeadLatest({
          variables: {
            getLeadLatestRevisionId: sourceLead._id
          }
        });
        const leadRevisionData = leadLatestResponse?.data?.getLeadLatestRevision?.revisions[0];
        if (leadRevisionData) {
          const leadContent = JSON.parse(leadRevisionData.content);
          const newLeadContent = [];
          const studyPlanNames = [];
          for (let i=0;i<leadContent.length;i++) {
            const {data: formDetailsData} = await loadFormDetailsFromRevisionId({
              variables: {revisionId: leadContent[i].studyPlanFormRevisionId}
            });
            const formDetails = formDetailsData?.getFormDetailsFromRevisionId;
            const newStudyPlan = {...leadContent[i], associatedStudyId: null};
            // THIS IS WHERE A CHECK SHOULD GO TO EXAMINE WHETHER MOST RECENT STUDY PLAN
            // REVISION ID IS THE SAME AS THE SOURCE OR NOT; IF NOT, USER WILL HAVE TO RESOLVE.
            newLeadContent.push(newStudyPlan);
            studyPlanNames.push(formDetails.name);
          }
          setTemplateList(studyPlanNames);
          console.log(newLeadContent)
          setContent(newLeadContent);
        }
      }
    }

        
    populateStudyPlans();

    
  },[sourceLead, loadLeadLatest, setTemplateList, setContent, loadFormDetailsFromRevisionId]);

  return (
    <section>
      <div className='flex items-center mb-2'>
        <div className='mr-2'>Draft Name:</div>
        <input type='text' className='std-input' name='leadName' value={leadName} onChange={handleUpdateLeadName} />
      </div>
      <div className='flex items-center mb-2'>
        <div className='mr-2'>Client:</div>
        <select className='std-input mr-2' onChange={handleClientChange} value={client}>
          <option value=''>-- Choose --</option> 
          {clients.map( (client:Client) => (
            <option value={client.code} key={client.code}>{`${client.name} - ${client.code}`}</option>  
          ))}
        </select>
        <div>Don&apos;t have a client code? <Link className='std-link' href='/client-manager'>Create one</Link> before starting this process!</div>
      </div>
      <section className='flex flex-col justify-center mb-2'>
        <div className='mr-2'>Choose an existing lead to serve as the cloning source. Once you make your choice, the associated study plan forms will be shown below.</div>
        <section className='flex flex-col border border-secondary rounded-md justify-center p-4 mt-2 mb-4 gap-2'>
          <div className="flex items-center gap-2">
            <div className="font-bold">Source Lead:</div>
            <button className='std-button-lite' onClick={() => setShowPickSource(true)}>Pick Source</button>
            <input type='text' className='std-input flex-grow text-[#888]' placeholder="Please choose a source lead..." disabled value={sourceLead.name}></input>
          </div>
          <div className="font-bold">Study Plans Included:</div>
          <ul>
            { templateList.length > 0 ? templateList.map((template:any, index:number) => (
              <li key={index} className='flex justify-between items-center std-input rounded-md mb-2'>
                {template}
              </li>
            ))
            :
            'Please choose a cloning source above.'
            }
          </ul>
        </section>
      </section>
      <section className='flex flex-col justify-center mb-2'>
        <div className='mr-2'>Who should be included in the drafting process?</div>
        <section className='flex flex-col border border-secondary rounded-md justify-center p-4 mt-2 mb-4'>
          <form className="flex items-center mb-2" onSubmit={handleAddDrafter}>
            <div className="font-bold mr-2">Add Members:</div>
            <button className="std-button-lite mr-2" disabled={drafterToAdd === ''}>Add</button>
            <select className="std-input flex-grow" onChange={(e) => setDrafterToAdd(e.target.value)} value={drafterToAdd}>
              <option value=''>-- Choose --</option>
              { users.map((user:any) => (<option key={user.username} value={user.username} disabled={drafterList.filter((drafter:any) => drafter.username === user.username).length > 0}>
                {`${user.first} ${user.last}`}
              </option>))}
            </select>
          </form>
          <div className="font-bold mb-2">Team members to be included:</div>
          <ul>
            { drafterList.map((drafter:any) => (
              <li key={drafter.username} className='flex justify-between items-center std-input rounded-md mb-2'>
                <div>
                {drafter.username === session.user.username ? `${drafter.first} ${drafter.last} (author)` : `${drafter.first} ${drafter.last}`}
                </div>
                <button className='secondary-button-lite' onClick={()=>handleRemoveDrafter(drafter.username)} disabled={drafter.username === session.user.username}><FontAwesomeIcon icon={faX} size='xs' /></button>
              </li>
            ))}
          </ul>
        </section>
      </section>
      <section className={`absolute ${showPickSource ? `grid` : `hidden`} grid-cols-12 items-start pt-[5vh] bg-black/50 w-screen h-screen top-0 left-0`}>
        <section className='flex bg-white rounded-lg p-0 col-start-2 col-span-10 md:col-start-3 md:col-span-8 lg:col-start-4 lg:col-span-6'>
          <section className='flex flex-col p-4 bg-secondary/20 rounded-lg w-full gap-2'>
            <h5>Pick Source</h5>
            <section className='flex flex-col justify-center'>
              <div className='mr-2'>Choose an existing lead from the list.</div>
              <section className='flex flex-col border border-secondary rounded-md justify-center p-4 mt-2 mb-4'>
                <div className='md:overflow-y-hidden overflow-x-visible h-[calc(200px)]'>
                  <div className='md:overflow-y-auto overflow-x-visible h-full pr-4'>
                    <ul>
                      {
                        leads.map( (lead:any, index:number) => (
                          <li key={index} onClick={() => setSelectedSource(lead)} className={`flex justify-between items-center std-input rounded-md mb-2 cursor-pointer ${selectedSource && selectedSource.name === lead.name ? 'text-white !bg-primary !border-primary' : 'hover:bg-white/70'}`}>
                            {lead.name}
                          </li>
                        ))
                      }

                      
                    </ul>
                  </div>
                </div>
              </section>
            </section>
            <div className='flex gap-2'>
              <button className='secondary-button-lite flex-grow' onClick={() => {setShowPickSource(false);}}>
                Cancel
              </button>
              <button className='std-button-lite flex-grow' onClick={() => {setSourceLead(selectedSource); setShowPickSource(false);}}>
                Choose Selected Lead
              </button>
            </div>
          </section>
        </section>
      </section>
    </section>
  );
}