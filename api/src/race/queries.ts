import { eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { racesTable, positionsTable } from "@/db/schema";
import { autocount } from "@/shared/lib/election-system";

export { racesTable };

export function getRace(id: number) {
  return db.select().from(racesTable).where(eq(racesTable.id, id));
}

export function getAllRaces() {
  return db
    .select()
    .from(racesTable)
    .leftJoin(positionsTable, eq(racesTable.position_id, positionsTable.id));
}

export function getCurrentRace() {
  return db
    .select()
    .from(racesTable)
    .where(eq(racesTable.current, true))
    .leftJoin(positionsTable, eq(racesTable.position_id, positionsTable.id))
    .get();
}

export function insertRace(
  data: Omit<typeof racesTable.$inferInsert, "id">
) {
  return db.insert(racesTable).values(data).returning();
}

export async function updateRace(
  id: number,
  data: Partial<Omit<typeof racesTable.$inferInsert, "id">>,
  broadcast?: (message: string) => void
) {
  const updatedRace = db
    .update(racesTable)
    .set({
      current: true,
      status: data.status,
      tally: data.tally
    })
    .where(eq(racesTable.id, id)).returning().get();

  db
    .update(racesTable)
    .set({ current: false })
    .where(ne(racesTable.id, id)).returning().all();

  if (broadcast) {
    broadcast(JSON.stringify({
      race_id: updatedRace.id,
      status: updatedRace.status
    }))
  }

  if (data.status === "finished") {
    const { getElectedForRace } = await import("@/elected/queries");
    const elected = getElectedForRace(id)
    if (elected.length === 0) saveElectedForRace(updatedRace.id)
  }

  return updatedRace
}

export function saveElectedForRace(
  id: number,
) {
  const race = db.select().from(racesTable).where(eq(racesTable.id, id)).get()!
  const position = db.select().from(positionsTable).where(eq(positionsTable.id, race.position_id)).get()!
  const { getVoteAggregateForRace } = require("@/vote/query");
  const raceData = getVoteAggregateForRace(id)
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
  updateRace(id, {tally: JSON.stringify(tally_shallow)});

  const { insertElected } = require("@/elected/query");
  return insertElected(res.candidates.map(candidate => ({
    candidate_id: candidate,
    race_id: id
  }))).all()
}

export function deleteRace(id: number) {
  return db.delete(racesTable).where(eq(racesTable.id, id)).returning();
}
