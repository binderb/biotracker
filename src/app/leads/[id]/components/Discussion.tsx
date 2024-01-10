'use client';

import { SalesLeadWithAllDetails } from '@/db/schema_salesleadsModule';
import { User } from '@/db/schema_usersModule';
import { getFormattedDate } from '@/lib/helpers';
import { FaClockRotateLeft } from 'react-icons/fa6';

type Props = {
  leadDetails: SalesLeadWithAllDetails;
};

export default function Discussion({ leadDetails }: Props) {
  const drafterColors: Array<string> = [];
  const uniqueNoteAuthors = leadDetails.notes.map((note) => note.author.id).filter((value, index, self) => self.indexOf(value) === index);
  // add any contributor ids that aren't already in the uniqueNoteAuthors array
  leadDetails.contributors.forEach((joinTableEntry) => {
    if (uniqueNoteAuthors.indexOf(joinTableEntry.contributor.id) === -1) {
      uniqueNoteAuthors.push(joinTableEntry.contributor.id);
    }
  });
  uniqueNoteAuthors.map((author, index: number) => {
    const drafterColorStyles = ['drafter1', 'drafter2', 'drafter3', 'drafter4', 'drafter5', 'drafter6', 'drafter7', 'drafter8'];
    drafterColors.push(drafterColorStyles[index % drafterColorStyles.length]);
  });

  return (
    <div className='flex flex-col gap-4'>
      <div className='hidden bg-drafter1'></div>
      <div className='hidden bg-drafter2'></div>
      <div className='hidden bg-drafter3'></div>
      <div className='hidden bg-drafter4'></div>
      <div className='hidden bg-drafter5'></div>
      <div className='hidden bg-drafter6'></div>
      <div className='hidden bg-drafter7'></div>
      <div className='hidden bg-drafter8'></div>
      {leadDetails.notes.length === 0 && <div className='italic'>No notes have been added yet.</div>}
      {leadDetails.notes.length > 0 && (
        <>
          {leadDetails.notes.map((note) => {
            return (
              <div key={note.id} className='std-input relative flex flex-col gap-2 rounded-md ml-6'>
                <div className={`absolute left-[-22px] bg-${drafterColors[uniqueNoteAuthors.indexOf(note.author.id)]} text-white p-5 w-[44px] h-[44px] flex items-center rounded-full font-bold text-[18px] justify-center uppercase`}>{`${note.author.first[0]}${note.author.last ? note.author.last[0] : ''}`}</div>
                <div className='flex flex-col gap-2 rounded-md pl-6 pr-2'>
                  <div className='flex items-center text-[12px] gap-2'>
                    {getFormattedDate(note.created)}
                    {note.newRevision && (
                      <>
                        <button className='hover:text-secondaryHighlight'>
                          <FaClockRotateLeft />
                        </button>
                      </>
                    )}
                    {/* { note.revision.published && note.newRevision && <>
                <button className='hover:text-secondaryHighlight'>
                  <FontAwesomeIcon icon={faFileExport}/>
                </button>
              </> } */}
                  </div>
                  <div className='mb-2 whitespace-pre-line'>{note.note}</div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
