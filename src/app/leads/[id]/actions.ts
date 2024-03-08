'use server';

import { db } from '@/db';
import { SalesLeadWithAllDetails, leads, salesformshape, salesleadformdata, salesleadnotes, salesleadrevisions, salesleadrevisionsToFormrevisions } from '@/db/schema_salesleadsModule';
import { and, eq, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function addBareNote(leadDetails: SalesLeadWithAllDetails, note: string, author: number) {
  // Create a new note
  const newNote = await db
    .insert(salesleadnotes)
    .values({
      author,
      saleslead: leadDetails.id,
      salesleadrevision: leadDetails.revisions[leadDetails.revisions.length - 1].id,
      note,
      newRevision: false,
      created: new Date(),
    })
    .returning();
  revalidatePath(`/leads/${leadDetails.id}`);
}

export async function addSalesLeadRevision(leadDetails: SalesLeadWithAllDetails, note: string, author: number) {
  if (!leadDetails.client) {
    throw new Error('Please pick a client!');
  }
  if (!leadDetails.project) {
    throw new Error('Please pick a project to categorize your new sales lead!');
  }
  if (!leadDetails.name) {
    throw new Error('Please provide a sales lead name!');
  }
  if (leadDetails.revisions[0].studyplans.length === 0) {
    throw new Error('Please add at least one study plan!');
  }
  if (leadDetails.status === 'Won' && !leadDetails.quote) {
    throw new Error('Please provide a quote reference for sales leads marked as won!');
  }
  if (!leadDetails.status) {
    throw new Error('Please provide a status for the sales lead!');
  }
  const existingName = await db.query.leads.findFirst({ where: and(eq(leads.name, leadDetails.name), ne(leads.id, leadDetails.id)) });
  if (existingName) {
    throw new Error(`Another sales lead with the name ${leadDetails.name} already exists! Please choose a different name.`);
  }
  // update the sales lead
  const updateResponse = await db
    .update(leads)
    .set({
      name: leadDetails.name,
      status: leadDetails.status,
      client: leadDetails.client.id,
      project: leadDetails.project.id,
      // repository: leadDetails.repository,
    })
    .where(eq(leads.id, leadDetails.id))
    .returning();
  // Create a new revision
  const newRevisionResponse = await db
    .insert(salesleadrevisions)
    .values({
      author,
      saleslead: leadDetails.id,
      created: new Date(),
    })
    .returning();
  // create join relations between the new sales lead revision and the study plans
  for (const studyPlan of leadDetails.revisions[0].studyplans) {
    await db.insert(salesleadrevisionsToFormrevisions).values({
      salesleadrevision: newRevisionResponse[0].id,
      formrevision: studyPlan.formrevision.id,
    });
  }
  // create a salesformshape for each study plan in the new revision
  for (let i=0;i<leadDetails.revisions[0].studyplans.length;i++) {
    await db.insert(salesformshape).values({
      studyplanrevision: leadDetails.revisions[0].studyplans[i].formrevision.id,
      salesleadrevision: newRevisionResponse[0].id,
      formshape: leadDetails.revisions[0].studyplanshapes[i].formshape,
    });
  }
  // for each form field in each study plan, create a sales lead form data entry
  for (const studyPlan of leadDetails.revisions[0].studyplans) {
    for (const section of studyPlan.formrevision.sections) {
      for (const row of section.rows) {
        for (const field of row.fields) {
          for (const formdata of field.salesleadformdata) {
            await db.insert(salesleadformdata).values({
              salesleadrevision: newRevisionResponse[0].id,
              formfield: field.id,
              value: formdata.value,
              sectionShapeIndex: formdata.sectionShapeIndex,
            });
          }
        }
      }
    }
  }
  // Create a new note
  const newNote = await db
    .insert(salesleadnotes)
    .values({
      author,
      saleslead: leadDetails.id,
      salesleadrevision: newRevisionResponse[0].id,
      note,
      newRevision: true,
      created: new Date(),
    })
    .returning();
  revalidatePath(`/leads/${leadDetails.id}`);
}
