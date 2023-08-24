import { faPlus, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useEffect, useState } from "react";
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
}

export default function StudyPlanTemplateSection ({sections, index, setSections}:Props) {

  const sectionData = sections[index];
  const [sectionName, setSectionName] = useState(sections[index].name);
  const [sectionExtensible, setSectionExtensible] = useState(sections[index].extensible);

    // Needed when sections is set by a higher-order component (such as when the revert to saved button is clicked)
    useEffect ( () => {
      setSectionExtensible(sections[index].extensible);
      setSectionName(sections[index].name);
    },[sections,index]);

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

  function handleAddRow(rowIndex:number) {
    const newSections = _.cloneDeep(sections);
    const newElement: any = {
      index: rowIndex,
      fields: [],
      extensible: false
    }
    newSections[index].rows.splice(rowIndex,0,newElement);
    setSections(newSections);
  }

  function handleDeleteSection () {
    const newSections = _.cloneDeep(sections);
    newSections.splice(index,1);
    setSections(newSections);
  }

  return (
    <>
      <div className='std-input flex flex-col w-full p-2 border border-1 border-secondary/80 rounded-lg gap-2'>
        <div className='flex justify-between items-center'>
          <div className='flex gap-2 items-center'>
          <div className='font-bold'>Section Name:</div>
          <input type="text" className='std-input' value={sectionName} onChange={(e)=>handleSectionNameUpdate(e)} />
        </div>
        <button className='secondary-button-lite' onClick={handleDeleteSection}>
          <FontAwesomeIcon icon={faX} />
        </button>
        </div>
        <label className='flex gap-2 py-2 font-bold'>
          Extensible Section:
          <input name='animalHeart' type='checkbox' checked={sectionExtensible} onChange={(e) => handleSectionExtensibleUpdate(e)}></input>
        </label>
        <div className='flex gap-2 items-center justify-between'>
          <div className='font-bold'>Rows:</div>
        </div>
        
        <div className='std-input flex flex-col w-full p-2 border border-1 border-secondary/80 rounded-lg gap-2'>
          { sectionData.rows.length > 0 ? 
            <>
            { sectionData.rows.map( (row:TemplateRow, rowIndex:number) => (
              // <div key={index}></div>
              <div key={`row-${rowIndex}`} className='flex flex-col gap-2'>
                <StudyPlanTemplateRow sections={sections} index={index} rowIndex={rowIndex} setSections={setSections} />
                <div className='flex justify-center'>
                  <button className='std-button-lite flex items-center justify-center gap-2' onClick={()=>handleAddRow(rowIndex+1)}>
                    <FontAwesomeIcon icon={faPlus} />
                    Row
                  </button>
                </div>
                
              </div>
            ))}
            </>
          :
            <>
            <div className='flex justify-center'>
              <button className='std-button-lite flex items-center justify-center gap-2' onClick={()=>handleAddRow(0)}>
                <FontAwesomeIcon icon={faPlus} />
                Row
              </button>
            </div>
            </>
          }
        </div>
      </div>
    </>
  );
}