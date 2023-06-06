import { ChangeEvent, useState } from "react"

interface TemplateField {
  name: string,
  index: number,
  type: string,
  data: string,
  extensible: boolean,
}

interface TemplateSection {
  name: string
  index: number
  fields: Array<TemplateField>
  extensible: boolean
  extensibleGroupName: string
}

interface Props {
  sections: Array<TemplateSection>
  index: number
  fieldIndex: number
  setSections: Function
}

export default function LeadTemplateField ({sections, index, fieldIndex, setSections}:Props) {

  const [fieldName, setFieldName] = useState(sections[index].fields[fieldIndex].name);
  const [fieldType, setFieldType] = useState(sections[index].fields[fieldIndex].type);
  const [fieldExtensible, setFieldExtensible] = useState(sections[index].fields[fieldIndex].extensible);
  const fieldTypeOptions = ['textarea', 'multitextarea', 'input', 'multiinput', 'checkbox', 'multicheckbox'];

  function handleFieldNameUpdate (e:ChangeEvent<HTMLInputElement>) {
    setFieldName(e.target.value);
    const newSections = [...sections];
    newSections[index].fields[fieldIndex].name = e.target.value;
    setSections(newSections);
  }

  function handleFieldTypeUpdate (e:ChangeEvent<HTMLSelectElement>) {
    setFieldType(e.target.value);
    const newSections = [...sections];
    newSections[index].fields[fieldIndex].type = e.target.value;
    setSections(newSections);
  }

  function handleFieldExtensibleUpdate (e:ChangeEvent<HTMLInputElement>) {
    setFieldExtensible(e.target.checked);
    const newSections = [...sections];
    newSections[index].fields[fieldIndex].extensible = e.target.checked;
    setSections(newSections);
  }

  return (
    <>
    <div className='flex flex-col gap-2 std-input rounded-md'>
        <div className='flex gap-2 items-center'>
          <div className='font-bold'>Field Name:</div>
          <input type="text" className='std-input' value={fieldName} onChange={(e)=>handleFieldNameUpdate(e)} />
        </div>
        <div className='flex gap-2 items-center'>
          <div className='font-bold'>Type:</div>
          <select className='std-input' value={fieldType} onChange={(e)=>handleFieldTypeUpdate(e)}>
            { fieldTypeOptions.map((option:string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <label className='flex gap-2 py-2 font-bold'>
          Extensible Section:
          <input name='animalHeart' type='checkbox' checked={fieldExtensible} onChange={(e) => handleFieldExtensibleUpdate(e)}></input>
        </label>
    </div>
    </>
  );
}