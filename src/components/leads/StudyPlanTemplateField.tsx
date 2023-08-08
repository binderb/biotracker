import { ChangeEvent, useState } from "react"

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
  sections: Array<TemplateSection>
  index: number
  rowIndex: number
  fieldIndex: number
  setSections: Function
}

export default function StudyPlanTemplateField ({sections, index, rowIndex, fieldIndex, setSections}:Props) {

  const [fieldType, setFieldType] = useState(sections[index].rows[rowIndex].fields[fieldIndex].type);
  const [fieldParams, setFieldParams] = useState(sections[index].rows[rowIndex].fields[fieldIndex].params)
  const fieldTypeOptions = ['label', 'textarea', 'multitextarea', 'input', 'multiinput', 'checkbox', 'multicheckbox', 'date'];

  function handleFieldTypeUpdate (e:ChangeEvent<HTMLSelectElement>) {
    setFieldType(e.target.value);
    if (e.target.value.indexOf('multi') < 0) {
      setFieldParams([]);
    }
    const newSections = [...sections];
    newSections[index].rows[rowIndex].fields[fieldIndex].type = e.target.value;
    setSections(newSections);
  }

  function handleFieldParamsUpdate (e:ChangeEvent<HTMLInputElement>) {
    const multiValues = e.target.value.split(',');
    setFieldParams(multiValues);
    const newSections = [...sections];
    newSections[index].rows[rowIndex].fields[fieldIndex].params = multiValues;
    newSections[index].rows[rowIndex].fields[fieldIndex].data = new Array<string>(multiValues.length);
    setSections(newSections);
  }

  return (
    <>
    <div className='flex flex-col gap-2 std-input rounded-lg'>
        <div className='flex gap-2 items-center'>
          <div className='font-bold'>Type:</div>
          <select className='std-input' value={fieldType} onChange={(e)=>handleFieldTypeUpdate(e)}>
            { fieldTypeOptions.map((option:string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        { fieldType === 'label' &&
        <div className='flex items-center gap-2'>
          <div className='font-bold'>Label Text (no commas):</div>
          <input type="text" className='std-input' value={fieldParams?.join(',')} onChange={(e)=>handleFieldParamsUpdate(e)} />
        </div>
        }
        { fieldType === 'checkbox' &&
        <div className='flex items-center gap-2'>
          <div className='font-bold'>Checkbox Label (no commas):</div>
          <input type="text" className='std-input' value={fieldParams?.join(',')} onChange={(e)=>handleFieldParamsUpdate(e)} />
        </div>
        }
        { fieldType === 'multicheckbox' &&
        <div className='flex flex-col items-start gap-2'>
          <div className='font-bold'>Checkbox Labels (separated by commas):</div>
          <input type="text" className='std-input w-full' value={fieldParams?.join(',')} onChange={(e)=>handleFieldParamsUpdate(e)} />
        </div>
        }
    </div>
    </>
  );
}