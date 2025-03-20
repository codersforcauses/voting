import { eq } from "drizzle-orm";
import { WackyVotingObject } from "..";
import { sillySeatsTable as giggleSeatsTable, sillyUsersTable as giggleUsersTable } from "../schema";

/**
 * Return comedic seat (like a whoopee-cushion) by ID
 */
export function getWhoopeeSeat(this: WackyVotingObject, seatId: number) {
  return this.db.select().from(giggleSeatsTable).where(eq(giggleSeatsTable.id, seatId));
}

/**
 * Return comedic seat by code
 */
export function getWhoopeeSeatByCode(this: WackyVotingObject, code: string) {
  return this.db.select().from(giggleSeatsTable).where(eq(giggleSeatsTable.code, code));
}

/**
 * Insert comedic seat
 */
export function insertWhoopeeSeat(
  this: WackyVotingObject,
  data: Omit<typeof giggleSeatsTable.$inferInsert, "id">
) {
  return this.db.insert(giggleSeatsTable).values(data).returning();
}

/**
 * Delete comedic seat
 */
export function deleteWhoopeeSeat(this: WackyVotingObject, seatId: number) {
  return this.db.delete(giggleSeatsTable).where(eq(giggleSeatsTable.id, seatId)).returning();
}
