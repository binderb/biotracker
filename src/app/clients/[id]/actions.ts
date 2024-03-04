'use server';

import { db } from '@/db';
import { ClientWithAllDetails, ProjectWithAllDetails, clients, clientsToAddresses, clientsToContacts, projects, projectsToContacts } from '@/db/schema_clientModule';
import { eq, inArray, notInArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

type ClientFields = {
  name: string;
  code: string;
  referredBy: number | null;
  website: string | null;
  accountType: 'active' | 'inactive' | null;
};

export async function updateClient(clientId: number, clientData: ClientFields, contactIds: number[], addressIds: number[], projectsList: ProjectWithAllDetails[]) {
  try {
    // Update basic client info.
    await db.update(clients).set(clientData).where(eq(clients.id, clientId));
    // Delete all existing relations for contacts and addresses.
    await db.delete(clientsToContacts).where(eq(clientsToContacts.clientId, clientId));
    await db.delete(clientsToAddresses).where(eq(clientsToAddresses.clientId, clientId));
    // Insert new relations for contacts and addresses.
    if (contactIds.length > 0) {
      await db.insert(clientsToContacts).values(contactIds.map((contactId) => ({ clientId: clientId, contactId: contactId })));
    }
    if (addressIds.length > 0) {
      await db.insert(clientsToAddresses).values(addressIds.map((addressId) => ({ clientId: clientId, addressId: addressId })));
    }
    // Update projects.
    if (projectsList.length > 0) {
      console.log(projectsList);
      // Delete any projects that aren't included in the new list.
      await db.delete(projects).where(
        eq(projects.client, clientId) &&
          notInArray(
            projects.id,
            projectsList.map((project) => project.id)
          )
      );
      // If any projects have been added, insert them (new projects will have id<0).
      if (projectsList.filter(project=>project.id < 0).length > 0) {
        await db.insert(projects).values(
          projectsList
            .filter((project) => project.id < 0)
            .map(({ id, ...project }) => ({
              ...project,
              client: clientId,
            }))
        );
      }
      // Also update any existing projects that are in the new list.
      for (const project of projectsList.filter((project) => project.id > -1)) {
        const { id, contacts, ...projectWithoutId } = project;
        await db.update(projects).set(projectWithoutId).where(eq(projects.id, project.id));
        // Delete all existing relations for project contacts.
        await db.delete(projectsToContacts).where(eq(projectsToContacts.projectId, project.id));
        // Insert new relations for project contacts.
        if (project.contacts && project.contacts.length > 0) {
          await db.insert(projectsToContacts).values(project.contacts.map((joinTableEntry) => ({ projectId: project.id, contactId: joinTableEntry.contact.id })));
        }
      }
    } else {
      // If there are no projects in the new list, delete all projects for this client.
      await db.delete(projects).where(eq(projects.client, clientId));
    }

    revalidatePath(`/clients/${clientId}`);
  } catch (err: any) {
    throw err;
  }
}
