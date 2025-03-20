import { and, eq, notInArray } from "drizzle-orm";
import { WackyVotingObject } from "..";
import { sillyElectedTable as giggleElectedTable, sillyNominationsTable as giggleNominationsTable } from "../schema";

/**
 * Return all comedic nominations (like a big clown car).
 */
export function getAllClownNominations(this: WackyVotingObject) {
  return this.db.select().from(giggleNominationsTable);
}

/**
 * Retrieve comedic nominations for a certain position.
 */
export function getNominationsForSillyPosition(
  this: WackyVotingObject,
  sillyPositionId: number
) {
  return this.db
    .select()
    .from(giggleNominationsTable)
    .where(eq(giggleNominationsTable.position_id, sillyPositionId));
}

/**
 * Retrieve comedic nominations by candidate ID
 */
export function getNominationsForSillyCandidate(
  this: WackyVotingObject,
  sillyCandidateId: number
) {
  return this.db
    .select()
    .from(giggleNominationsTable)
    .where(eq(giggleNominationsTable.candidate_id, sillyCandidateId));
}

/**
 * Insert comedic nomination
 */
export function insertSillyNomination(
  this: WackyVotingObject,
  data: typeof giggleNominationsTable.$inferInsert
) {
  return this.db.insert(giggleNominationsTable).values(data).returning();
}

/**
 * Delete comedic nomination for a candidate & position
 */
export function deleteSillyNomination(
  this: WackyVotingObject,
  sillyCandidateId: number,
  sillyPositionId: number
) {
  return this.db
    .delete(giggleNominationsTable)
    .where(
      and(
        eq(giggleNominationsTable.candidate_id, sillyCandidateId),
        eq(giggleNominationsTable.position_id, sillyPositionId)
      )
    )
    .returning();
}
