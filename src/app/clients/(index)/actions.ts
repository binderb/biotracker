'use server';

import { db } from '@/db';
import { clients } from '@/db/schema_clientModule';
import { revalidatePath } from 'next/cache';

export async function generateClientCode() {
  try {
    const clients = await db.query.clients.findMany();
    const clientCodes = clients.map((client) => client.code);
    const codeSymbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const finalCodeSymbols = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude 'O' and 'I' for last symbol
    let newCode = '';
    while (!newCode) {
      const potentialCode: Array<string> = [];
      for (let i = 0; i < 3; i++) {
        if (i < 2) {
          const randomIndex = Math.floor(Math.random() * codeSymbols.length);
          potentialCode.push(codeSymbols[randomIndex]);
        } else {
          const randomIndex = Math.floor(Math.random() * finalCodeSymbols.length);
          potentialCode.push(finalCodeSymbols[randomIndex]);
        }
      }
      if (!clientCodes.includes(potentialCode.join(''))) newCode = potentialCode.join('');
    }
    return newCode;
  } catch (err: any) {
    throw err;
  }
}

export async function addClient(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;
    const allClients = await db.query.clients.findMany();
    const clientCodes = allClients.map((client) => client.code);
    const clientNames = allClients.map((client) => client.name);
    if (!name || !code) {
      throw new Error('All fields must have a value!');
    }
    if (clientNames.includes(name)) {
      throw new Error('Client already exists! Please choose a different name.');
    }
    if (clientCodes.includes(code)) {
      throw new Error('Provided code is already in use! Please pick or generate a different one.');
    }
    let correctCodeFormat = true;
    const codeSymbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const finalCodeSymbols = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude 'O' and 'I' for last symbol
    if (code.length !== 3) correctCodeFormat = false;
    for (let i=0;i<3;i++) {
      if (i < 2) {
        if (!codeSymbols.includes(code[i])) correctCodeFormat = false;
      } else {
        if (!finalCodeSymbols.includes(code[i])) correctCodeFormat = false;
      }
      
    } 
    if (!correctCodeFormat) {
      throw new Error("Incorrect code format! Codes must be composed of 3 capital letters, and must not end with 'O' or 'I'.");
    }
    await db.insert(clients).values([{
      name: name,
      code: code,
    }]);
    revalidatePath('/clients');
  } catch (err: any) {
    throw err;
  }
}
