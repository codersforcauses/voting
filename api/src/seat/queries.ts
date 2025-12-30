import { eq } from "drizzle-orm";
import { db } from "@/db";
import { seatsTable } from "@/db/schema";

export { seatsTable };

export function getSeat(id: number) {
  return db.select().from(seatsTable).where(eq(seatsTable.id, id));
}

export function getSeatByCode(code: string) {
  return db.select().from(seatsTable).where(eq(seatsTable.code, code));
}

export function insertSeat(
  data: Omit<typeof seatsTable.$inferInsert, "id">
) {
  return db.insert(seatsTable).values(data).returning();
}

export function deleteSeat(id: number) {
  return db.delete(seatsTable).where(eq(seatsTable.id, id)).returning();
}
