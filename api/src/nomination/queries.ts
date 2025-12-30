import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { nominationsTable } from "@/db/schema";

export { nominationsTable };

// Not sure if this is required since it's just all candidates
export function getAllNominations() {
  return db.select().from(nominationsTable);
}

export function getNominationsForPosition(
  position_id: number
) {
  return db
    .select()
    .from(nominationsTable)
    .where(eq(nominationsTable.position_id, position_id));
}

export function getNominationsForCandidate(
  candidate_id: number
) {
  return db
    .select()
    .from(nominationsTable)
    .where(eq(nominationsTable.candidate_id, candidate_id));
}

export function insertNomination(
  data: typeof nominationsTable.$inferInsert
) {
  return db.insert(nominationsTable).values(data).returning();
}

export function deleteNomination(
  candidate_id: number,
  position_id: number
) {
  return db
    .delete(nominationsTable)
    .where(
      and(
        eq(nominationsTable.candidate_id, candidate_id),
        eq(nominationsTable.position_id, position_id)
      )
    )
    .returning();
}
