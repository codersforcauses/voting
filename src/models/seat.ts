import { eq } from "drizzle-orm";
import { VotingObject } from "..";
import { seatTable } from "./schema";

export function getSeat(this: VotingObject, id: number) {
  return this.db.select().from(seatTable).where(eq(seatTable.id, id));
}

export function insertSeat(
  this: VotingObject,
  data: Omit<typeof seatTable.$inferInsert, "id">
) {
  this.db.insert(seatTable).values(data);
}
