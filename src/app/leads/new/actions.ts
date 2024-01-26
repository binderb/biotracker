'use server';

import { db } from '@/db';
import { projects } from '@/db/schema_clientModule';
import { NewSalesLead, SalesLeadWithAllDetails, salesleadformdata, salesleadrevisions, salesleadrevisionsToFormrevisions, leads } from '@/db/schema_salesleadsModule';
import { usersToSalesleadcontributors } from '@/db/schema_usersModule';
import { createDirectoryIfNotExists, getFolderIdFromPath, getGoogleDriveClient } from '@/lib/GoogleDriveFunctions';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getProjectsForClient(clientId: number) {
  const clientProjects = await db.query.projects.findMany({
    where: eq(projects.client, clientId),
    with: {
      contacts: {
        columns: {},
        with: {
          contact: true,
        },
      },
    },
  });

  return clientProjects;
}

export async function addSalesLead(salesLead: SalesLeadWithAllDetails) {
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
    if (salesLead.status === 'Won' && !salesLead.quote) {
      throw new Error('Please provide a quote reference for sales leads marked as won!');
    }
    if (!salesLead.status) {
      throw new Error('Please provide a status for the sales lead!');
    }
    const fullName = salesLead.name.trim();
    const existingName = await db.query.leads.findFirst({ where: eq(leads.name, fullName) });
    if (existingName) {
      throw new Error(`A sales lead with the name ${fullName} already exists! Please choose a different name.`);
    }

    // create sales lead repository in Google Drive
    const googleDrive = await getGoogleDriveClient();
    const repositoryName = `${fullName.replaceAll(' ', '').split(/\(/s)[0]}-${fullName.replaceAll(' ', '-').split(/\((.*)\)$/s)[1]}`;
    console.log('repositoryName', repositoryName);
    const config = await db.query.configs.findFirst();
    if (!config) {
      throw new Error('No configuration object found in database. Please ensure you have connected a Google Drive account.');
    }
    if (!config.salesleadDriveId || !config.salesleadPath) {
      throw new Error('No sales lead drive ID or path found in database. Please ensure you have connected a Google Drive account.');
    }
    const salesLeadFolderId = await getFolderIdFromPath(config.salesleadDriveId, config.salesleadPath, googleDrive);
    const newSalesLeadFolderId = await createDirectoryIfNotExists(repositoryName, salesLeadFolderId, googleDrive);

    // create sales lead
    const newSalesLeadResponse = await db
      .insert(leads)
      .values({
        name: fullName,
        created: new Date(),
        author: salesLead.author.id,
        status: salesLead.status,
        client: salesLead.client.id,
        project: salesLead.project.id,
        repository: newSalesLeadFolderId,
      })
      .returning();
    const newSalesLead = newSalesLeadResponse[0];
    // create sales lead contributors
    for (const joinTableEntry of salesLead.contributors) {
      await db.insert(usersToSalesleadcontributors).values({
        contributor: joinTableEntry.contributor.id,
        saleslead: newSalesLead.id,
      });
    }
    // create sales lead revision
    const newRevisionResponse = await db
      .insert(salesleadrevisions)
      .values({
        author: salesLead.author.id,
        saleslead: newSalesLead.id,
        created: new Date(),
      })
      .returning();
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
            let value:string[] = [];
            if (field.type === 'checkbox') {
              value = ['false'];
            }
            if (field.type === 'multicheckbox') {
              value = [];
              if (Array.isArray(field.params) && field.params.length > 0) {
                for (const param of field.params) {
                  value.push('false');
                }
              }
            }
            await db.insert(salesleadformdata).values({
              salesleadrevision: newRevisionResponse[0].id,
              formfield: field.id,
              value: value,
            });
          }
        }
      }
    }

    revalidatePath('/leads');
    return { status: 201, data: newSalesLead };
  } catch (error) {
    throw error;
  }
}
