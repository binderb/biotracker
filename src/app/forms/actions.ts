'use server';

import { db } from '@/db';
import { FormWithAllLevels, forms, formrevisions, formsections, formrows, formfields } from '@/db/schema_formsModule';
import { and, eq, max, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function addNewForm(form: FormWithAllLevels) {
  try {
    const index = await db
      .select({ value: max(forms.index) })
      .from(forms)
      .where(and(eq(forms.docType, form.docType),eq(forms.functionalArea, form.functionalArea))) as { value: number }[];
    const newFormResponse = await db
      .insert(forms)
      .values({
        name: form.name,
        docType: form.docType,
        functionalArea: form.functionalArea,
        index: index[0].value + 1,
      })
      .returning();
    const newForm = newFormResponse[0];
    const newFormRevisionResponse = await db
      .insert(formrevisions)
      .values({
        form: newForm.id,
        created: new Date(),
        note: form.revisions[0].note,
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

export async function addFormRevision(form: FormWithAllLevels) {
  if (!form.name) {
    throw new Error('The name field must not be blank!');
  }
  if (!form.functionalArea) {
    throw new Error('Please pick a functional area!');
  }
  const existingName = await db.query.forms.findFirst({ where: and(eq(forms.name, form.name), ne(forms.id, form.id)) });
  if (existingName) {
    throw new Error(`Another form with the name ${form.name} already exists! Please choose a different name.`);
  }
  // Update the form
  const updateResponse = await db
    .update(forms)
    .set({
      name: form.name,
      functionalArea: form.functionalArea,
    })
    .where(eq(forms.id, form.id))
    .returning();
  // Create a new revision
  const newFormRevisionResponse = await db
    .insert(formrevisions)
    .values({
      form: form.id,
      created: new Date(),
      note: form.revisions[0].note,
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
  revalidatePath(`/forms/${form.id}`);
}
