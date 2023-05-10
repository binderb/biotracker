
interface Props {
  leadData: any
}

export default function DiscussionBoard(props:Props) {

  const { leadData } = props;

  function getFormattedDate (dateString:string) {
    const date = new Date(parseInt(dateString));
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLocaleLowerCase().replace(/ /,'')}`
  }

  return (
    <div className="flex flex-col gap-4 my-4">
      {leadData.notes.map((note:any) => (
        <div key={note._id} className='std-input relative flex flex-col gap-2 rounded-md ml-6'>
          <div className='absolute left-[-22px] bg-blue-400 text-white p-5 w-[44px] h-[44px] flex items-center rounded-full font-bold text-[18px] justify-center uppercase'>
            {`${note.author.first[0]}${note.author.last ? note.author.last[0] : ''}`}
          </div>
          <div className='flex flex-col gap-2 rounded-md pl-6 pr-2'>
          <div className='text-[12px]'>
            { getFormattedDate(note.createdAt) }
          </div>
          <div className='mb-2'>
            {note.content}
          </div> 
          </div> 
        </div>
        )
      )}
    </div>
  );
}