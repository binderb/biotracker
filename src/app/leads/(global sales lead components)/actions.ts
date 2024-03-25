"use server";

import { db } from "@/db";
import { Quote, quotes } from "@/db/schema_quotesModule";
import { and, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addQuote(newQuote: Quote) {
  try {
    if (!newQuote.link) throw new Error("Every quote must have a link!");
    const index = (await db
      .select({ value: max(quotes.index) })
      .from(quotes)
      .where(eq(quotes.client, newQuote.client))) as { value: number }[];
    await db
      .insert(quotes)
      .values({
        link: newQuote.link,
        saleslead: newQuote.saleslead,
        client: newQuote.client,
        project: newQuote.project,
        index: index[0].value + 1,
      })
      .returning();
    revalidatePath(`/leads/${newQuote.saleslead}`);
  } catch (err: any) {
    throw err;
  }
}
