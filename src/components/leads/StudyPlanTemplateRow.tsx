import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useState } from "react";
import StudyPlanTemplateField from "./StudyPlanTemplateField";

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
}

interface TemplateSection {
  name: string
  index: number
  rows: Array<TemplateRow>
  extensible: boolean
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

  function handleRowExtensibleUpdate(e:ChangeEvent<HTMLInputElement>) {
    setRowExtensible(e.target.checked);
    const newSections = [...sections];
    newSections[index].rows[rowIndex].extensible = e.target.checked;
    setSections(newSections);
  }

  function handleAddField() {
    const newSections = [...sections];
    newSections[index].rows[rowIndex].fields.push({
      index: newSections[index].rows[rowIndex].fields.length,
      type: 'label',
      data: [''],
      params: [],
    });
    setSections(newSections);
  }

  return (
    <>
      <div className='std-input flex flex-col w-full p-2 border border-1 border-secondary/80 rounded-lg gap-2'>
        <div className='flex gap-2 items-center'>
          {`Row ${rowIndex+1}:`}
        </div>
        <label className='flex gap-2 py-2 font-bold'>
          Extensible Row:
          <input name='animalHeart' type='checkbox' checked={rowExtensible} onChange={(e) => handleRowExtensibleUpdate(e)}></input>
        </label>
        <div className='flex gap-2 items-center justify-between'>
          <div className='font-bold'>Fields:</div>
          <button className='std-button-lite flex gap-2 items-center' onClick={handleAddField}><FontAwesomeIcon icon={faPlus}/>Add Field</button>
        </div>
        
        <div className='std-input flex flex-col w-full p-2 border border-1 border-secondary/80 rounded-lg gap-2'>
          { rowData.fields.length > 0 ? 
            <>
            { rowData.fields.map( (field:TemplateField, fieldIndex:number) => (
              // <div key={index}></div>
              <StudyPlanTemplateField key={`field${fieldIndex}`} sections={sections} index={index} rowIndex={rowIndex} fieldIndex={fieldIndex} setSections={setSections} />
            ))}
            </>
          :
            <>
            No fields yet.
            </>
          }
        </div>
      </div>
    </>
  );
}