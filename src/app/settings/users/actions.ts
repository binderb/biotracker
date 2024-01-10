'use server';

import { db } from "@/db";
import { users } from "@/db/schema_usersModule";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from 'bcrypt';

export async function addUser (formData:FormData) {
  if (!formData.get('first')) {
    throw new Error('Please provide a first name!');
  }
  if (!formData.get('last')) {
    throw new Error('Please provide a last name!');
  }
  if (!formData.get('username')) {
    throw new Error('Please provide a username!');
  }

  const user = await db.insert(users).values({
    first: formData.get('first') as string,
    last: formData.get('last') as string,
    password: formData.get('password') as string,
    username: formData.get('username') as string,
    role: formData.get('role') as string,
  }).returning();
  revalidatePath('/settings/users');
  return user;
}

export async function updateUser (formData:FormData, userId:number) {
  if (!formData.get('first')) {
    throw new Error('Please provide a first name!');
  }
  if (!formData.get('last')) {
    throw new Error('Please provide a last name!');
  }
  if (!formData.get('username')) {
    throw new Error('Please provide a username!');
  }

  const user = await db.update(users).set({
    first: formData.get('first') as string,
    last: formData.get('last') as string,
    password: await bcrypt.hash(formData.get('password') as string || '', 10),
    username: formData.get('username') as string,
    role: formData.get('role') as string,
  }).where(eq(users.id, userId)).returning();
  revalidatePath('/settings/users');
  return user;
}