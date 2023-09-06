import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StudyPlanTemplateSection from "./StudyPlanTemplateSection";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
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
  extensibleReference?: boolean
}

interface Props {
  sections: any
  setSections: Function
}

export default function FormLayoutEditor ({sections, setSections}:Props) {

  function handleAddSection (sectionIndex:number) {
    const newSection : TemplateSection = {
      name: '',
      index: sectionIndex,
      rows: [] as TemplateRow[],
      extensible: false,
    }
    const newSections = _.cloneDeep(sections);
    newSections.splice(sectionIndex,0,newSection);
    setSections(newSections);
  }

  return (
    <>
      <div className='flex flex-col gap-2'>
        { sections.length > 0 ? 
          <>
          {sections.map((section:TemplateSection, sectionIndex:number) => 
            <div key={sectionIndex} className='flex flex-col gap-2'>
              {
                sectionIndex === 0 && (
                  <div className='flex justify-center'>
                    <button className='std-button-lite flex items-center justify-center gap-2' onClick={() => handleAddSection(0)}>
                      <FontAwesomeIcon icon={faPlus} />
                      Section
                    </button>
                  </div>
                )
              }
              <StudyPlanTemplateSection index={sectionIndex} sections={sections} setSections={setSections} />
              <div className='flex justify-center'>
                <button className='std-button-lite flex items-center justify-center gap-2' onClick={() => handleAddSection(sectionIndex+1)}>
                  <FontAwesomeIcon icon={faPlus} />
                  Section
                </button>
              </div>
            </div>
          )}
          </>
          :
          <>
          <div className='flex justify-center'>
            <button className='std-button-lite flex items-center justify-center gap-2' onClick={() => handleAddSection(0)}>
              <FontAwesomeIcon icon={faPlus} />
              Section
            </button>
          </div>
          </>
        }
      </div>
    </>
  );

}