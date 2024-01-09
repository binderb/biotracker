'use client';
import { FormRevisionWithAllLevels } from "@/db/schema_formsModule"
import { SalesLeadWithAllDetails } from "@/db/schema_salesleadsModule";

type Props = {
  mode: 'view' | 'salesleadedit'
  formContents: FormRevisionWithAllLevels
  leadDetails?: SalesLeadWithAllDetails
  setLeadDetails?: (leadDetails: SalesLeadWithAllDetails) => void
  currentStudyPlanIndex?: number
}

export default function FormView ({ formContents, mode, leadDetails, setLeadDetails, currentStudyPlanIndex }: Props) {

  function handleTextChange (currentStudyPlanIndex: number, sectionIndex: number, rowIndex: number, fieldIndex: number, value: string) {
    if (leadDetails && setLeadDetails) {
      const newLeadDetails = {...leadDetails}
      newLeadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value = value
      setLeadDetails(newLeadDetails);
    }

  }

  return (
    <>
    <section className='ui-subbox'>
      {formContents.sections.map((section, sectionIndex) => (
        <section key={sectionIndex}>
          <h6 className='font-bold'>{section.name}:</h6>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr>
                {Math.max(...section.rows.map(row => row.fields.length)) === 1 && (
                  <th className='w-[100%]'></th>
                )}
                {Math.max(...section.rows.map(row => row.fields.length)) === 2 && (
                  <>
                  <th className='w-[20%]'></th>
                  <th className='w-[80%]'></th>
                  </>
                )}
                {Math.max(...section.rows.map(row => row.fields.length)) >= 3 && (
                  <>
                  {new Array(Math.max(...section.rows.map(row => row.fields.length))).fill(0).map((_, index) => (
                    <th key={index}></th>
                  )
                  )}
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.fields.map((field, fieldIndex) => (
                    <td key={fieldIndex} className='bg-white/50 border border-secondary/80 p-1'>
                      {field.type === 'label' && (
                        <div className='font-bold'>
                        {Array.isArray(field.params) && field.params.length > 0 && field.params[0]}:
                        </div>
                      )}
                      {field.type === 'input' && (
                        <>
                        {mode === 'view' && (
                          <input className='std-input w-full' />
                        )}
                        {(mode === 'salesleadedit' && leadDetails && currentStudyPlanIndex !== undefined) && (
                          <>
                          <input className='std-input w-full' value={leadDetails.revisions[0].studyplans[currentStudyPlanIndex].formrevision.sections[sectionIndex].rows[rowIndex].fields[fieldIndex].salesleadformdata[0].value as string} onChange={(e)=>handleTextChange(currentStudyPlanIndex,sectionIndex,rowIndex,fieldIndex,e.target.value)} />
                          </>
                        )}
                        </>                        
                      )}
                      {field.type === 'textarea' && (
                        <>
                        <textarea className='std-input w-full h-[100px] resize-none align-top' />
                        </>
                      )}
                    </td>
                  ))}
                  
                </tr>
              ))}
            </tbody>
            </table>
          </section>
      ))}
    </section>
    </>
    );
}