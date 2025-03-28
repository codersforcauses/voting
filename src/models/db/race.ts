import { eq, ne } from "drizzle-orm";
import { VotingObject } from "..";
import { positionsTable, racesTable } from "../schema";
import { autocount } from "@/lib/election-system";

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
    .leftJoin(positionsTable, eq(racesTable.position_id, positionsTable.id))
    .get();
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
  const updatedRace = this.db
    .update(racesTable)
    .set({
      current: true,
      status: data.status,
      tally: data.tally
    })
    .where(eq(racesTable.id, id)).returning().get();

  this.db
    .update(racesTable)
    .set({ current: false })
    .where(ne(racesTable.id, id)).returning().all();

  this.broadcast(JSON.stringify({
    race_id: updatedRace.id,
    status: updatedRace.status
  }))

  if (data.status === "finished") {
    const elected = this.getElectedForRace(id)
    if (elected.length === 0) this.saveElectedForRace(updatedRace.id)
  }

  return updatedRace
}

export function saveElectedForRace(
  this: VotingObject,
  id: number,
) {
  const race = this.db.select().from(racesTable).where(eq(racesTable.id, id)).get()!
  const position = this.db.select().from(positionsTable).where(eq(positionsTable.id, race.position_id)).get()!
  const raceData = this.getVoteAggregateForRace(id)
  if (Object.keys(raceData).length === 0) {
    // No voting data, do not calculate elected
    return []
  }
  const formattedData = Object.keys(raceData).reduce<Record<string, number[]>>((acc, curr) => {
    if (!acc[curr]) acc[curr] = []
    if (raceData[curr]) acc[curr] = raceData[curr].preferences.sort((a, b) => a.preference - b.preference).map(pref => pref.candidate_id)
    return acc
  }, {})

  const res = autocount(formattedData, position.openings)

  const tally_shallow = [...res.tally.entries()].map(([key, map]) => [key, [...map]])
  this.updateRace(id, {tally: JSON.stringify(tally_shallow)});
  
  return this.insertElected(res.candidates.map(candidate => ({
    candidate_id: candidate,
    race_id: id
  }))).all()
}

export function deleteRace(this: VotingObject, id: number) {
  return this.db.delete(racesTable).where(eq(racesTable.id, id)).returning();
}
