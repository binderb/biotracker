import { FormRevisionWithAllLevels, FormWithAllLevels, formDocTypeEnum } from "@/db/schema_formsModule";

export function encodeText(formContents: FormRevisionWithAllLevels) {
  let text = '';
  for (let section of formContents.sections) {
    text += `<section name="${section.name}"${section.extensible ? ' extensible' : ''}>\n`;
    for (let row of section.rows) {
      text += `  <row${row.extensible ? ' extensible' : ''}>\n`;
      for (let field of row.fields) {
        text += `    <field type="${field.type}">${JSON.stringify(field.params)}</field>\n`;
      }
      text += `  </row>\n`;
    }
    text += `</section>\n`;
  }
  return text;
}

export function getFormID (form:FormWithAllLevels) {
  const docTypes = formDocTypeEnum.enumValues;
  const codes = ['F','SP'];
  return `${codes[docTypes.indexOf(form.docType)]}-${form.functionalArea}-${form.index.toString().padStart(4,'0')}`
}