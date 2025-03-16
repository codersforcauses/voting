import { eq } from "drizzle-orm";
import { VotingObject } from "..";
import { seatTable, usersTable } from "../schema";

export function getSeat(this: VotingObject, id: number) {
  return this.db.select().from(seatTable).where(eq(seatTable.id, id));
}

export function getSeatByCode(this: VotingObject, code: string) {
  return this.db.select().from(seatTable).where(eq(seatTable.code, code));
}

// TODO
export async function checkSeatIfUsed(this: VotingObject, id: number) {
  const [user] = await this.db
    .select()
    .from(usersTable)
    .where(eq(usersTable.seat_id, id));
  console.log(user);
  return !!user;
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
