'use server';

import { db } from '@/db';
import { Address, Contact, addresses, contacts } from '@/db/schema_clientModule';
import { asc, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getAddresses() {
  const response = await db.query.addresses.findMany({orderBy:[desc(addresses.entityName)]});
  return response;
}

export async function addAddress(formData: FormData) {
  try {
    const data = Object.fromEntries(formData) as unknown as Address;
    if (!data.identifier) throw new Error('You must include a label for internal use!');
    console.log(data);
    const response = await db.insert(addresses).values(data).returning();
    const newAddress = response[0] || null;
    console.log(newAddress);
    return newAddress;
  } catch (err: any) {
    throw err;
  }
}

export async function updateAddress(formData: FormData) {
  try {
    const data = Object.fromEntries(formData) as unknown as Address;
    if (!data.identifier) throw new Error('You must include a label for internal use!');
    const {id:addressId, ...updateFields} = data;
    const response = await db.update(addresses).set(updateFields).where(eq(addresses.id,addressId)).returning();
    const updatedAddress = response[0] || null;
    return updatedAddress;
  } catch (err: any) {
    throw err;
  }
}

export async function getContacts() {
  const response = await db.query.contacts.findMany({orderBy:[desc(contacts.last),desc(contacts.first)]});
  return response;
}

export async function addContact(formData: FormData) {
  try {
    const data = Object.fromEntries(formData) as unknown as Contact;
    console.log('new contact data: ',data);
    if (!data.first || !data.last) throw new Error('You must include a first and last name!');
    const response = await db.insert(contacts).values(data).returning();
    const newContact = response[0] || null;
    console.log(newContact);
    return newContact;
  } catch (err: any) {
    throw err;
  }
}

export async function updateContact(formData: FormData) {
  try {
    const data = Object.fromEntries(formData) as unknown as Contact;
    console.log(data);
    if (!data.first || !data.last) throw new Error('You must include a first and last name!');
    const {id:contactId, ...updateFields} = data;
    const response = await db.update(contacts).set(updateFields).where(eq(contacts.id,contactId)).returning();
    const updatedContact = response[0] || null;
    return updatedContact;
  } catch (err: any) {
    throw err;
  }
}
