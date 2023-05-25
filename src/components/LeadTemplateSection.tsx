import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useState } from "react";
import LeadTemplateField from "./LeadTemplateField";

interface TemplateField {
  name: string,
  index: number,
  type: string,
  data: string,
  extensible: boolean,
}

interface TemplateSection {
  name: string
  fields: Array<TemplateField>
  extensible: boolean
  extensibleGroupName: string
}

interface Props {
  index: number
  sections: Array<TemplateSection>
  setSections: Function
}

export default function LeadTemplateSection ({sections, index, setSections}:Props) {

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

  function handleAddField() {
    const newSections = [...sections];
    newSections[index].fields.push({
      name: '',
      index: newSections[index].fields.length,
      type: 'textarea',
      data: '',
      extensible: false
    });
    setSections(newSections);
  }

  return (
    <>
      <div className='flex flex-col w-full p-2 border border-1 border-black rounded-md gap-2'>
        <div className='flex gap-2 items-center'>
          <div className='font-bold'>Section Name:</div>
          <input type="text" className='std-input' value={sectionName} onChange={(e)=>handleSectionNameUpdate(e)} />
        </div>
        <label className='flex gap-2 py-2 font-bold'>
          Extensible Section:
          <input name='animalHeart' type='checkbox' checked={sectionExtensible} onChange={(e) => handleSectionExtensibleUpdate(e)}></input>
        </label>
        <div className='flex gap-2 items-center justify-between'>
          <div className='font-bold'>Fields:</div>
          <button className='std-button-lite flex gap-2 items-center' onClick={handleAddField}><FontAwesomeIcon icon={faPlus}/>Add Field</button>
        </div>
        
        <div className='flex flex-col w-full p-2 border border-1 border-black rounded-md gap-2'>
          { sectionData.fields.length > 0 ? 
            <>
            { sectionData.fields.map( (field:TemplateField, fieldIndex:number) => (
              <>
                <LeadTemplateField key={index} sections={sections} index={index} fieldIndex={fieldIndex} setSections={setSections} />
              </>
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