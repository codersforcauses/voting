import { eq } from "drizzle-orm";
import { VotingObject } from "../..";
import {
  candidatesTable,
  nominationsTable,
  positionsTable,
  racesTable,
} from "../schema";

export async function getAllCandidates(this: VotingObject) {
  const [positions, candidates] = await Promise.all([
    this.db.select().from(positionsTable),
    this.db.query.candidatesTable.findMany({
      with: {
        nominations: true,
      },
    }),
  ]);

  return candidates.map(({ nominations, ...candidate }) => ({
    ...candidate,
    positions: nominations.map(({ position_id }) => ({
      id: position_id,
      title: positions.find((p) => p.id === position_id)?.title,
    })),
  }));
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
