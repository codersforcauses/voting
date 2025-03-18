import { eq } from "drizzle-orm";
import { VotingObject } from "../..";
import { racesTable, votesTable } from "../schema";

export function getAllVotesForRace(this: VotingObject, race: number) {
  return this.db.select().from(votesTable).where(eq(racesTable.id, race));
}

export function getVote(this: VotingObject, id: number) {
  return this.db.select().from(votesTable).where(eq(votesTable.id, id));
}

export function insertVote(
  this: VotingObject,
  data: Omit<typeof votesTable.$inferInsert, "id">
) {
  return this.db.insert(votesTable).values(data).returning();
}

export function updateVote(
  this: VotingObject,
  id: number,
  data: Partial<Omit<typeof votesTable.$inferInsert, "id">>
) {
  return this.db
    .update(votesTable)
    .set(data)
    .where(eq(votesTable.id, id))
    .returning();
}

// export function getFancyVoteGroup(this: VotingObject, race: number) {
//   return this.db.select().from(votesTable).leftJoin()


// }

export function deleteVote(this: VotingObject, id: number) {
  return this.db.delete(votesTable).where(eq(votesTable.id, id)).returning();
}
