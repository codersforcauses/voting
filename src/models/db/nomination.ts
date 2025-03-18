import { and, eq } from "drizzle-orm";
import { VotingObject } from "..";
import { nominationsTable } from "../schema";

// Not sure if this is required since it's just all candidates
export function getAllNominations(this: VotingObject) {
  return this.db.select().from(nominationsTable);
}

export function getNominationsForPosition(
  this: VotingObject,
  position_id: number
) {
  return this.db
    .select()
    .from(nominationsTable)
    .where(eq(nominationsTable.position_id, position_id));
}

export function insertNomination(
  this: VotingObject,
  data: typeof nominationsTable.$inferInsert
) {
  return this.db.insert(nominationsTable).values(data).returning();
}

export function deleteNomination(
  this: VotingObject,
  candidate_id: number,
  position_id: number
) {
  return this.db
    .delete(nominationsTable)
    .where(
      and(
        eq(nominationsTable.candidate_id, candidate_id),
        eq(nominationsTable.position_id, position_id)
      )
    )
    .returning();
}
