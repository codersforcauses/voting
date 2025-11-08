import { eq } from "drizzle-orm";
import { VotingObject } from "..";
import { seatsTable, usersTable } from "../schema";

export function getSeat(this: VotingObject, id: number) {
  return this.db.select().from(seatsTable).where(eq(seatsTable.id, id));
}

export function getSeatByCode(this: VotingObject, code: string) {
  return this.db.select().from(seatsTable).where(eq(seatsTable.code, code));
}

export function insertSeat(
  this: VotingObject,
  data: Omit<typeof seatsTable.$inferInsert, "id">
) {
  return this.db.insert(seatsTable).values(data).returning();
}

export function deleteSeat(this: VotingObject, id: number) {
  return this.db.delete(seatsTable).where(eq(seatsTable.id, id)).returning();
}
