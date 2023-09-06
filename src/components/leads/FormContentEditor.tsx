import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, Fragment } from "react";
import DatePicker from 'react-datepicker';
import _ from 'lodash';

interface Props {
  users: any
  client: any
  leadData: any
  content: any
  currentStudyPlanIndex: number
  setContent: Function
}

export default function FormContentEditor ({users, client, leadData, content, setContent, currentStudyPlanIndex}:Props) {

  function handleUpdateLeadInputField(e:ChangeEvent<HTMLInputElement>,sectionIndex:number,rowIndex:number,fieldIndex:number,dataIndex:number,type:string) {
    const newContent = [...content];
    if (type === 'checkbox' || type === 'multicheckbox') {
      const newData = [...newContent[currentStudyPlanIndex].sections[sectionIndex].rows[rowIndex].fields[fieldIndex].data];
      newData.splice(dataIndex,1,e.target.checked);
      newContent[currentStudyPlanIndex].sections[sectionIndex].rows[rowIndex].fields[fieldIndex].data = newData;
    } else { 
      const newData = [...newContent[currentStudyPlanIndex].sections[sectionIndex].rows[rowIndex].fields[fieldIndex].data];
      newData.splice(dataIndex,1,e.target.value);
      newContent[currentStudyPlanIndex].sections[sectionIndex].rows[rowIndex].fields[fieldIndex].data = newData;
    }
    setContent(newContent);
  }

  function handleUpdateLeadTextArea(e:ChangeEvent<HTMLTextAreaElement>,sectionIndex:number,rowIndex:number,fieldIndex:number,dataIndex:number,type:string) {
    const newContent = [...content];
    const newData = [...newContent[currentStudyPlanIndex].sections[sectionIndex].rows[rowIndex].fields[fieldIndex].data];
    newData.splice(dataIndex,1,e.target.value);
    newContent[currentStudyPlanIndex].sections[sectionIndex].rows[rowIndex].fields[fieldIndex].data = newData;
    setContent(newContent);
  }

  function handleUpdateLeadSelectField(e:ChangeEvent<HTMLSelectElement>,sectionIndex:number,rowIndex:number,fieldIndex:number,dataIndex:number,type:string) {
    const newContent = [...content];
    const newData = [...newContent[currentStudyPlanIndex].sections[sectionIndex].rows[rowIndex].fields[fieldIndex].data];
    newData.splice(dataIndex,1,e.target.value);
    newContent[currentStudyPlanIndex].sections[sectionIndex].rows[rowIndex].fields[fieldIndex].data = newData;
    setContent(newContent);
  }

  function handleUpdateLeadDateField(date:string, sectionIndex:number, rowIndex:number, fieldIndex:number, dataIndex:number) {
    const formattedDate = new Date(date).toISOString();
    const newContent = [...content];
    const newData = [...newContent[currentStudyPlanIndex].sections[sectionIndex].rows[rowIndex].fields[fieldIndex].data];
    newData.splice(dataIndex,1,formattedDate);
    newContent[currentStudyPlanIndex].sections[sectionIndex].rows[rowIndex].fields[fieldIndex].data = newData;
    setContent(newContent);
  }

  function handleAddExtensibleRow(e:any,sectionIndex:number,rowIndex:number) {
    e.preventDefault();
    const newRow = {
      ...content[currentStudyPlanIndex].sections[sectionIndex].rows[rowIndex], 
      index: content[currentStudyPlanIndex].sections[sectionIndex].rows[rowIndex].index+1,
      fields: [
        ...content[currentStudyPlanIndex].sections[sectionIndex].rows[rowIndex].fields.map( (field:any) => {return {...field, data: ''};})
      ]
    };
    const newContent = _.cloneDeep(content);
    newContent[currentStudyPlanIndex].sections[sectionIndex].rows.splice(rowIndex+1,0,newRow);
    if (rowIndex+1 < newContent[currentStudyPlanIndex].sections[sectionIndex].rows.length-1) {
      for (let i=rowIndex+2; i<newContent[currentStudyPlanIndex].sections[sectionIndex].rows.length; i++) {
        if (newContent[currentStudyPlanIndex].sections[sectionIndex].rows[i].extensibleReference && newContent[currentStudyPlanIndex].sections[sectionIndex].rows[i].extensibleReference !== newContent[currentStudyPlanIndex].sections[sectionIndex].rows[rowIndex].extensibleReference) {
          newContent[currentStudyPlanIndex].sections[sectionIndex].rows[i].extensibleReference++;
        }
      }
    }
    console.log(newContent);
    setContent(newContent);
  }

  function handleDeleteExtensibleRow(e:any, sectionIndex: number, rowIndex: number) {
    e.preventDefault();
    console.log("deleting ", rowIndex)
    const newContent = _.cloneDeep(content);
    newContent[currentStudyPlanIndex].sections[sectionIndex].rows.splice(rowIndex,1);
    if (rowIndex <= newContent[currentStudyPlanIndex].sections[sectionIndex].rows.length-1) {
      for (let i=rowIndex; i<newContent[currentStudyPlanIndex].sections[sectionIndex].rows.length; i++) {
        if (newContent[currentStudyPlanIndex].sections[sectionIndex].rows[i].extensibleReference && newContent[currentStudyPlanIndex].sections[sectionIndex].rows[i].extensibleReference !== newContent[currentStudyPlanIndex].sections[sectionIndex].rows[rowIndex-1].extensibleReference) {
          newContent[currentStudyPlanIndex].sections[sectionIndex].rows[i].extensibleReference--;
        }
      }
    }
    setContent(newContent);
  }

  function handleAddExtensibleSection (e:any, sectionIndex:number) {
    e.preventDefault();
    const newSection = {
      ...content[currentStudyPlanIndex].sections[sectionIndex],
      rows: [...content[currentStudyPlanIndex].sections[sectionIndex].rows.map((row:any, rowIndex:number) => {
        return {
          ...row,
          fields: [...content[currentStudyPlanIndex].sections[sectionIndex].rows[rowIndex].fields.map((field:any) => {return {...field, data: ''};})]
        }
      })]
    }
    const newContent = _.cloneDeep(content);
    newContent[currentStudyPlanIndex].sections.splice(sectionIndex+1,0,newSection);
    if (sectionIndex+1 < newContent[currentStudyPlanIndex].sections.length-1) {
      for (let i=sectionIndex+2; i<newContent[currentStudyPlanIndex].sections.length; i++) {
        if (newContent[currentStudyPlanIndex].sections[i].extensibleReference && newContent[currentStudyPlanIndex].sections[i].extensibleReference !== newContent[currentStudyPlanIndex].sections[sectionIndex].extensibleReference) {
          newContent[currentStudyPlanIndex].sections[i].extensibleReference++;
        }
      }
    }
    setContent(newContent);
  }

  function handleDeleteExtensibleSection (e:any, sectionIndex:number) {
    e.preventDefault();
    const newContent = _.cloneDeep(content);
    newContent[currentStudyPlanIndex].sections.splice(sectionIndex,1);
    if (sectionIndex <= newContent[currentStudyPlanIndex].sections.length-1) {
      for (let i=sectionIndex; i<newContent[currentStudyPlanIndex].sections.length; i++) {
        if (newContent[currentStudyPlanIndex].sections[i].extensibleReference && newContent[currentStudyPlanIndex].sections[i].extensibleReference !== newContent[currentStudyPlanIndex].sections[sectionIndex-1].extensibleReference) {
          newContent[currentStudyPlanIndex].sections[i].extensibleReference--;
        }
      }
    }
    setContent(newContent);
  }

  return (
    <>
    {content[currentStudyPlanIndex]?.sections && content[currentStudyPlanIndex]?.sections.map( (section:any, sectionIndex:number) => (
      <section key={`section-${sectionIndex}`}>
        { section.extensible &&
          <div className='flex gap-2 items-center'>
            <div className='mr-2 font-bold'>{section.name}{section.extensibleReference ? ` ${content[currentStudyPlanIndex]?.sections.indexOf(section)+1-section.extensibleReference}` : ` ${sectionIndex+1}`}:</div>
            { section.extensible && section.extensibleReference && sectionIndex > section.extensibleReference &&
              <button className='secondary-button-lite' onClick={(e) => handleDeleteExtensibleSection(e, sectionIndex)}><FontAwesomeIcon icon={faX}/></button>
            }
            { section.extensible &&
              <div className='flex'>
                <button className='std-button-lite' onClick={(e) => handleAddExtensibleSection(e, sectionIndex)}>Add</button>
              </div>
            }
          </div>
        }
        { !section.extensible && 
          <div className='mr-2 font-bold'>{section.name}:</div>
        }
        <div className='border border-secondary rounded-lg p-2 overflow-x-auto my-2'>
        <table className='w-full'><tbody>
        {section.rows.map( (row:any, rowIndex:number) => (
          // <div key={rowIndex} className='flex gap-2 items-center'>
          <tr key={`row-${rowIndex}`}>
            {row.fields.map((field:any, fieldIndex:number) => (
              <Fragment key={`field-${fieldIndex}`}>
                {field.type === 'label' && (
                  <td key={fieldIndex} className='align-top py-1'>
                    { row.extensible &&
                      <div className='font-bold'>{field.params[0]}{row.extensibleReference ? ` ${section.rows.indexOf(row)+1-row.extensibleReference}` : ` ${rowIndex+1}`}:</div>
                    }
                    { !row.extensible &&
                      <div className='font-bold'>{field.params[0]}:</div>
                    }
                  </td>
                )}
                {field.type === 'textarea' && (
                  <td className='align-middle py-1'>
                  <textarea className='resize-none std-input w-full h-[100px]' value={field.data} onChange={(e) => handleUpdateLeadTextArea(e, sectionIndex, rowIndex, fieldIndex, 0, field.type)} />
                  </td>
                )}
                {field.type === 'input' && (
                  <td className='flex gap-2 align-middle py-1'>
                  <input type='text' className='std-input flex-grow w-full' value={field.data} onChange={(e) => handleUpdateLeadInputField(e, sectionIndex, rowIndex, fieldIndex, 0, field.type)} />
                  {/* ROW DELETE BUTTON */}
                  { (row.extensible && row.extensibleReference !== null && rowIndex > row.extensibleReference) &&
                    <button className='secondary-button-lite' onClick={(e) => handleDeleteExtensibleRow(e, sectionIndex, rowIndex)}><FontAwesomeIcon icon={faX}/></button>
                  }
                  {/* ROW ADD BUTTON */}
                  {row.extensible &&
                    <div className='flex'>
                      <button className='std-button-lite' onClick={(e) => handleAddExtensibleRow(e, sectionIndex, rowIndex)}>Add</button>
                    </div>
                  }
                  </td>
                  
                )}
                {field.type === 'checkbox' && (
                  <td className='align-middle py-1'>
                  <label className='form-control'>
                  <input type='checkbox' checked={field.data[0]} onChange={(e) => handleUpdateLeadInputField(e, sectionIndex, rowIndex, fieldIndex, 0, field.type)} />
                  {field.params[0]}
                  </label>
                  </td>
                )}
                {field.type === 'multicheckbox' && (
                  <td className='align-top'>
                  <div className='flex flex-col gap-2 justify-start items-start'>
                    { field.params.map( (param:string, i:number) => (
                        <label key={i} className='form-control'>
                        <input type='checkbox' checked={field.data[i]} onChange={(e) => handleUpdateLeadInputField(e, sectionIndex, rowIndex, fieldIndex, i, field.type)} />
                        {param}
                        </label>
                    ))}
                  </div>
                  </td>
                )}
                {field.type === 'date' && (
                  <td className='align-top'>
                    <DatePicker className='std-input' dateFormat='MM/dd/yyyy' selected={field.data[0] ? new Date(field.data[0]) : null} onChange={(date:any) => handleUpdateLeadDateField(date, sectionIndex, rowIndex, fieldIndex, 0)} />
                  </td>
                )}
                {field.type === 'database' && (
                  <td className='align-top'>
                    {
                      field.params[0] === 'users' && (
                        <select className='std-input w-full' value={field.data[0]} onChange={(e) => handleUpdateLeadSelectField(e, sectionIndex, rowIndex, fieldIndex, 0, field.type)}>
                          <option value=''>-- Choose --</option>
                          {
                            users.map((user:any, index:number) => (
                              <option key={index} value={user._id}>
                                {`${user.first} ${user.last}`}
                              </option>
                            ))
                          }
                        </select>
                      )
                    }
                  </td>
                )}
                {field.type === 'generated' && (
                  <td className='align-top'>
                    {
                      field.params[0] === 'studyId' && (
                        <>
                        {
                          content[currentStudyPlanIndex].associatedStudyId ? (
                              <>
                              {
                                `${client}${leadData?.studies.filter((e:any) => e._id === content[currentStudyPlanIndex].associatedStudyId)[0].index.toString().padStart(4,'0')}-${leadData?.studies.filter((e:any) => e._id === content[currentStudyPlanIndex].associatedStudyId)[0].type}`
                              }
                              </>
                          ) : (
                            <div className='italic'>(TBD - will be generated when lead is published)</div>
                          )
                        }
                        </>
                      )
                    }
                  </td>
                )}
              </Fragment>
            ))}
            
            </tr>
        ))}
        </tbody></table>
        </div>
      </section>
    ))}
    </>
  );
}