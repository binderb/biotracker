import { faClockRotateLeft, faCodeCommit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  leadData: any
}

export default function DiscussionBoard(props:Props) {

  const { leadData } = props;
  const drafterColors:Array<string> = [];
  leadData.drafters.map( (drafter:any, index:number) => {
    const drafterColorStyles = ['drafter1', 'drafter2', 'drafter3', 'drafter4', 'drafter5', 'drafter6', 'drafter7', 'drafter8'];
    drafterColors.push(drafterColorStyles[index % drafterColorStyles.length]);
  });

  function getFormattedDate (dateString:string) {
    const date = new Date(parseInt(dateString));
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLocaleLowerCase().replace(/ /,'')}`
  }

  return (
    <div className="flex flex-col gap-4 my-4">
      <div className='hidden bg-drafter1'></div>
      <div className='hidden bg-drafter2'></div>
      <div className='hidden bg-drafter3'></div>
      <div className='hidden bg-drafter4'></div>
      <div className='hidden bg-drafter5'></div>
      <div className='hidden bg-drafter6'></div>
      <div className='hidden bg-drafter7'></div>
      <div className='hidden bg-drafter8'></div>
      {leadData.notes.map((note:any) => {
        return (
          <div key={note._id} className='std-input relative flex flex-col gap-2 rounded-md ml-6'>
            <div className={`absolute left-[-22px] bg-${drafterColors[leadData.drafters.map((drafter:any)=>drafter._id).indexOf(note.author._id)]} text-white p-5 w-[44px] h-[44px] flex items-center rounded-full font-bold text-[18px] justify-center uppercase`}>
              {`${note.author.first[0]}${note.author.last ? note.author.last[0] : ''}`}
            </div>
            <div className='flex flex-col gap-2 rounded-md pl-6 pr-2'>
            <div className='flex items-center text-[12px] gap-2'>
              { getFormattedDate(note.createdAt) }
              { note.newRevision && <>
                {/* <FontAwesomeIcon icon={faCodeCommit}/> */}
                <button className='hover:text-secondaryHighlight'>
                  <FontAwesomeIcon icon={faClockRotateLeft}/>
                </button>
              </> }
            </div>
            <div className='mb-2'>
              {note.content}
            </div> 
            </div> 
          </div>
        )
      })}
    </div>
  );
}