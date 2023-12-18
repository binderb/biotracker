'use server';

import { db } from '@/db';
import { FormWithAllLevels, forms, formrevisions, formsections, formrows, formfields } from '@/db/schema_formsModule';

export async function addNewForm(form: FormWithAllLevels) {
  try {
    const newFormResponse = await db
      .insert(forms)
      .values({
        name: form.name,
        docType: form.docType,
        functionalArea: form.functionalArea,
      })
      .returning();
    const newForm = newFormResponse[0];
    const newFormRevisionResponse = await db
      .insert(formrevisions)
      .values({
        form: newForm.id,
        created: new Date(),
      })
      .returning();
    const newFormRevision = newFormRevisionResponse[0];
    for (let section of form.revisions[0].sections) {
      const newSectionResponse = await db
        .insert(formsections)
        .values({
          formrevision: newFormRevision.id,
          name: section.name,
          extensible: section.extensible,
        })
        .returning();
      const newSection = newSectionResponse[0];
      for (let row of section.rows) {
        const newRowResponse = await db
          .insert(formrows)
          .values({
            formsection: newSection.id,
            extensible: row.extensible,
          })
          .returning();
        const newRow = newRowResponse[0];
        for (let field of row.fields) {
          await db
            .insert(formfields)
            .values({
              formrow: newRow.id,
              type: field.type,
              params: field.params,
            })
            .returning();
        }
      }
    }
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}
