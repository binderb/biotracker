import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useEffect, useState } from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  client: any
  leadData: any
  content: any
  users: any
  setContent: Function
}

export default function LeadEditor ({client, content, leadData, users, setContent}:Props) {

  const [currentStudyPlanIndex, setCurrentStudyPlanIndex] = useState(0);

  useEffect( () => {
    if (currentStudyPlanIndex >= content.length-1) {
      setCurrentStudyPlanIndex(content.length-1);
    }
  },[currentStudyPlanIndex, setCurrentStudyPlanIndex, content]);

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
    console.log(newContent);
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
    console.log(date);
    const newContent = [...content];
    const newData = [...newContent[currentStudyPlanIndex].sections[sectionIndex].rows[rowIndex].fields[fieldIndex].data];
    newData.splice(dataIndex,1,date);
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
    const newContent = [...content];
    newContent[currentStudyPlanIndex].sections[sectionIndex].rows.push(newRow);
    setContent(newContent);
  }

  function handleDeleteExtensibleRow(e:any, sectionIndex: number, rowIndex: number) {
    e.preventDefault();
    const newContent = [...content];
    newContent[currentStudyPlanIndex].sections[sectionIndex].rows.splice(rowIndex,1);
    setContent(newContent);
  }

  return (
    <>
      <section>
        
        <form>
          <div className='mr-2 font-bold'>Sponsor Information:</div>
          <div className='flex border border-secondary rounded-md items-center p-4 mt-2 mb-4'>
            <div className='mr-2'>Client:</div>
            <div>{client}</div>
          </div>
          <section className='flex items-center gap-2 pb-4'>
            <div className="font-bold">Study Plan:</div>
            <select className="std-input flex-grow" value={currentStudyPlanIndex} onChange={(e) => setCurrentStudyPlanIndex(parseInt(e.target.value))}>
              { content.map((plan:any, index:number) => (
                <option key={index} value={index}>
                  {plan.name}
                </option>
              ))}
            </select>
          </section>
          
          {content[currentStudyPlanIndex]?.sections.map( (section:any, sectionIndex:number) => (
            <section key={sectionIndex}>
              <div className='mr-2 font-bold'>{section.name}:</div>
              <div className='border border-secondary rounded-lg p-2 overflow-x-auto my-2'>
              <table className='w-full'><tbody>
              {section.rows.map( (row:any, rowIndex:number) => (
                // <div key={rowIndex} className='flex gap-2 items-center'>
                <tr key={rowIndex}>
                  {row.fields.map((field:any, fieldIndex:number) => (
                    <>
                      {field.type === 'label' && (
                        <td key={fieldIndex} className='align-top py-1'>
                          { row.fields.length > 1 && !row.extensible &&
                            <div className='font-bold'>{field.params[0]}:</div>
                          }
                          { row.extensible &&
                            <div className='font-bold'>{field.params[0]} {section.rows.indexOf(row)+1}:</div>
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
                        { row.extensible && rowIndex > 0 &&
                          <button className='secondary-button-lite' onClick={(e) => handleDeleteExtensibleRow(e, sectionIndex, rowIndex)}><FontAwesomeIcon icon={faX}/></button>
                        }
                        {/* ROW ADD BUTTON */}
                        {row.extensible && section.rows.indexOf(row) == section.rows.length-1 &&
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
                    
                    </>
                  ))}
                  
                  </tr>
              ))}
              </tbody></table>
              </div>
            </section>
          ))}
          
        </form>
        </section>
    </>
  );
}