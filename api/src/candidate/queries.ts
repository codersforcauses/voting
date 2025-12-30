import { eq, and, notInArray, ne } from "drizzle-orm";
import { db } from "@/db";
import { candidatesTable, nominationsTable, electedTable, racesTable } from "@/db/schema";

export async function getAllCandidates() {
  return db.query.candidatesTable.findMany({
    with: {
      nominations: {
        columns: {},
        with: {
          positions: {
            columns: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });
}

export function getAllCandidatesByPosition(id: number) {
  const race = db
    .select()
    .from(racesTable)
    .where(eq(racesTable.position_id, id))
    .get()!;

  return db
    .select()
    .from(nominationsTable)
    .where(
      and(
        eq(nominationsTable.position_id, id),
        notInArray(
          nominationsTable.candidate_id,
          db
            .select({ data: electedTable.candidate_id })
            .from(electedTable)
            .where(ne(electedTable.race_id, race.id))
        )
      )
    )
    .leftJoin(
      candidatesTable,
      eq(nominationsTable.candidate_id, candidatesTable.id)
    )
    .all();
}

export function getCandidate(id: number) {
  return db.query.candidatesTable.findMany({
    with: {
      nominations: {
        columns: {},
        with: {
          positions: {
            columns: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    where: (candidatesTable, { eq }) => eq(candidatesTable.id, id),
  });
}

export function insertCandidate(
  data: Omit<typeof candidatesTable.$inferInsert, "id">
) {
  return db.insert(candidatesTable).values(data).returning();
}

export function updateCandidate(
  id: number,
  data: Partial<Omit<typeof candidatesTable.$inferInsert, "id">>
) {
  return db
    .update(candidatesTable)
    .set(data)
    .where(eq(candidatesTable.id, id))
    .returning();
}

export function deleteCandidate(id: number) {
  return db
    .delete(candidatesTable)
    .where(eq(candidatesTable.id, id))
    .returning();
}
