import { eq } from "drizzle-orm";
import { VotingObject } from "..";
import { votesTable } from "./schema";

export function getAllVotes(this: VotingObject) {
  return this.db.select().from(votesTable);
}

export function getVote(this: VotingObject, id: number) {
  return this.db.select().from(votesTable).where(eq(votesTable.id, id));
}

export function insertVote(
  this: VotingObject,
  data: Omit<typeof votesTable.$inferInsert, "id">
) {
  this.db.insert(votesTable).values(data);
}

export function updateVote(
  this: VotingObject,
  id: number,
  data: Partial<Omit<typeof votesTable.$inferInsert, "id">>
) {
  this.db.update(votesTable).set(data).where(eq(votesTable.id, id));
}

export function deleteVote(this: VotingObject, id: number) {
  this.db.delete(votesTable).where(eq(votesTable.id, id));
}
