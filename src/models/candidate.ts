import { eq } from "drizzle-orm";
import { VotingObject } from "..";
import { candidatesTable } from "./schema";

export function getAllCandidates(this: VotingObject) {
  return this.db.select().from(candidatesTable);
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
  this.db.insert(candidatesTable).values(data);
}

export function updateCandidate(
  this: VotingObject,
  id: number,
  data: Partial<Omit<typeof candidatesTable.$inferInsert, "id">>
) {
  this.db.update(candidatesTable).set(data).where(eq(candidatesTable.id, id));
}

export function deleteCandidate(this: VotingObject, id: number) {
  this.db.delete(candidatesTable).where(eq(candidatesTable.id, id));
}
