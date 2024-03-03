import { FormSectionWithAllLevels, FormRowWithAllLevels, FormField, formfieldTypeEnum, FormRevisionWithAllLevels } from '@/db/schema_formsModule';
import { useState } from 'react';

type Props = {
  text: string,
  setText: (text: string) => void,
  formContents: FormRevisionWithAllLevels,
  setFormContents: (formContents: FormRevisionWithAllLevels) => void,
}

export default function FormTextEditor({ formContents, setFormContents, text, setText }: Props) {

  function parseText(input: string): FormSectionWithAllLevels[] {
    const sectionRegex = /<section.*?>(.*?)<\/section>/gs;
    const rowRegex = /<row.*?>(.*?)<\/row>/gs;
    const fieldRegex = /<field.*?>(.*?)<\/field>/gs;

    function parseSection(sectionMatch: string): FormRowWithAllLevels[] {
      const rows: FormRowWithAllLevels[] = [];
      let rowMatch;

      console.log('section match', sectionMatch);

      while ((rowMatch = rowRegex.exec(sectionMatch)) !== null) {
        const rowContent = rowMatch[1];
        console.log('row content', rowContent);
        const fields: FormField[] = [];

        let fieldMatch;
        while ((fieldMatch = fieldRegex.exec(rowContent)) !== null) {
          console.log('field content', fieldMatch[1]);
          // Build the field object. If the type is not valid, default to label.
          const fieldType = formfieldTypeEnum.enumValues.includes((fieldMatch[0].match(/type="(.*?)"/) ?? ['label'])[1] as FormField['type']) ? ((fieldMatch[0].match(/type="(.*?)"/) ?? [])[1] as FormField['type']) : 'label';
          fields.push({
            id: -1,
            formrow: -1,
            type: fieldType,
            params: parseFieldParams(fieldMatch[1]),
          });
        }

        const rowExtensible = !!(rowMatch[0].match(/<row[^>]*extensible/) ?? [])[0];
        rows.push({
          id: -1,
          formsection: -1,
          fields: fields,
          extensible: rowExtensible,
        });

        fieldRegex.lastIndex = 0;
      }
      return rows;
    }

    const sections: FormSectionWithAllLevels[] = [];
    let match;

    while ((match = sectionRegex.exec(input)) !== null) {
      const sectionContent = match[1];
      // Build the section object. If the name is not valid, default to '(untitled)'.
      const sectionName = (match[0].match(/name="(.*?)"/) ?? [])[1] ?? '(untitled)';
      // Need to modify this line so that the regex checks for <section and extensible on the same line:
      const sectionExtensible = !!(match[0].match(/<section[^>]*extensible/) ?? [])[0];

      sections.push({
        id: -1,
        formrevision: -1,
        name: sectionName,
        rows: parseSection(sectionContent),
        extensible: sectionExtensible,
      });
    }
    console.log('sections', sections)
    return sections;
  }

  function parseFieldParams(input: string) {
    try {
      const parsedData = JSON.parse(input);
      // Ensure the parsed data is an array
      if (Array.isArray(parsedData)) {
        return parsedData;
      } else {
        // If parsed data is not an array, return an empty array
        return [];
      }
    } catch (error) {
      // If an exception occurs during parsing, return an empty array
      return [];
    }
  }

  function handleParseText(text: string) {
    const sections = parseText(text.replace(/[\n\r]/g, ''));
    const newFormContents:FormRevisionWithAllLevels = {
      id: -1,
      form: -1,
      created: new Date(),
      sections: sections,
      note: 'Form created.',
    };
    setFormContents(newFormContents);
  }

  return (
    <>
      <textarea className='std-input font-mono text-[12px] w-full h-[400px] resize-none' placeholder={'<section name="name">\n  <row>\n    <field>\n      ...\n    </field>\n  </row>\n</section>'} value={text} onChange={(e) => {setText(e.target.value); handleParseText(e.target.value)}} />
    </>
  );
}
