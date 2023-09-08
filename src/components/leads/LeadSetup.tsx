import { faX } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { ChangeEvent, useState } from "react"

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
  studyPlanForms: any
  templateList: any
  drafterList: any
  setLeadName: Function
  setClient: Function
  setTemplateList: Function
  setDrafterList: Function
}

export default function LeadSetup ({session, leadName, client, users, clients, studyPlanForms, templateList, drafterList, setLeadName, setClient, setTemplateList, setDrafterList}:Props) {

  const [drafterToAdd, setDrafterToAdd] = useState('');
  const [templateToAdd, setTemplateToAdd] = useState('');

  function handleUpdateLeadName (e:ChangeEvent<HTMLInputElement>) {
    setLeadName(e.target.value);
  }

  function handleClientChange (e:ChangeEvent<HTMLSelectElement>) {
    setClient(e.target.value);
  }

  // function handleTemplateChange (e:ChangeEvent<HTMLSelectElement>) {
  //   setCurrentTemplate(e.target.value);
  // }


  function handleAddTemplate (e:ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    const templateObject = studyPlanForms.filter((template:any) => template.name === templateToAdd)[0];
    setTemplateList([...templateList, templateObject]);
    setTemplateToAdd('');
  }

  function handleRemoveTemplate (name:string) {
    const newTemplateList = templateList.filter((template:any) => template.name !== name);
    setTemplateList(newTemplateList);
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
        <div>Don&apos;t have a client code? <Link className='std-link' href='/clients'>Create one</Link> before starting this process!</div>
      </div>
      {/* <div className='flex items-center mb-2'>
        <div className='mr-2'>Lead Template:</div>
        <select className='std-input mr-2' onChange={handleTemplateChange} value={currentTemplate}>
          <option value=''>-- Choose --</option> 
          {templates.map( (template:any) => (
            <option value={template._id} key={template.name}>{`${template.name}`}</option>  
          ))}
        </select>
      </div> */}
      <section className='flex flex-col justify-center mb-2'>
        <div className='mr-2'>Choose what types of studies will be included in the lead. You can add more later as needed.</div>
        <section className='flex flex-col border border-secondary rounded-md justify-center p-4 mt-2 mb-4'>
          <form className="flex items-center mb-2" onSubmit={handleAddTemplate}>
            <div className="font-bold mr-2">Study Plan Forms:</div>
            <button className="std-button-lite mr-2" disabled={templateToAdd === ''}>Add</button>
            <select className="std-input flex-grow" onChange={(e) => setTemplateToAdd(e.target.value)} value={templateToAdd}>
              <option value=''>-- Choose --</option>
              { studyPlanForms.map((template:any, index:number) => (<option key={index} value={template.name} disabled={templateList.filter((templatelistitem:any) => template.name === templatelistitem.name).length > 0}>
                {template.name}
              </option>))}
            </select>
          </form>
          <div className="font-bold mb-2">Study Plans Included:</div>
          <ul>
            { templateList.length > 0 ? templateList.map((template:any, index:number) => (
              <li key={index} className='flex justify-between items-center std-input rounded-md mb-2'>
                {template.name}
                <button className='secondary-button-lite' onClick={()=>handleRemoveTemplate(template.name)}><FontAwesomeIcon icon={faX} size='xs' /></button>
              </li>
            ))
            :
            'Please add at least one study plan.'
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
    </section>
  );
}