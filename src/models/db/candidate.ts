import { eq } from "drizzle-orm";
import { VotingObject } from "../..";
import {
  candidatesTable,
  nominationsTable,
  positionsTable,
  racesTable,
} from "../schema";

export function getAllCandidates(this: VotingObject) {
  return this.db.query.candidatesTable.findMany({
    with: {
      nominations: true,
    },
  });
}

export function getAllCandidatesByPosition(this: VotingObject, id: number) {
  return this.db
    .select()
    .from(nominationsTable)
    .where(eq(nominationsTable.position_id, id))
    .leftJoin(
      candidatesTable,
      eq(nominationsTable.candidate_id, candidatesTable.id)
    );
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
