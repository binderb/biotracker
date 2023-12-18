'use client';
import { FormRevisionWithAllLevels } from "@/db/schema_formsModule"

type Props = {
  formContents: FormRevisionWithAllLevels
}

export default function FormView ({ formContents }: Props) {
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
                        <input className='std-input w-full' />
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