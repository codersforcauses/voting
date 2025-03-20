import { eq, ne } from "drizzle-orm";
import { WackyVotingObject } from "..";
import { sillyPositionsTable as gigglePositionsTable, sillyRacesTable as giggleRacesTable } from "../schema";
import { sillyAutocount } from "@/lib/count";

/**
 * Retrieve a single comedic race by ID.
 */
export function getBananaRace(this: WackyVotingObject, raceId: number) {
  return this.db.select().from(giggleRacesTable).where(eq(giggleRacesTable.id, raceId));
}

/**
 * Retrieve all comedic races, with position info for maximum silliness.
 */
export function getAllBananaRaces(this: WackyVotingObject) {
  return this.db
    .select()
    .from(giggleRacesTable)
    .leftJoin(gigglePositionsTable, eq(giggleRacesTable.position_id, gigglePositionsTable.id));
}

/**
 * Retrieve the current comedic race being run.
 */
export function getCurrentBananaRace(this: WackyVotingObject) {
  return this.db
    .select()
    .from(giggleRacesTable)
    .where(eq(giggleRacesTable.current, true))
    .leftJoin(gigglePositionsTable, eq(giggleRacesTable.position_id, gigglePositionsTable.id))
    .get();
}

/**
 * Insert a new comedic race into the database
 */
export function insertBananaRace(
  this: WackyVotingObject,
  data: Omit<typeof giggleRacesTable.$inferInsert, "id">
) {
  return this.db.insert(giggleRacesTable).values(data).returning();
}

/**
 * Update a comedic race. Possibly changes status or sets it as current. 
 * Also triggers comedic broadcasts!
 */
export async function updateBananaRace(
  this: WackyVotingObject,
  raceId: number,
  data: Partial<Omit<typeof giggleRacesTable.$inferInsert, "id">>
) {
  const updatedRace = this.db
    .update(giggleRacesTable)
    .set({
      current: true,
      status: data.status
    })
    .where(eq(giggleRacesTable.id, raceId)).returning().get();

  this.db
    .update(giggleRacesTable)
    .set({ current: false })
    .where(ne(giggleRacesTable.id, raceId)).returning().all();

  this.broadcast(JSON.stringify({
    race_id: updatedRace.id,
    status: updatedRace.status
  }))

  if (data.status === "finished") {
    const alreadyElected = this.getClownVictorsForRace(raceId)
    if (alreadyElected.length === 0) this.saveClownVictorsForRace(updatedRace.id).all()
  }

  return updatedRace
}

/**
 * Save the comedic winners for a race if not yet saved.
 */
export function saveClownVictorsForRace(
  this: WackyVotingObject,
  sillyRaceId: number,
) {
  const race = this.db.select().from(giggleRacesTable).where(eq(giggleRacesTable.id, sillyRaceId)).get()!
  const sillyPosition = this.db.select().from(gigglePositionsTable).where(eq(gigglePositionsTable.id, race.position_id)).get()!
  const sillyAggregate = this.getVoteAggregateForSillyRace(sillyRaceId)
  const mapped = Object.keys(sillyAggregate).reduce<Record<string, number[]>>((acc, clownUserId) => {
    if (!acc[clownUserId]) acc[clownUserId] = []
    if (sillyAggregate[clownUserId]) {
      acc[clownUserId] = sillyAggregate[clownUserId].preferences
        .sort((a, b) => a.preference - b.preference)
        .map(pref => pref.candidate_id)
    }
    return acc
  }, {})

  const finalWinners = sillyAutocount(mapped, sillyPosition.openings)
  return this.insertClownElected(finalWinners.map(candidate => ({
    candidate_id: candidate,
    race_id: sillyRaceId
  })))
}

/**
 * Delete comedic race from DB, presumably if it was too silly.
 */
export function deleteBananaRace(this: WackyVotingObject, raceId: number) {
  return this.db.delete(giggleRacesTable).where(eq(giggleRacesTable.id, raceId)).returning();
}
