import { faCheck, faCircle, faCodeCommit, faComment, faFolder, faFolderClosed, faMagnifyingGlass, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

type Props = {
  lead: any
}

export default function LeadBlock ({lead}:Props) {
  return (
    <>
    <li key={lead._id} className='std-input rounded-lg flex justify-between items-center'>
      {lead.name}
      <div className='flex gap-2'>
        { lead.status === 'active' &&
          <div className='flex items-center bg-secondary/80 rounded-md text-white px-2 gap-2'>
            <FontAwesomeIcon className='text-green-400' icon={faCircle} size='2xs' />
            Active
          </div>
        }
        { lead.status === 'inactive' &&
          <div className='flex items-center bg-secondary/80 rounded-md text-white px-2 gap-2'>
            <FontAwesomeIcon className='text-gray-300' icon={faCircle} size='2xs' />
            Inactive
          </div>
        }
        { lead.status === 'completed' &&
          <div className='flex items-center bg-secondary/80 rounded-md text-white px-2 gap-2'>
            <FontAwesomeIcon className='text-gray-300' icon={faCheck} />
            Completed
          </div>
        }
        { lead.status === 'cancelled' &&
          <div className='flex items-center bg-secondary/80 rounded-md text-white px-2 gap-2'>
            <FontAwesomeIcon className='text-gray-300' icon={faX} size='xs' />
            Cancelled
          </div>
        }
        <div className='flex items-center bg-secondary/80 rounded-md text-white px-2 gap-2'>
          <FontAwesomeIcon icon={faComment} />
          {lead.notes.length}
        </div>
        <div className='flex items-center bg-secondary/80 rounded-md text-white px-2 gap-2'>
          <FontAwesomeIcon icon={faCodeCommit} />
          {lead.revisions.length}
        </div>
        {/* {lead.studies.length > 0 ? (
          <button className='std-button-lite flex items-center gap-2'>
            <FontAwesomeIcon icon={faFolderClosed} />
            {lead.studies.length}
          </button>
        ):(
          <div className='flex items-center bg-secondary/80 rounded-md text-white px-2 gap-2'>
            <FontAwesomeIcon icon={faFolderClosed} />
            {lead.studies.length}
          </div>
        )} */}
        
        <Link href={{pathname: '/leads/edit/[id]', query: { id: lead._id }}} as={`/leads/edit/${lead._id}`} className='std-button-lite' ><FontAwesomeIcon icon={faMagnifyingGlass}/></Link>
      </div>
    </li>
    </>
  );
}