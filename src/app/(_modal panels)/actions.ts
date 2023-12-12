'use server';

import { db } from '@/db';
import { Address, addresses } from '@/db/schema';
import { revalidatePath } from 'next/cache';

export async function getAddresses() {
  const addresses = await db.query.addresses.findMany();
  return addresses;
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
