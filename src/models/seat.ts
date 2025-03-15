import { eq } from "drizzle-orm";
import { VotingObject } from "..";
import { seatTable } from "./schema";

export function getSeat(this: VotingObject, id: number) {
  return this.db.select().from(seatTable).where(eq(seatTable.id, id));
}

export function getAllSeats(this: VotingObject) {
  return this.db.select().from(seatTable);
}

export function getSeatByCode(this: VotingObject, code: string) {
  return this.db.select().from(seatTable).where(eq(seatTable.code, code));
}

export function insertSeat(
  this: VotingObject,
  data: Omit<typeof seatTable.$inferInsert, "id">
) {
  return this.db.insert(seatTable).values(data).returning();
}

export function deleteSeat(this: VotingObject, id: number) {
  return this.db.delete(seatTable).where(eq(seatTable.id, id)).returning();
}
