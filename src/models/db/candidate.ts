import { eq } from "drizzle-orm";
import { VotingObject } from "../..";
import { candidatesTable, racesTable } from "../schema";

export function getAllCandidates(this: VotingObject) {
  return this.db.select().from(candidatesTable);
}

export function getAllCandidatesByRace(this: VotingObject, id: number) {
  return this.db.select().from(candidatesTable).where(eq(racesTable.id, id));
}

export function getCandidate(this: VotingObject, id: number) {
  return this.db
    .select()
    .from(candidatesTable)
    .where(eq(candidatesTable.id, id));
}

export function insertCandidate(
  this: VotingObject,
  data: Omit<typeof candidatesTable.$inferInsert, "id">
) {
  return this.db.insert(candidatesTable).values(data).returning();
}

export function updateCandidate(
  this: VotingObject,
  id: number,
  data: Partial<Omit<typeof candidatesTable.$inferInsert, "id">>
) {
  return this.db
    .update(candidatesTable)
    .set(data)
    .where(eq(candidatesTable.id, id))
    .returning();
}

export function deleteCandidate(this: VotingObject, id: number) {
  return this.db
    .delete(candidatesTable)
    .where(eq(candidatesTable.id, id))
    .returning();
}
