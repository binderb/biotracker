import { faPlus, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useEffect, useState } from "react";
import StudyPlanTemplateField from "./StudyPlanTemplateField";
import _ from 'lodash';

interface TemplateField {
  index: number
  type: string
  params: Array<string>
  data: Array<string>
}

interface TemplateRow {
  index: number
  fields: Array<TemplateField>
  extensible: boolean
  extensibleReference?: number
}

interface TemplateSection {
  name: string
  index: number
  rows: Array<TemplateRow>
  extensible: boolean
  extensibleReference?: number
}

interface Props {
  index: number
  rowIndex: number
  sections: Array<TemplateSection>
  setSections: Function
}

export default function StudyPlanTemplateRow ({sections, index, rowIndex, setSections}:Props) {

  const sectionData = sections[index];
  const rowData = sections[index].rows[rowIndex];
  const [rowExtensible, setRowExtensible] = useState(sections[index].extensible);

  // Needed when sections is set by a higher-order component (such as when the revert to saved button is clicked)
  useEffect ( () => {
    setRowExtensible(sections[index].rows[rowIndex].extensible);
  },[sections,rowIndex,index]);

  function handleRowExtensibleUpdate(e:ChangeEvent<HTMLInputElement>) {
    setRowExtensible(e.target.checked);
    const newSections = [...sections];
    newSections[index].rows[rowIndex].extensible = e.target.checked;
    newSections[index].rows[rowIndex].extensibleReference = rowIndex;
    setSections(newSections);
  }

  function handleAddField(fieldIndex:number) {
    const newSections = _.cloneDeep(sections);
    const newField = {
      index: fieldIndex,
      type: 'label',
      data: [''],
      params: [],
    }
    newSections[index].rows[rowIndex].fields.splice(fieldIndex,0,newField);
    setSections(newSections);
  }

  function handleDeleteRow () {
    const newSections = [...sections];
    newSections[index].rows.splice(rowIndex,1);
    setSections(newSections);
  }

  return (
    <>
      <div className='std-input flex flex-col w-full p-2 border border-1 border-secondary/80 rounded-lg gap-2'>
        <div className='flex gap-2 items-center justify-between'>
          {`Row ${rowIndex+1}:`}
          <button className='secondary-button-lite' onClick={handleDeleteRow}><FontAwesomeIcon icon={faX}/></button>
        </div>
        <label className='flex gap-2 py-2 font-bold'>
          Extensible Row:
          <input name='animalHeart' type='checkbox' checked={rowExtensible} onChange={(e) => handleRowExtensibleUpdate(e)}></input>
        </label>
        <div className='flex gap-2 items-center justify-between'>
          <div className='font-bold'>Fields:</div>
        </div>
        
        <div className='std-input flex flex-col w-full p-2 border border-1 border-secondary/80 rounded-lg gap-2'>
          { rowData.fields.length > 0 ? 
            <>
            { rowData.fields.map( (field:TemplateField, fieldIndex:number) => (
              <div key={fieldIndex} className='flex flex-col gap-2'>
                {
                  fieldIndex === 0 && (
                    <div className='flex justify-center'>
                      <button className='std-button-lite flex items-center justify-center gap-2' onClick={() => handleAddField(0)}>
                        <FontAwesomeIcon icon={faPlus} />
                        Field
                      </button>
                    </div>
                  )
                }
                <StudyPlanTemplateField key={`field${fieldIndex}`} sections={sections} index={index} rowIndex={rowIndex} fieldIndex={fieldIndex} setSections={setSections} />
                <div className='flex justify-center'>
                  <button className='std-button-lite flex items-center justify-center gap-2' onClick={() =>handleAddField(fieldIndex+1)}>
                    <FontAwesomeIcon icon={faPlus} />
                    Field
                  </button>
                </div>
              </div>
            ))}
            </>
          :
            <>
            <div className='flex justify-center'>
              <button className='std-button-lite flex items-center justify-center gap-2' onClick={()=>handleAddField(0)}>
                <FontAwesomeIcon icon={faPlus} />
                Field
              </button>
            </div>
            </>
          }
        </div>
      </div>
    </>
  );
}