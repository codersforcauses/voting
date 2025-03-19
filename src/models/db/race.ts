import { eq } from "drizzle-orm";
import { VotingObject } from "..";
import { positionsTable, racesTable } from "../schema";
import { autocount } from "@/lib/count";

export function getRace(this: VotingObject, id: number) {
  return this.db.select().from(racesTable).where(eq(racesTable.id, id));
}

export function getAllRaces(this: VotingObject) {
  return this.db
    .select()
    .from(racesTable)
    .leftJoin(positionsTable, eq(racesTable.position_id, positionsTable.id));
}

export function getCurrentRace(this: VotingObject) {
  return this.db
    .select()
    .from(racesTable)
    .where(eq(racesTable.current, true))
    .leftJoin(positionsTable, eq(racesTable.position_id, positionsTable.id));
}

export function insertRace(
  this: VotingObject,
  data: Omit<typeof racesTable.$inferInsert, "id">
) {
  return this.db.insert(racesTable).values(data).returning();
}

export async function updateRace(
  this: VotingObject,
  id: number,
  data: Partial<Omit<typeof racesTable.$inferInsert, "id">>
) {
  await this.db
    .update(racesTable)
    .set(data)
    .where(eq(racesTable.id, id));

  const currentRace = this.db.select().from(racesTable).where(eq(racesTable.id, id)).leftJoin(
    positionsTable,
    eq(positionsTable.id, racesTable.position_id)
  ).get()

  if (currentRace) {
    this.broadcast(JSON.stringify({
      race_id: currentRace.race.id,
      status: currentRace.race.status,
      position_id: currentRace.positions?.id,
      title: currentRace.positions?.title,
    }))
  }

  if (data.status === "finished") {
    
  }

  return currentRace
}

export function saveElectedForRace(
  this: VotingObject,
  id: number,
) {
  const raceData = this.getVoteAggregateForRace(id)
  const formattedData = Object.keys(raceData).reduce<Record<string, number[]>>((acc, curr) => {
    if (!acc[curr]) acc[curr] = []
    if (raceData[curr]) acc[curr] = raceData[curr].preferences.sort((a, b) => a.preference - b.preference).map(pref => pref.candidate_id)
    return acc
  }, {})

  const successfulCandidates = autocount(formattedData, 2)
  return this.insertElected(successfulCandidates.map(candidate => ({
    candidate_id: candidate,
    race_id: id
  })))
}

export function deleteRace(this: VotingObject, id: number) {
  return this.db.delete(racesTable).where(eq(racesTable.id, id)).returning();
}
