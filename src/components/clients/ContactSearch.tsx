import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

interface Props {
  contacts: any[]
  addedContacts: any[]
  contactSearch: string
  contactSelected: any
  setContactSearch: Function
  setContactSelected: Function
}

export default function ContactSearch ({contacts, addedContacts, contactSearch, contactSelected, setContactSearch, setContactSelected}:Props) {

  const [matchingList, setMatchingList] = useState<any[]>(contacts);

  useEffect( () => {
    const regex = new RegExp(`${contactSearch}`,'gi');
    const filteredList = contacts.filter((contact:any) => (contact.first.match(regex) || contact.last.match(regex)));
    if (filteredList.indexOf(contactSelected) < 0) setContactSelected(null);
    setMatchingList(filteredList);
  },[setMatchingList, contactSearch, contacts, contactSelected, setContactSelected]);

  return (
    <>
      <div className='flex items-center gap-2'>
        <div><FontAwesomeIcon icon={faMagnifyingGlass} /></div>
        <input className='std-input w-full' value={contactSearch} onChange={(e)=>setContactSearch(e.target.value)} />
      </div>
      <div className='border border-secondary/80 w-full h-[200px] mb-2 overflow-y-scroll bg-white/50'>
        { matchingList.length > 0 ? (
          <>
          { matchingList.map((contact:any,index:number)=> (
            <button key={`contact-${index}`} className={`flex w-full px-2 py-2 border border-secondary/80 border-b-1 border-l-0 border-r-0 border-t-0 last:border-b-0 cursor-pointer ${contactSelected === contact ? `bg-primary text-white` : ``} ${addedContacts.map((addedContact:any) => addedContact._id).indexOf(contact._id) >= 0 ? `text-[#AAA] italic` : ``}`} disabled={addedContacts.map((addedContact:any)=>addedContact._id).indexOf(contact._id) >= 0} onClick={()=>setContactSelected(contact)}>
              {`${contact.first} ${contact.last}${addedContacts.map((addedContact:any)=>addedContact._id).indexOf(contact._id) >= 0 ? ` (added)` : ``}`}
            </button>
          ))}
          </>
        ):(
          <div className='p-2'>No matches.</div>
        )}
      </div>
    </>
  );
}