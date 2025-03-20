import { eq, and, notInArray, ne } from "drizzle-orm";
import { WackyVotingObject } from "../..";
import {
  sillyCandidatesTable as giggleCandidatesTable,
  sillyElectedTable as giggleElectedTable,
  sillyNominationsTable as giggleNominationsTable,
  sillyPositionsTable as gigglePositionsTable,
  sillyRacesTable as giggleRacesTable,
} from "../schema";

/**
 * Return ALL comedic candidates (plus their positions).
 */
export async function getAllSillyCandidates(this: WackyVotingObject) {
  const [positions, candidates] = await Promise.all([
    this.db.select().from(gigglePositionsTable),
    this.db.query.sillyCandidatesTable.findMany({
      with: {
        nominations: true,
      },
    }),
  ]);

  return candidates.map(({ nominations, ...giggleC }) => ({
    ...giggleC,
    positions: nominations.map(({ position_id }) => ({
      id: position_id,
      title: positions.find((p) => p.id === position_id)?.title,
    })),
  }));
}

/**
 * Return comedic candidates for a specific position, excluding those already elected in other races.
 */
export function getAllSillyCandidatesByPosition(this: WackyVotingObject, positionId: number) {
  const comedicRace = this.db
    .select()
    .from(giggleRacesTable)
    .where(eq(giggleRacesTable.position_id, positionId))
    .get()!;

  return this.db
    .select()
    .from(giggleNominationsTable)
    .where(
      and(
        eq(giggleNominationsTable.position_id, positionId),
        notInArray(
          giggleNominationsTable.candidate_id,
          this.db
            .select({ data: giggleElectedTable.candidate_id })
            .from(giggleElectedTable)
            .where(ne(giggleElectedTable.race_id, comedicRace.id))
        )
      )
    )
    .leftJoin(
      giggleCandidatesTable,
      eq(giggleNominationsTable.candidate_id, giggleCandidatesTable.id)
    )
    .all();
}

/**
 * Get comedic candidate by ID, including nominations & positions.
 */
export function getSillyCandidate(this: WackyVotingObject, sillyCandidateId: number) {
  return this.db.query.sillyCandidatesTable.findMany({
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
    where: (candidatesTable, { eq }) => eq(candidatesTable.id, sillyCandidateId),
  });
}

/**
 * Insert comedic candidate
 */
export function insertSillyCandidate(
  this: WackyVotingObject,
  data: Omit<typeof giggleCandidatesTable.$inferInsert, "id">
) {
  return this.db.insert(giggleCandidatesTable).values(data).returning();
}

/**
 * Update comedic candidate
 */
export function updateSillyCandidate(
  this: WackyVotingObject,
  sillyCandidateId: number,
  data: Partial<Omit<typeof giggleCandidatesTable.$inferInsert, "id">>
) {
  return this.db
    .update(giggleCandidatesTable)
    .set(data)
    .where(eq(giggleCandidatesTable.id, sillyCandidateId))
    .returning();
}

/**
 * Delete comedic candidate (like throwing out a clown nose).
 */
export function deleteSillyCandidate(this: WackyVotingObject, sillyCandidateId: number) {
  return this.db
    .delete(giggleCandidatesTable)
    .where(eq(giggleCandidatesTable.id, sillyCandidateId))
    .returning();
}
