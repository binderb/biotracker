import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useState } from "react";
import StudyPlanTemplateRow from "./StudyPlanTemplateRow";
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
}

interface TemplateSection {
  name: string
  index: number
  rows: Array<TemplateRow>
  extensible: boolean
}

interface Props {
  index: number
  sections: Array<TemplateSection>
  setSections: Function
  handleDeleteSection: Function
}

export default function StudyPlanTemplateSection ({sections, index, setSections, handleDeleteSection}:Props) {

  const sectionData = sections[index];
  const [sectionName, setSectionName] = useState(sections[index].name);
  const [sectionExtensible, setSectionExtensible] = useState(sections[index].extensible);

  function handleSectionNameUpdate(e:ChangeEvent<HTMLInputElement>) {
    setSectionName(e.target.value);
    const newSections = [...sections];
    newSections[index].name = e.target.value;
    setSections(newSections);
  }

  function handleSectionExtensibleUpdate(e:ChangeEvent<HTMLInputElement>) {
    setSectionExtensible(e.target.checked);
    const newSections = [...sections];
    newSections[index].extensible = e.target.checked;
    setSections(newSections);
  }

  function handleAddRow() {
    const newSections = _.cloneDeep(sections);
    const newElement: any = {
      index: sections[index].rows.length,
      fields: [],
      extensible: false
    }
    newSections[index].rows = [...newSections[index].rows, newElement];
    setSections(newSections);
  }

  return (
    <>
      <div className='std-input flex flex-col w-full p-2 border border-1 border-secondary/80 rounded-lg gap-2'>
        <div className='flex gap-2 items-center'>
          <div className='font-bold'>Section Name:</div>
          <input type="text" className='std-input' value={sectionName} onChange={(e)=>handleSectionNameUpdate(e)} />
          <button className='secondary-button-lite' onClick={() => handleDeleteSection(index)}>Delete</button>
        </div>
        <label className='flex gap-2 py-2 font-bold'>
          Extensible Section:
          <input name='animalHeart' type='checkbox' checked={sectionExtensible} onChange={(e) => handleSectionExtensibleUpdate(e)}></input>
        </label>
        <div className='flex gap-2 items-center justify-between'>
          <div className='font-bold'>Rows:</div>
          <button className='std-button-lite flex gap-2 items-center' onClick={handleAddRow}><FontAwesomeIcon icon={faPlus}/>Add Row</button>
        </div>
        
        <div className='std-input flex flex-col w-full p-2 border border-1 border-secondary/80 rounded-lg gap-2'>
          { sectionData.rows.length > 0 ? 
            <>
            { sectionData.rows.map( (row:TemplateRow, rowIndex:number) => (
              // <div key={index}></div>
              <StudyPlanTemplateRow key={`row-${rowIndex}`} sections={sections} index={index} rowIndex={rowIndex} setSections={setSections} />
            ))}
            </>
          :
            <>
            No rows yet.
            </>
          }
        </div>
      </div>
    </>
  );
}