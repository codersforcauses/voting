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
  const race = await this.db
    .update(racesTable)
    .set(data)
    .where(eq(racesTable.id, id))
    .returning();

  if (data.status === "finished") {
    
  }

  return race
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

  const res = autocount(formattedData, 2)
  this.updateRace(id, {tally: JSON.stringify(res.tally)});
  
  return this.insertElected(res.candidates.map(candidate => ({
    candidate_id: candidate,
    race_id: id
  })))
}

export function deleteRace(this: VotingObject, id: number) {
  return this.db.delete(racesTable).where(eq(racesTable.id, id)).returning();
}
