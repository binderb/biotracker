'use server';

import { db } from "@/db";
import { projects } from "@/db/schema_clientModule";
import { NewSalesLead, SalesLeadWithAllDetails, salesleadformdata, salesleadrevisions, salesleadrevisionsToFormrevisions, leads } from "@/db/schema_salesleadsModule";
import { usersToSalesleadcontributors } from "@/db/schema_usersModule";
import { eq } from "drizzle-orm";

export async function getProjectsForClient(clientId:number) {
  const clientProjects = await db.query.projects.findMany({
    where: eq(projects.client, clientId),
    with: {
      contacts: {
        columns: {},
        with: {
          contact: true
        }
      }
    }
  })

  return clientProjects;
}

export async function addSalesLead(salesLead:SalesLeadWithAllDetails) {
  try {
    if (!salesLead.client) {
      throw new Error('Please pick a client!');
    }
    if (!salesLead.project) {
      throw new Error('Please pick a project to categorize your new sales lead!');
    }
    if (!salesLead.name) {
      throw new Error('Please provide a sales lead name!');
    }
    if (salesLead.revisions[0].studyplans.length === 0) {
      throw new Error('Please add at least one study plan!');
    }
    // create sales lead
    const fullName = salesLead.name.trim();
    const existingName = await db.query.leads.findFirst({where: eq(leads.name, fullName)});
    if (existingName) {
      throw new Error(`A sales lead with the name ${fullName} already exists! Please choose a different name.`);
    }
    const newSalesLeadResponse = await db.insert(leads).values({
      name: fullName,
      created: new Date(),
      author: salesLead.author.id,
      status: salesLead.status,
      client: salesLead.client.id,
      project: salesLead.project.id,
    }).returning();
    const newSalesLead = newSalesLeadResponse[0];
    // create sales lead contributors
    for (const joinTableEntry of salesLead.contributors) {
      await db.insert(usersToSalesleadcontributors).values({
        contributor: joinTableEntry.contributor.id,
        saleslead: newSalesLead.id,
      });
    }
    // create sales lead revision
    const newRevisionResponse = await db.insert(salesleadrevisions).values({
      author: salesLead.author.id,
      saleslead: newSalesLead.id,
      created: new Date(),
    }).returning();
    // create join relations between the new sales lead revision and the study plans
    for (const studyPlan of salesLead.revisions[0].studyplans) {
      await db.insert(salesleadrevisionsToFormrevisions).values({
        salesleadrevision: newRevisionResponse[0].id,
        formrevision: studyPlan.formrevision.id,
      });
    }
    // for each form field in each study plan, create an empty sales lead form data entry
    for (const studyPlan of salesLead.revisions[0].studyplans) {
      for (const section of studyPlan.formrevision.sections) {
        for (const row of section.rows) {
          for (const field of row.fields) {
            await db.insert(salesleadformdata).values({
              salesleadrevision: newRevisionResponse[0].id,
              formfield: field.id,
              value: '',
            });
          }
        }
      }
    }
    return {status: 201, data: newSalesLead};
  } catch (error) {
    throw error;
  }
}