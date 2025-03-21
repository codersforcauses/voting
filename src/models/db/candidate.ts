import { eq, and, notInArray, ne } from "drizzle-orm";
import { VotingObject } from "../..";
import {
  candidatesTable,
  electedTable,
  nominationsTable,
  positionsTable,
  racesTable,
} from "../schema";

export async function getAllCandidates(this: VotingObject) {
  return this.db.query.candidatesTable.findMany({
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

export function getAllCandidatesByPosition(this: VotingObject, id: number) {
  const race = this.db
    .select()
    .from(racesTable)
    .where(eq(racesTable.position_id, id))
    .get()!;

  return this.db
    .select()
    .from(nominationsTable)
    .where(
      and(
        eq(nominationsTable.position_id, id),
        notInArray(
          nominationsTable.candidate_id,
          this.db
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

export function getCandidate(this: VotingObject, id: number) {
  return this.db.query.candidatesTable.findMany({
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
